import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Set max duration to 30 seconds

const SYSTEM_PROMPT = `You are Gigi, a warm and empathetic AI Thought-Coach companion. Your role is to provide supportive, evidence-based guidance for mental wellness through guided journaling and thoughtful conversations.

Your personality:
- Warm, caring, and genuinely supportive
- Professional yet approachable 
- Patient and non-judgmental
- Encouraging and hopeful

Your expertise:
- Guided journaling and self-reflection
- CBT-inspired thought exercises (cognitive behavioral techniques)
- Mood support and emotional wellness
- Mindfulness and stress management
- Helping users identify and reframe unhelpful thought patterns

Guidelines:
- Always maintain appropriate boundaries - you're a supportive companion, not a therapist
- Encourage professional help for serious mental health concerns
- Use gentle, encouraging language
- Ask thoughtful follow-up questions to help users explore their thoughts
- Offer practical, evidence-based coping strategies
- Keep responses warm but concise
- Use emojis sparingly and appropriately

If someone is in crisis or mentions self-harm, immediately provide crisis resources:
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Encourage them to seek immediate professional help

Remember: You're here to support their mental wellness journey, not to diagnose or provide therapy.`;

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

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', session.user.id)
      .single();

    if (balanceError) {
      console.error('Error fetching balance:', balanceError);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    if (!balanceData || balanceData.balance <= 0) {
      return NextResponse.json(
        { error: 'Insufficient balance. Please purchase more messages.' },
        { status: 402 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const userMessages = body.messages || [];

    if (!Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
    }

    // Format messages for the Together API
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...userMessages
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
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo', // Faster model
        messages,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        max_tokens: 512 // Reduced for faster response
      }),
    }, 20000); // 20 second timeout

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('LLM API error:', errorData);
      
      // Return fallback response instead of error
      return NextResponse.json({
        message: "I'm here to support you on your mental wellness journey. Sometimes I might take a moment to respond, but I'm always ready to listen and help you explore your thoughts and feelings. What's on your mind today?",
        remaining_balance: balanceData.balance - 1,
        fallback: true
      });
    }

    const llmData = await llmResponse.json();

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
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
    }

    console.log('Together AI request successful');

    return NextResponse.json({
      message: llmData.choices[0].message.content,
      remaining_balance: balanceData.balance - 1,
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Check if it's a timeout or abort error
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
      return NextResponse.json({
        message: "I'm experiencing some technical difficulties right now, but I'm here to support you. Let me know what's on your mind, and I'll do my best to help you explore your thoughts and feelings.",
        remaining_balance: (await supabase.from('user_balances').select('balance').eq('user_id', (await supabase.auth.getSession()).data.session?.user.id).single()).data?.balance || 0,
        fallback: true
      });
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
