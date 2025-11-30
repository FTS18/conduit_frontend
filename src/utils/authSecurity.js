// Rate limiting for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

export const checkRateLimit = (email) => {
  const key = email.toLowerCase();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt < LOCKOUT_TIME) {
      const remainingTime = Math.ceil((LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
      return { allowed: false, remainingMinutes: remainingTime };
    } else {
      loginAttempts.delete(key);
    }
  }
  
  return { allowed: true, remainingMinutes: 0 };
};

export const recordFailedAttempt = (email) => {
  const key = email.toLowerCase();
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(key, attempts);
};

export const clearFailedAttempts = (email) => {
  loginAttempts.delete(email.toLowerCase());
};

// Device fingerprinting
export const getDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  return btoa(JSON.stringify({
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    canvas: canvas.toDataURL(),
    userAgent: navigator.userAgent.slice(0, 100)
  }));
};

// Password breach check (simplified)
const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123'];
export const checkPasswordBreach = (password) => {
  return commonPasswords.includes(password.toLowerCase());
};