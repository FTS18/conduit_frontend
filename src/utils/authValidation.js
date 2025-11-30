// Email validation utility
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!isValid) return { isValid: false, message: 'Please enter a valid email address' };
  
  return { isValid: true, message: '' };
};

// Password strength validation
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required', strength: 0 };
  
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const checks = [minLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const strength = checks.filter(Boolean).length;
  
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters', strength: 0 };
  }
  
  if (strength < 3) {
    return { 
      isValid: false, 
      message: 'Password should include uppercase, lowercase, and numbers', 
      strength 
    };
  }
  
  return { isValid: true, message: '', strength };
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