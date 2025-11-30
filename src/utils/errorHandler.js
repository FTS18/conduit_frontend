// Centralized error handling utility

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

export const getErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

  // Handle network errors
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Handle timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // Handle HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Handle API response errors
  if (error.response?.body?.errors) {
    const errors = error.response.body.errors;
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
    return errors;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

// Retry logic with exponential backoff
export const retryWithBackoff = async (
  fn,
  maxRetries = 3,
  initialDelay = 1000
) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Safe API call wrapper
export const safeApiCall = async (apiCall, onError) => {
  try {
    return await apiCall();
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('API Error:', error);
    if (onError) {
      onError(message);
    }
    throw error;
  }
};

// Validate required fields
export const validateRequired = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} is required`;
    }
  });

  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate URL format
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 5000); // Limit length
};

// Handle form errors
export const handleFormErrors = (errors) => {
  if (!errors) return {};
  
  if (typeof errors === 'string') {
    return { general: errors };
  }

  if (Array.isArray(errors)) {
    return { general: errors.join(', ') };
  }

  return errors;
};
