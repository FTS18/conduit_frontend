// Input sanitization to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// Email validation utility - MINIMAL
export const validateEmail = (email) => {
  const trimmed = (email || '').trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(trimmed);
  
  if (!trimmed) return { isValid: false, message: 'Email is required' };
  if (trimmed.length > 254) return { isValid: false, message: 'Email is too long' };
  if (!isValid) return { isValid: false, message: 'Please enter a valid email address' };
  
  return { isValid: true, message: '' };
};

// Password strength validation - NO RESTRICTIONS
// Accept any password, just show strength indicator
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: '', strength: 0 };
  }
  
  // Calculate strength for UI feedback only (no enforcement)
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  
  // Always valid - user can use any password
  return { isValid: true, message: '', strength, missing: [] };
};

// Username validation
export const validateUsername = (username) => {
  if (!username) return { isValid: false, message: 'Username is required' };
  if (username.length < 3) return { isValid: false, message: 'Username must be at least 3 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true, message: '' };
};

// Real-time email verification (basic check)
export const checkEmailFormat = (email) => {
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = email.split('@')[1];
  
  if (domain && commonDomains.includes(domain.toLowerCase())) {
    return { isCommon: true, suggestion: '' };
  }
  
  // Simple typo suggestions
  const typoMap = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  };
  
  if (domain && typoMap[domain.toLowerCase()]) {
    return { 
      isCommon: false, 
      suggestion: `Did you mean ${email.split('@')[0]}@${typoMap[domain.toLowerCase()]}?` 
    };
  }
  
  return { isCommon: false, suggestion: '' };
};