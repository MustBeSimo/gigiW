/**
 * Environment variable validation utilities
 * Ensures all required environment variables are present and valid
 */

/**
 * Get and validate a required environment variable
 * @throws Error if environment variable is not set or empty
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Validate all required environment variables for API operations
 */
export function validateApiEnv(): {
  togetherApiKey: string;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  let togetherApiKey = '';

  try {
    togetherApiKey = getRequiredEnv('TOGETHER_API_KEY');
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error validating TOGETHER_API_KEY');
  }

  return {
    togetherApiKey,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Safely get the Together API key, returning null if not available
 * Instead of throwing, this allows graceful fallback behavior
 */
export function getTogetherApiKey(): string | null {
  const value = process.env.TOGETHER_API_KEY;
  return value && value.trim() !== '' ? value : null;
}
