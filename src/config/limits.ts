/**
 * Message and feature limits configuration
 * Single source of truth for all rate limits and quotas across the application
 */

export const MESSAGE_LIMITS = {
  // Demo users (unauthenticated)
  DEMO_FREE_MESSAGES: 3,

  // New users (just created account)
  NEW_USER_INITIAL_BALANCE: 20,

  // Authenticated users
  AUTHENTICATED_MONTHLY_LIMIT: 1000,

  // Context window sizes (for LLM API calls)
  // How many messages to keep in conversation history
  DEMO_CONTEXT_WINDOW: 4,
  AUTHENTICATED_CONTEXT_WINDOW: 8,
} as const;

// Convenience exports for common checks
export function isAllowedToSendMessage(messageCount: number, isAuthenticated: boolean): boolean {
  if (isAuthenticated) {
    // Authenticated users have their balance checked separately
    return true;
  }
  // Demo users get 3 free messages
  return messageCount < MESSAGE_LIMITS.DEMO_FREE_MESSAGES;
}

export function getDemoMessageLimitRemaining(messageCount: number): number {
  const remaining = MESSAGE_LIMITS.DEMO_FREE_MESSAGES - messageCount;
  return Math.max(0, remaining);
}
