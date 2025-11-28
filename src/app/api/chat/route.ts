import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRoute, ErrorResponses } from '@/utils/supabase-server';
import {
  getUserMemory,
  appendToMemory,
  getInsightExtractionPrompt,
  getCompactionPrompt,
  countWords
} from '@/utils/userMemory';
import { checkRateLimit, createRateLimitResponse, rateLimitConfig } from '@/utils/rateLimit';
import { getTogetherApiKey } from '@/utils/env-validation';
import { AVATAR_PERSONALITIES, getAvatarOrFallback } from '@/config/avatars';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Set max duration to 30 seconds

// Memory configuration
const MEMORY_WORD_LIMIT = 500;

// Crisis resources and safety (shared across all avatars)
const CRISIS_RESOURCES = `\n\nCRISIS PROTOCOL: If someone mentions self-harm, suicide, or crisis, immediately prioritize safety:\n"I'm really concerned about you. Please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741. You deserve support right now. 💙"`;

/**
 * Generate memory-aware system prompt addition
 */
function getMemoryPromptAddition(insights: string | null): string {
  if (!insights || insights.trim() === '') {
    return '';
  }
  
  return `\n\nUSER CONTEXT (from previous conversations - use to personalize responses):
${insights}

Use this context naturally to make responses more personal and relevant. Don't explicitly mention "I remember" or reference past conversations directly.`;
}

/**
 * Extract insights from conversation using AI
 */
async function extractInsights(
  userMessage: string,
  assistantResponse: string,
  existingInsights: string | null
): Promise<string | null> {
  try {
    const prompt = getInsightExtractionPrompt(userMessage, assistantResponse, existingInsights || undefined);
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Low temp for consistent extraction
        max_tokens: 100,
        stream: false
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const insight = data.choices[0]?.message?.content?.trim();
    
    // Filter out "no insight" responses
    if (!insight || insight === 'NO_NEW_INSIGHT' || insight.toLowerCase().includes('no new insight')) {
      return null;
    }
    
    return insight;
  } catch (error) {
    console.error('Error extracting insights:', error);
    return null;
  }
}

/**
 * Compact insights using AI
 */
async function compactInsights(insights: string): Promise<string> {
  try {
    const prompt = getCompactionPrompt(insights);
    
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Very low temp for accurate summarization
        max_tokens: 150,
        stream: false
      }),
    });

    if (!response.ok) {
      console.error('Compaction API failed');
      return insights; // Return original if compaction fails
    }

    const data = await response.json();
    const compacted = data.choices[0]?.message?.content?.trim();
    
    return compacted || insights;
  } catch (error) {
    console.error('Error compacting insights:', error);
    return insights;
  }
}

// Conversion prompts for demo users
const CONVERSION_MESSAGES = {
  subtle: [
    "💭 Enjoying our chat? Create an account to unlock unlimited conversations!",
    "✨ Want to continue this conversation anytime? Sign up for full access!",
    "🌟 Ready for deeper conversations? Join MindGleam for unlimited chats!"
  ],
  direct: [
    "🚀 You're on a roll! Sign up now to keep the conversation going without limits.",
    "💫 Love chatting with me? Create your account for unlimited access to all avatars!",
    "🎯 Ready to unlock the full MindGleam experience? Sign up takes just 30 seconds!"
  ]
};

// Helper function to create fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 25000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Smart conversion tracking for demo users
function getConversionTrigger(messageCount: number) {
  if (messageCount < 3) return null;

  // Progressive conversion strategy
  if (messageCount === 3) {
    return {
      show: Math.random() < 0.4, // 40% chance at 3rd message
      type: 'subtle',
      message: CONVERSION_MESSAGES.subtle[Math.floor(Math.random() * CONVERSION_MESSAGES.subtle.length)]
    };
  }

  if (messageCount >= 5) {
    return {
      show: Math.random() < 0.6, // 60% chance at 5+ messages
      type: 'direct',
      message: CONVERSION_MESSAGES.direct[Math.floor(Math.random() * CONVERSION_MESSAGES.direct.length)]
    };
  }

  return {
    show: Math.random() < 0.3, // 30% chance for messages 4
    type: 'subtle',
    message: CONVERSION_MESSAGES.subtle[Math.floor(Math.random() * CONVERSION_MESSAGES.subtle.length)]
  };
}

// Get avatar metadata for UI
function getAvatarInfo(avatarId: string) {
  const avatar = AVATAR_PERSONALITIES[avatarId as keyof typeof AVATAR_PERSONALITIES];
  if (!avatar) return null;

  return {
    id: avatarId,
    emoji: avatar.emoji,
    type: avatar.type,
    description: avatar.description
  };
}

// Get all avatars for selection UI
function getAllAvatars() {
  return Object.keys(AVATAR_PERSONALITIES).map(id => getAvatarInfo(id)).filter(Boolean);
}

// GET endpoint for avatar information
export async function GET() {
  try {
    return NextResponse.json({
      avatars: getAllAvatars(),
      success: true
    });
  } catch (error) {
    console.error('Error fetching avatar info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate required environment variables
    const apiKey = getTogetherApiKey();
    if (!apiKey) {
      console.error('Missing TOGETHER_API_KEY environment variable');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Check rate limits
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, rateLimitConfig.authenticated);
    }

    // Parse the request body first to check if it's a demo request
    const body = await request.json();
    const isDemo = body.isDemo === true;
    
    // Handle demo requests without authentication
    if (isDemo) {
      const userMessages = body.messages || [];
      const selectedAvatar = body.selectedAvatar || 'lumo';
      const messageCount = body.messageCount || 0;

      if (!Array.isArray(userMessages) || userMessages.length === 0) {
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
      }

      // Get avatar personality
      const avatarPersonality = AVATAR_PERSONALITIES[selectedAvatar as keyof typeof AVATAR_PERSONALITIES] || AVATAR_PERSONALITIES.lumo;

      // Optimize engagement based on conversation stage
      let engagementBoost = '';
      if (messageCount === 0) {
        engagementBoost = '\n\nFIRST INTERACTION: Be extra welcoming and engaging. Show your unique personality immediately and ask an interesting follow-up question.';
      } else if (messageCount <= 2) {
        engagementBoost = '\n\nEARLY CONVERSATION: Build rapport and show genuine interest. Ask thoughtful questions to keep them engaged.';
      } else if (messageCount >= 3) {
        engagementBoost = '\n\nENGAGED USER: They\'re enjoying the conversation. Provide deeper value while staying true to your personality. Be authentic and genuinely helpful.';
      }

      console.log(`Making Together AI request for demo with avatar: ${selectedAvatar}`);

      // Call the Together API with timeout for demo
      try {
        const llmResponse = await fetchWithTimeout('https://api.together.xyz/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
            messages: [
              {
                role: 'system',
                content: avatarPersonality.systemPrompt + CRISIS_RESOURCES + engagementBoost
              },
              ...userMessages.slice(-4) // Keep 4 messages for better context in simplified flow
            ],
            temperature: 0.85, // Optimized for engaging, personality-rich responses
            top_p: 0.9,
            top_k: 40,
            repetition_penalty: 1.15, // Reduce repetition for more varied responses
            max_tokens: 80, // Very concise, snappy responses
            stream: false
          }),
        }, 10000); // 10 second timeout for snappy chat experience

      if (!llmResponse.ok) {
        const errorData = await llmResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Demo LLM API error:', {
          status: llmResponse.status,
          statusText: llmResponse.statusText,
          errorData,
          apiKeyExists: !!process.env.TOGETHER_API_KEY,
          apiKeyLength: process.env.TOGETHER_API_KEY?.length || 0
        });

        // Return personalized fallback response based on avatar
        const avatarPersonality = AVATAR_PERSONALITIES[selectedAvatar as keyof typeof AVATAR_PERSONALITIES] || AVATAR_PERSONALITIES.lumo;
        const fallbackResponses = {
          gigi: "I'm here for you 💕 Sometimes I need a moment to gather my thoughts, but I'm always ready to listen. What's on your heart today?",
          vee: "Let me think through this with you 🧠 I'm having a small technical moment, but I'm here to help you problem-solve. What's the main challenge you're facing?",
          lumo: "Hey there! ✨ I'm having a quick tech hiccup, but I'm excited to chat with you. What's sparking your interest today?"
        };

        return NextResponse.json({
          message: fallbackResponses[selectedAvatar as keyof typeof fallbackResponses] || fallbackResponses.lumo,
          isDemo: true,
          avatar: selectedAvatar,
          fallback: true,
          messageCount: messageCount + 1,
          debugInfo: process.env.NODE_ENV === 'development' ? `API Error: ${llmResponse.status}` : undefined
        });
      }

      const llmData = await llmResponse.json();
      console.log('Demo Together AI request successful');

      // Smart conversion tracking based on engagement
      const conversionTrigger = getConversionTrigger(messageCount);

      return NextResponse.json({
        message: llmData.choices[0].message.content,
        isDemo: true,
        avatar: selectedAvatar,
        messageCount: messageCount + 1,
        conversion: conversionTrigger
      });
      
      } catch (demoError) {
        console.error('Demo API request failed:', {
          error: demoError,
          message: demoError instanceof Error ? demoError.message : 'Unknown error',
          apiKeyExists: !!process.env.TOGETHER_API_KEY
        });

        // Return personalized fallback response
        const avatarPersonality = AVATAR_PERSONALITIES[selectedAvatar as keyof typeof AVATAR_PERSONALITIES] || AVATAR_PERSONALITIES.lumo;
        const errorFallbacks = {
          gigi: "I'm experiencing a moment of connection trouble, but I'm still here for you 💕 What's been on your mind lately?",
          vee: "Having a technical issue, but let's work through this together 🧠 What's the situation you'd like to tackle?",
          lumo: "Quick tech hiccup on my end! ✨ But I'm still excited to chat - what's inspiring you today?"
        };

        return NextResponse.json({
          message: errorFallbacks[selectedAvatar as keyof typeof errorFallbacks] || errorFallbacks.lumo,
          isDemo: true,
          avatar: selectedAvatar,
          fallback: true,
          messageCount: messageCount + 1,
          debugInfo: process.env.NODE_ENV === 'development' && demoError instanceof Error ? demoError.message : undefined
        });
      }
    }

    // Handle authenticated requests (existing logic)
    const { response, session, supabase } = await authenticateApiRoute();
    if (response) return response;

    // Get user's balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', session.user.id)
      .single();

    if (balanceError) {
      console.error('Error fetching balance:', balanceError);
      return ErrorResponses.serverError('Failed to fetch balance');
    }

    if (!balanceData || balanceData.balance <= 0) {
      return ErrorResponses.paymentRequired('Insufficient balance. Please purchase more messages.');
    }

    const userMessages = body.messages || [];

    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return ErrorResponses.badRequest('Invalid message format. Expected array of messages.');
    }

    // Get avatar personality for authenticated users
    const selectedAvatar = body.selectedAvatar || 'lumo';
    const avatarPersonality = AVATAR_PERSONALITIES[selectedAvatar as keyof typeof AVATAR_PERSONALITIES] || AVATAR_PERSONALITIES.lumo;

    // Load user memory for personalization
    const userMemory = await getUserMemory(supabase, session.user.id);
    const memoryContext = getMemoryPromptAddition(userMemory?.insights || null);

    // Format messages for the Together API with memory context
    const messages = [
      {
        role: 'system',
        content: avatarPersonality.systemPrompt + CRISIS_RESOURCES + memoryContext + '\n\nIMPORTANT: Provide thoughtful, helpful responses since this is a paying user. Be authentic to your personality while being genuinely supportive.'
      },
      ...userMessages.slice(-8) // Keep more context for paid users
    ];

    console.log('Making Together AI request...');

    // Call the Together API with timeout
    const llmResponse = await fetchWithTimeout('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages,
        temperature: 0.8, // Balanced creativity for authentic responses
        top_p: 0.9,
        top_k: 40,
        repetition_penalty: 1.15, // Better response variety
        max_tokens: 150, // Shorter, more focused responses
        stream: false
      }),
    }, 15000); // 15 second timeout for good user experience

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('LLM API error:', errorData);
      
      // Return personalized fallback response for paid users
      const avatarPersonality = AVATAR_PERSONALITIES[selectedAvatar as keyof typeof AVATAR_PERSONALITIES] || AVATAR_PERSONALITIES.lumo;
      const paidFallbacks = {
        gigi: "I'm here for you, even when technology gets a bit wobbly 💕 What's been on your heart lately?",
        vee: "Technical glitch on my end, but I'm ready to think through whatever's challenging you 🧠",
        lumo: "Having a small tech moment, but I'm still energized to help you explore new possibilities! ✨"
      };

      return NextResponse.json({
        message: paidFallbacks[selectedAvatar as keyof typeof paidFallbacks] || paidFallbacks.lumo,
        avatar: selectedAvatar,
        remaining_balance: balanceData.balance - 1,
        fallback: true,
        isAuthenticated: true
      });
    }

    const llmData = await llmResponse.json();
    const assistantMessage = llmData.choices[0].message.content;

    // Deduct one message from balance
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({ 
        balance: balanceData.balance - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return ErrorResponses.serverError('Failed to update balance');
    }

    console.log('Together AI request successful');

    // Extract and store insights in background (non-blocking)
    // This learns about the user over time for better personalization
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    // Fire and forget - don't await to keep response fast
    (async () => {
      try {
        const newInsight = await extractInsights(
          lastUserMessage,
          assistantMessage,
          userMemory?.insights || null
        );
        
        if (newInsight) {
          await appendToMemory(
            supabase,
            session.user.id,
            newInsight,
            compactInsights // Pass compaction function
          );
          console.log('User insight stored:', newInsight.substring(0, 50) + '...');
        }
      } catch (memoryError) {
        console.error('Background memory update failed:', memoryError);
        // Non-critical - don't fail the response
      }
    })();

    return NextResponse.json({
      message: assistantMessage,
      avatar: selectedAvatar,
      remaining_balance: balanceData.balance - 1,
      isAuthenticated: true,
      hasMemory: !!userMemory?.insights
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Handle specific error types with avatar-appropriate responses
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      return NextResponse.json({
        message: "I'm having a quick technical moment, but I'm still here for you! ✨ What's on your mind?",
        fallback: true,
        error: 'timeout'
      });
    }
    
    return NextResponse.json({
      error: 'Chat service temporarily unavailable',
      message: 'I\'m having a brief technical moment, but I\'ll be back soon! Please try again in a moment. ✨'
    }, { status: 500 });
  }
}
