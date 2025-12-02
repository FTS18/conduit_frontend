// ===== CSRF PROTECTION =====
let csrfToken = null;

export const generateCSRFToken = () => {
  if (csrfToken) return csrfToken;
  csrfToken = generateRandomToken(32);
  sessionStorage.setItem('csrf_token', csrfToken);
  return csrfToken;
};

export const getCSRFToken = () => {
  if (!csrfToken) {
    csrfToken = sessionStorage.getItem('csrf_token') || generateRandomToken(32);
    sessionStorage.setItem('csrf_token', csrfToken);
  }
  return csrfToken;
};

export const validateCSRFToken = (token) => {
  return token === getCSRFToken();
};

// ===== UTILITY FUNCTIONS =====
function generateRandomToken(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}

// ===== RATE LIMITING =====

// Rate limiting for login attempts with progressive delays
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
const MAX_LOCKOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Progressive backoff: 15min -> 30min -> 1hour -> 2hours -> 4hours -> 8hours -> 24hours
const getProgressiveBackoff = (attemptCount) => {
  const multiplier = Math.min(Math.pow(2, attemptCount - MAX_ATTEMPTS), 16);
  return Math.min(BASE_LOCKOUT_TIME * multiplier, MAX_LOCKOUT_TIME);
};

export const checkRateLimit = (email) => {
  const key = email.toLowerCase();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0, blockedUntil: 0 };
  
  // Check if currently blocked
  if (attempts.blockedUntil && Date.now() < attempts.blockedUntil) {
    const remainingMs = attempts.blockedUntil - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { allowed: false, remainingMinutes, remainingSeconds: Math.ceil(remainingMs / 1000) };
  }
  
  // Reset if lockout period expired
  if (attempts.blockedUntil && Date.now() >= attempts.blockedUntil) {
    loginAttempts.delete(key);
    return { allowed: true, remainingMinutes: 0 };
  }
  
  return { allowed: true, remainingMinutes: 0 };
};

export const recordFailedAttempt = (email) => {
  const key = email.toLowerCase();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0, blockedUntil: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  
  // Lock account after MAX_ATTEMPTS
  if (attempts.count >= MAX_ATTEMPTS) {
    const lockoutDuration = getProgressiveBackoff(attempts.count);
    attempts.blockedUntil = Date.now() + lockoutDuration;
  }
  
  loginAttempts.set(key, attempts);
  
  // Log failed attempt (could send to backend)
  console.warn(`[AUTH] Failed login attempt for ${key}. Attempts: ${attempts.count}`);
};

export const clearFailedAttempts = (email) => {
  loginAttempts.delete(email.toLowerCase());
};

// Device fingerprinting with enhanced checks
export const getDeviceFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages?.join(',') || navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      userAgent: navigator.userAgent.slice(0, 100),
      canvas: canvas.toDataURL().slice(0, 50),
      timestamp: new Date().getTime()
    };
    
    return btoa(JSON.stringify(fingerprint));
  } catch (e) {
    console.error('[AUTH] Device fingerprinting error:', e);
    return btoa(JSON.stringify({ error: 'fingerprint_failed' }));
  }
};

// Verify device fingerprint hasn't changed
export const verifyDeviceFingerprint = (storedFingerprint) => {
  try {
    const currentFingerprint = getDeviceFingerprint();
    const current = JSON.parse(atob(currentFingerprint));
    const stored = JSON.parse(atob(storedFingerprint));
    
    // Check critical properties
    const isValid = 
      current.screen === stored.screen &&
      current.timezone === stored.timezone &&
      current.platform === stored.platform;
    
    return isValid;
  } catch (e) {
    console.error('[AUTH] Device fingerprint verification error:', e);
    return false;
  }
};

// Password breach check - DISABLED
// Let users choose any password they want
export const checkPasswordBreach = (password) => {
  // No validation - user can store any password they like
  return { isBreach: false, reason: '' };
};

// ===== SESSION VALIDATION =====
export const isSessionValid = () => {
  const token = localStorage.getItem('jwt');
  const expiresAt = localStorage.getItem('jwt_expires_at');
  
  if (!token || !expiresAt) return false;
  
  // Check if token is expired
  if (Date.now() >= parseInt(expiresAt)) {
    clearSession();
    return false;
  }
  
  return true;
};

export const clearSession = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('jwt_expires_at');
  localStorage.removeItem('deviceFingerprint');
  localStorage.removeItem('user_email');
  sessionStorage.removeItem('csrf_token');
};

// ===== TOKEN MANAGEMENT =====
export const setTokenWithExpiry = (token, expiresIn = 24 * 60 * 60 * 1000) => {
  const expiresAt = Date.now() + expiresIn;
  localStorage.setItem('jwt', token);
  localStorage.setItem('jwt_expires_at', expiresAt.toString());
  
  // Set refresh timeout (refresh 5 minutes before expiry)
  const refreshTime = expiresIn - (5 * 60 * 1000);
  if (refreshTime > 0) {
    scheduleTokenRefresh(refreshTime);
  }
};

let tokenRefreshTimeout = null;

const scheduleTokenRefresh = (delay) => {
  if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
  
  tokenRefreshTimeout = setTimeout(() => {
    console.log('[AUTH] Token refresh scheduled');
    // Emit event for token refresh
    window.dispatchEvent(new CustomEvent('token_refresh_needed', { detail: { timestamp: Date.now() } }));
  }, delay);
};

export const clearTokenRefresh = () => {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
    tokenRefreshTimeout = null;
  }
};