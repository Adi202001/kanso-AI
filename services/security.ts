
/**
 * Security & Rate Limiting Utilities
 * 
 * Note: In a production environment, rate limiting should be performed 
 * on the server-side or edge proxy to effectively protect API keys.
 * This client-side implementation serves as a UI safeguard, cost control, 
 * and abuse prevention mechanism for the browser session.
 */

// Configuration
const AI_REQUESTS_LIMIT = 10; // Max requests per window
const AI_WINDOW_MS = 60 * 1000; // 1 minute window
const AUTH_ATTEMPTS_LIMIT = 5; // Max login attempts
const AUTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_INPUT_LENGTH = 2500; // Hard limit on input characters to prevent context overflow

class RateLimiter {
  private timestamps: number[] = [];
  private limit: number;
  private window: number;
  private storageKey: string;

  constructor(limit: number, windowMs: number, key: string) {
    this.limit = limit;
    this.window = windowMs;
    this.storageKey = `kanso_rl_${key}`;
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.timestamps = JSON.parse(stored);
      }
    } catch (e) {
      this.timestamps = [];
    }
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.timestamps));
  }

  /**
   * Checks if a request is allowed. 
   * @returns true if allowed, false if limit exceeded.
   */
  check(): boolean {
    const now = Date.now();
    // Filter out timestamps older than the window
    this.timestamps = this.timestamps.filter(t => now - t < this.window);
    
    if (this.timestamps.length >= this.limit) {
      this.save();
      return false;
    }
    
    this.timestamps.push(now);
    this.save();
    return true;
  }
  
  /**
   * Returns seconds until the next request is allowed.
   */
  getTimeToReset(): number {
     if (this.timestamps.length === 0) return 0;
     const now = Date.now();
     // Sort to find the oldest relevant timestamp
     const sorted = [...this.timestamps].sort((a,b) => a - b);
     if (sorted.length < this.limit) return 0;
     
     // The slot frees up when the oldest timestamp expires
     const oldest = sorted[0];
     const resetTime = oldest + this.window;
     return Math.max(0, Math.ceil((resetTime - now) / 1000));
  }

  reset() {
    this.timestamps = [];
    this.save();
  }
}

// Instantiate limiters
export const aiRateLimiter = new RateLimiter(AI_REQUESTS_LIMIT, AI_WINDOW_MS, 'ai');
export const authRateLimiter = new RateLimiter(AUTH_ATTEMPTS_LIMIT, AUTH_WINDOW_MS, 'auth');

/**
 * Sanitizes user input to prevent massive payloads or basic injection attempts.
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return "";
  
  // 1. Trim whitespace
  let clean = input.trim();
  
  // 2. Enforce max length
  if (clean.length > MAX_INPUT_LENGTH) {
    console.warn(`[Security] Input truncated from ${clean.length} to ${MAX_INPUT_LENGTH} characters.`);
    clean = clean.substring(0, MAX_INPUT_LENGTH);
  }
  
  // 3. (Optional) Basic character filtering if needed, 
  // but GenAI handles most text well. We mostly care about length here.
  
  return clean;
};

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityError";
  }
}

/* --- Password Hashing Utilities (Web Crypto API) --- */

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const tokens = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(tokens.map(byte => parseInt(byte, 16)));
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', 
    encoder.encode(password), 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveBits', 'deriveKey']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, 
    key, 
    256
  );
  
  return {
    hash: bufferToHex(hashBuffer),
    salt: bufferToHex(salt)
  };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const salt = hexToBuffer(storedSalt);
  const key = await crypto.subtle.importKey(
    'raw', 
    encoder.encode(password), 
    { name: 'PBKDF2' }, 
    false, 
    ['deriveBits', 'deriveKey']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, 
    key, 
    256
  );
  
  return bufferToHex(hashBuffer) === storedHash;
}
