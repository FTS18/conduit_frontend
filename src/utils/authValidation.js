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

// Email validation utility with enhanced checks
export const validateEmail = (email) => {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(sanitized);
  
  if (!sanitized) return { isValid: false, message: 'Email is required' };
  if (sanitized.length > 254) return { isValid: false, message: 'Email is too long' };
  if (!isValid) return { isValid: false, message: 'Please enter a valid email address' };
  
  // Check for disposable email providers
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'maildrop.cc'];
  const domain = sanitized.split('@')[1].toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { isValid: false, message: 'Disposable email addresses are not allowed' };
  }
  
  return { isValid: true, message: '' };
};

// Password strength validation - MUCH STRICTER
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required', strength: 0 };
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters', strength: 0 };
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/,              // All same character (aaaaaa)
    /^1234|^qwerty|^abc|^password/i,  // Common sequences
    /(.)\1{2,}/              // 3+ repeated chars
  ];
  
  if (weakPatterns.some(p => p.test(password))) {
    return { isValid: false, message: 'Password is too weak - avoid patterns', strength: 0 };
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const checks = [hasUpper, hasLower, hasNumber, hasSpecial];
  const strength = checks.filter(Boolean).length;
  
  // Require at least 3 of 4 criteria
  if (strength < 3) {
    const missing = [];
    if (!hasUpper) missing.push('uppercase');
    if (!hasLower) missing.push('lowercase');
    if (!hasNumber) missing.push('numbers');
    if (!hasSpecial) missing.push('special characters');
    
    return { 
      isValid: false, 
      message: `Password needs ${missing.slice(0, 2).join(', ')} for security`, 
      strength,
      missing
    };
  }
  
  // Check for common passwords
  const commonPasswords = ['123456', 'password', '123456789', 'qwerty', 'abc123', '12345678'];
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'This password is too common. Please choose something unique', strength };
  }
  
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