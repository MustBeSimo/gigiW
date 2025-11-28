/**
 * User Memory System
 * 
 * Manages user insights/traits extracted from conversations.
 * Implements automatic compaction when word limit is reached.
 * 
 * Flow:
 * 1. After each conversation, extract key insights
 * 2. Append to user's memory
 * 3. When word count > 500, compact to ~100 words (80% reduction)
 * 4. Repeat cycle
 * 
 * COMPLIANCE: This stores sensitive user data.
 * See mind_gleam_global_compliance_blueprint.md Section 5
 */

import { SupabaseClient } from '@supabase/supabase-js';

// Configuration
const WORD_LIMIT = 500;
const COMPACTION_TARGET = 100; // ~80% reduction
const COMPACTION_THRESHOLD = 0.8; // Trigger when 80% full (400 words)

export interface UserMemory {
  user_id: string;
  insights: string;
  word_count: number;
  compaction_count: number;
  last_compacted_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Fetch user's current memory/insights
 */
export async function getUserMemory(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMemory | null> {
  const { data, error } = await supabase
    .from('user_memory')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user memory:', error);
    return null;
  }

  return data;
}

/**
 * Initialize memory for a new user
 */
export async function initializeUserMemory(
  supabase: SupabaseClient,
  userId: string
): Promise<UserMemory | null> {
  const { data, error } = await supabase
    .from('user_memory')
    .upsert({
      user_id: userId,
      insights: '',
      word_count: 0,
      compaction_count: 0
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error initializing user memory:', error);
    return null;
  }

  return data;
}

/**
 * Append new insights to user memory
 * Triggers compaction if word limit is exceeded
 */
export async function appendToMemory(
  supabase: SupabaseClient,
  userId: string,
  newInsights: string,
  compactFn?: (insights: string) => Promise<string>
): Promise<{ success: boolean; wasCompacted: boolean }> {
  // Get current memory
  let memory = await getUserMemory(supabase, userId);
  
  // Initialize if doesn't exist
  if (!memory) {
    memory = await initializeUserMemory(supabase, userId);
    if (!memory) {
      return { success: false, wasCompacted: false };
    }
  }

  // Combine existing insights with new ones
  const combinedInsights = memory.insights
    ? `${memory.insights}\n${newInsights}`
    : newInsights;
  
  const newWordCount = countWords(combinedInsights);
  let wasCompacted = false;

  // Check if compaction is needed
  if (newWordCount >= WORD_LIMIT && compactFn) {
    // Compact the insights
    const compactedInsights = await compactFn(combinedInsights);
    const compactedWordCount = countWords(compactedInsights);

    const { error } = await supabase
      .from('user_memory')
      .update({
        insights: compactedInsights,
        word_count: compactedWordCount,
        compaction_count: (memory.compaction_count || 0) + 1,
        last_compacted_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating compacted memory:', error);
      return { success: false, wasCompacted: false };
    }

    wasCompacted = true;
  } else {
    // Just append without compaction
    const { error } = await supabase
      .from('user_memory')
      .update({
        insights: combinedInsights,
        word_count: newWordCount
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error appending to memory:', error);
      return { success: false, wasCompacted: false };
    }
  }

  return { success: true, wasCompacted };
}

/**
 * Generate the prompt for extracting insights from a conversation
 */
export function getInsightExtractionPrompt(
  userMessage: string,
  assistantResponse: string,
  existingInsights?: string
): string {
  return `Analyze this conversation exchange and extract any meaningful insights about the user.

CONVERSATION:
User: ${userMessage}
Assistant: ${assistantResponse}

${existingInsights ? `EXISTING INSIGHTS ABOUT USER:\n${existingInsights}\n\n` : ''}

Extract ONLY new, meaningful insights not already captured. Focus on:
- Emotional patterns and tendencies
- Preferences (communication style, topics of interest)
- Personal circumstances mentioned
- Coping mechanisms they use
- Goals and aspirations
- Challenges they face
- Personality traits observed

RULES:
- Be brief and factual (max 2-3 sentences)
- Only note genuinely new information
- Use third person ("User prefers...", "User tends to...")
- If no significant new insight, respond with "NO_NEW_INSIGHT"
- Do NOT include the conversation content itself
- Do NOT include generic observations

OUTPUT FORMAT:
Just the insight text, nothing else. No labels or prefixes.`;
}

/**
 * Generate the prompt for compacting accumulated insights
 */
export function getCompactionPrompt(insights: string): string {
  return `You are compacting user insights to preserve the most important information while reducing word count by 80%.

ACCUMULATED INSIGHTS (${countWords(insights)} words):
${insights}

TASK:
Summarize these insights into approximately ${COMPACTION_TARGET} words, preserving:
1. Core personality traits and patterns
2. Key preferences and communication style
3. Important personal circumstances
4. Significant emotional patterns
5. Main goals or challenges

RULES:
- Target: ~${COMPACTION_TARGET} words (must be under ${COMPACTION_TARGET + 20})
- Merge similar insights
- Remove redundant information
- Keep most recent/relevant details
- Maintain third person ("User is...", "User prefers...")
- Preserve actionable information for future conversations

OUTPUT:
Just the compacted insights, no preamble or explanation.`;
}

/**
 * Clear user memory (for privacy/data deletion requests)
 * GDPR/APP compliance: users have right to deletion
 */
export async function clearUserMemory(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_memory')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing user memory:', error);
    return false;
  }

  return true;
}

/**
 * Export user memory (for privacy/data access requests)
 * GDPR/APP compliance: users have right to access their data
 */
export async function exportUserMemory(
  supabase: SupabaseClient,
  userId: string
): Promise<{ insights: string; metadata: Record<string, unknown> } | null> {
  const memory = await getUserMemory(supabase, userId);
  
  if (!memory) {
    return null;
  }

  return {
    insights: memory.insights,
    metadata: {
      word_count: memory.word_count,
      compaction_count: memory.compaction_count,
      last_compacted_at: memory.last_compacted_at,
      created_at: memory.created_at,
      updated_at: memory.updated_at
    }
  };
}

/**
 * Get memory stats for user dashboard
 */
export function getMemoryStats(memory: UserMemory | null): {
  hasMemory: boolean;
  wordCount: number;
  capacityUsed: number; // 0-100%
  compactionCount: number;
  needsCompaction: boolean;
} {
  if (!memory) {
    return {
      hasMemory: false,
      wordCount: 0,
      capacityUsed: 0,
      compactionCount: 0,
      needsCompaction: false
    };
  }

  const capacityUsed = Math.round((memory.word_count / WORD_LIMIT) * 100);
  
  return {
    hasMemory: true,
    wordCount: memory.word_count,
    capacityUsed: Math.min(capacityUsed, 100),
    compactionCount: memory.compaction_count,
    needsCompaction: memory.word_count >= WORD_LIMIT * COMPACTION_THRESHOLD
  };
}

