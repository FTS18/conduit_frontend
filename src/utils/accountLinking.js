import { supabase } from '../supabaseClient';
import agent from '../agent';

// Handle account linking for same email with different auth methods
export const handleAccountLinking = async (email, authMethod, userData = {}) => {
  try {
    // Check if user exists with this email
    const existingUser = await agent.Auth.checkUserExists(email);
    
    if (existingUser) {
      // User exists - handle linking
      if (existingUser.authMethods && existingUser.authMethods.includes(authMethod)) {
        // Same auth method - normal login
        return { success: true, action: 'login', user: existingUser };
      } else {
        // Different auth method - offer to link accounts
        return {
          success: false,
          action: 'link_required',
          message: `An account with ${email} already exists. Would you like to link your ${authMethod} account?`,
          existingUser,
          newAuthMethod: authMethod
        };
      }
    } else {
      // New user - create account
      return { success: true, action: 'register', user: null };
    }
  } catch (error) {
    console.error('Account linking check failed:', error);
    return { success: true, action: 'register', user: null }; // Default to register on error
  }
};

// Link social account to existing email/password account
export const linkSocialAccount = async (email, password, socialAuthMethod, socialData) => {
  try {
    // First verify the existing account with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      throw new Error('Invalid password for existing account');
    }
    
    // Update user metadata to include new auth method
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        authMethods: [...(authData.user.user_metadata.authMethods || ['email']), socialAuthMethod],
        [`${socialAuthMethod}_linked`]: true,
        [`${socialAuthMethod}_data`]: socialData
      }
    });
    
    if (updateError) throw updateError;
    
    return {
      success: true,
      message: `${socialAuthMethod} account successfully linked!`,
      user: authData.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to link accounts'
    };
  }
};

// Convert social login to email/password account
export const convertToEmailPassword = async (socialUser, password) => {
  try {
    const email = socialUser.email;
    
    // Create new email/password account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: socialUser.user_metadata?.username || email.split('@')[0],
          authMethods: ['email', socialUser.app_metadata?.provider],
          converted_from: socialUser.app_metadata?.provider,
          social_data: socialUser.user_metadata
        }
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Account converted successfully! Please verify your email.',
      user: data.user
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to convert account'
    };
  }
};