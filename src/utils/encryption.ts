/**
 * Client-side encryption utility for sensitive data stored in localStorage
 * Uses a simple XOR-based encryption with localStorage key obfuscation
 *
 * NOTE: This is not military-grade encryption. For highly sensitive data,
 * consider storing on the server instead of in localStorage.
 */

/**
 * Generate a consistent encryption key based on the browser environment
 */
function getStorageKey(): string {
  // Use a combination of userAgent and a fixed app salt
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const appSalt = 'mindgleam-chat-vault';
  return userAgent + appSalt;
}

/**
 * Simple XOR encryption (not suitable for highly sensitive data)
 */
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Encrypt data and encode as base64 for storage
 */
export function encryptForStorage<T extends Record<string, any>>(data: T): string {
  try {
    const jsonString = JSON.stringify(data);
    const key = getStorageKey();
    const encrypted = xorEncrypt(jsonString, key);
    // Base64 encode for safe storage
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback: return unencrypted (better than data loss)
    return btoa(JSON.stringify(data));
  }
}

/**
 * Decrypt data from base64-encoded storage
 */
export function decryptFromStorage<T extends Record<string, any>>(encrypted: string): T | null {
  try {
    const decoded = atob(encrypted);
    const key = getStorageKey();
    const decrypted = xorEncrypt(decoded, key);
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Safely store encrypted data in localStorage
 */
export function setEncryptedStorage<T extends Record<string, any>>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined') return; // Not in browser
    const encrypted = encryptForStorage(data);
    localStorage.setItem(key, encrypted);
  } catch (error) {
    console.error('Error storing encrypted data:', error);
  }
}

/**
 * Safely retrieve and decrypt data from localStorage
 */
export function getEncryptedStorage<T extends Record<string, any>>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null; // Not in browser
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decryptFromStorage<T>(encrypted);
  } catch (error) {
    console.error('Error retrieving encrypted data:', error);
    return null;
  }
}

/**
 * Clear sensitive data from localStorage
 */
export function clearEncryptedStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing encrypted data:', error);
  }
}

/**
 * Auto-clear sensitive data after session ends
 * Call this when user signs out or after inactivity
 */
export function clearSensitiveSessionData(): void {
  const sensitiveKeys = [
    'mindgleam_inline_chat',
    'mindgleam_demo_chat',
  ];

  sensitiveKeys.forEach(key => clearEncryptedStorage(key));
}
