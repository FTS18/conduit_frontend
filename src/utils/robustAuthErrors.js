/**
 * Robust Auth Error Handler
 * Comprehensive error handling with recovery strategies
 */

export const AuthErrorCode = {
  INVALID_EMAIL: 'invalid_email',
  INVALID_PASSWORD: 'invalid_password',
  USER_NOT_FOUND: 'user_not_found',
  WRONG_PASSWORD: 'wrong_password',
  EMAIL_ALREADY_REGISTERED: 'email_already_registered',
  RATE_LIMITED: 'rate_limited',
  NETWORK_ERROR: 'network_error',
  SESSION_EXPIRED: 'session_expired',
  CSRF_FAILED: 'csrf_failed',
  UNKNOWN: 'unknown_error'
};

export class AuthError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

/**
 * Parse various auth errors and return user-friendly messages
 */
export const parseAuthError = (error) => {
  console.error('[AUTH] Error occurred:', error);

  if (!error) {
    return new AuthError(
      AuthErrorCode.UNKNOWN,
      'An unexpected error occurred. Please try again.'
    );
  }

  // Network errors
  if (error.message?.includes('Network') || error.message?.includes('fetch')) {
    return new AuthError(
      AuthErrorCode.NETWORK_ERROR,
      'Network connection error. Please check your internet connection and try again.',
      { originalError: error.message }
    );
  }

  // Supabase auth errors
  if (error.status === 400) {
    if (error.message?.includes('Invalid email')) {
      return new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        'Please enter a valid email address.'
      );
    }
    if (error.message?.includes('Invalid password')) {
      return new AuthError(
        AuthErrorCode.INVALID_PASSWORD,
        'Password does not meet security requirements.'
      );
    }
    if (error.message?.includes('User already registered')) {
      return new AuthError(
        AuthErrorCode.EMAIL_ALREADY_REGISTERED,
        'This email is already registered. Try logging in instead.'
      );
    }
  }

  if (error.status === 401) {
    if (error.message?.includes('Invalid login credentials')) {
      return new AuthError(
        AuthErrorCode.WRONG_PASSWORD,
        'Invalid email or password. Please try again.'
      );
    }
    return new AuthError(
      AuthErrorCode.SESSION_EXPIRED,
      'Your session has expired. Please login again.'
    );
  }

  if (error.status === 404) {
    return new AuthError(
      AuthErrorCode.USER_NOT_FOUND,
      'No account found with this email. Please register first.'
    );
  }

  if (error.status === 429 || error.message?.includes('Too many')) {
    return new AuthError(
      AuthErrorCode.RATE_LIMITED,
      'Too many login attempts. Please wait before trying again.'
    );
  }

  // Generic error
  return new AuthError(
    AuthErrorCode.UNKNOWN,
    error.message || 'Something went wrong. Please try again later.'
  );
};

/**
 * Get recovery suggestion based on error
 */
export const getRecoverySuggestion = (errorCode) => {
  const suggestions = {
    [AuthErrorCode.INVALID_EMAIL]: {
      action: 'fix_input',
      message: 'Please check your email format (e.g., user@example.com)'
    },
    [AuthErrorCode.INVALID_PASSWORD]: {
      action: 'fix_input',
      message: 'Password must be at least 8 characters with mixed case, numbers, and symbols'
    },
    [AuthErrorCode.WRONG_PASSWORD]: {
      action: 'show_forgot_password',
      message: 'Forgot your password? Click the link below to reset it.'
    },
    [AuthErrorCode.EMAIL_ALREADY_REGISTERED]: {
      action: 'redirect_login',
      message: 'Go to login page to access your account'
    },
    [AuthErrorCode.RATE_LIMITED]: {
      action: 'wait_and_retry',
      message: 'Please wait 15 minutes before attempting again'
    },
    [AuthErrorCode.NETWORK_ERROR]: {
      action: 'check_connection',
      message: 'Check your internet connection and try again'
    },
    [AuthErrorCode.SESSION_EXPIRED]: {
      action: 'redirect_login',
      message: 'Please log in again'
    },
    [AuthErrorCode.CSRF_FAILED]: {
      action: 'refresh_page',
      message: 'Security check failed. Please refresh and try again'
    }
  };

  return suggestions[errorCode] || {
    action: 'retry',
    message: 'Please try again'
  };
};

/**
 * Log auth errors for monitoring
 */
export const logAuthError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    code: error.code,
    message: error.message,
    context,
    userAgent: navigator.userAgent.slice(0, 100),
    url: window.location.href
  };

  // Store in localStorage for debugging (max 10 recent errors)
  try {
    const existing = JSON.parse(localStorage.getItem('auth_errors') || '[]');
    const updated = [errorLog, ...existing].slice(0, 10);
    localStorage.setItem('auth_errors', JSON.stringify(updated));
  } catch (e) {
    console.error('[AUTH] Error logging failed:', e);
  }

  // Could send to backend monitoring service
  console.warn('[AUTH_MONITOR]', errorLog);
};

/**
 * Get recent auth errors for debugging
 */
export const getRecentAuthErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('auth_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear auth error logs
 */
export const clearAuthErrorLogs = () => {
  localStorage.removeItem('auth_errors');
};
