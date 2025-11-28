import { NextRequest, NextResponse } from 'next/server';

// Configuration for rate limits
const RATE_LIMIT_CONFIG = {
  // Authenticated users: 30 requests per minute
  authenticated: {
    requestsPerWindow: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  // Unauthenticated users: 5 requests per minute
  unauthenticated: {
    requestsPerWindow: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  // Expensive operations (mood report, PDF): 10 per hour
  expensive: {
    requestsPerWindow: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

// Simple in-memory store (resets on server restart)
// In production with multiple instances, use Redis/Upstash
const requestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Clean up old entries to prevent memory leaks
 */
function cleanupStore() {
  const now = Date.now();
  const entries = Array.from(requestStore.entries());
  for (const [key, value] of entries) {
    if (now > value.resetTime) {
      requestStore.delete(key);
    }
  }
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

/**
 * Rate limit a request
 * @param request - NextRequest object
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for authenticated requests
 * @returns { allowed: boolean; remaining: number; resetTime: number } or null if not rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  config: typeof RATE_LIMIT_CONFIG.authenticated = RATE_LIMIT_CONFIG.authenticated,
  userId?: string
): { allowed: boolean; remaining: number; resetTime: number } {
  const clientIp = getClientIp(request);
  const key = userId ? `user:${userId}` : `ip:${clientIp}`;
  const now = Date.now();

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupStore();
  }

  let entry = requestStore.get(key);

  // Initialize or reset window
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  const isAllowed = entry.count < config.requestsPerWindow;
  entry.count++;

  requestStore.set(key, entry);

  return {
    allowed: isAllowed,
    remaining: Math.max(0, config.requestsPerWindow - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Middleware for protecting API routes with rate limiting
 */
export function createRateLimitResponse(
  rateLimit: { allowed: boolean; remaining: number; resetTime: number },
  config: typeof RATE_LIMIT_CONFIG.authenticated = RATE_LIMIT_CONFIG.authenticated
): NextResponse | null {
  if (rateLimit.allowed) {
    return null; // Request allowed, continue
  }

  const resetTime = new Date(rateLimit.resetTime).toISOString();
  const resetInSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${resetInSeconds} seconds.`,
      resetTime,
    },
    {
      status: 429,
      headers: {
        'Retry-After': resetInSeconds.toString(),
        'X-RateLimit-Limit': config.requestsPerWindow.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    }
  );
}

export const rateLimitConfig = RATE_LIMIT_CONFIG;
