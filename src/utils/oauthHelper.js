/**
 * Google OAuth Helper
 * Handles OAuth flow, session capture, and account creation
 */

import { supabase } from '../supabaseClient';
import agent from '../agent';

export const handleGoogleOAuthLogin = async (isNewUser = false) => {
  try {
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    if (error) {
      console.error('[OAUTH] OAuth error:', error);
      return {
        success: false,
        error: error.message || 'Google OAuth failed. Please try again.',
        code: 'oauth_failed'
      };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('[OAUTH] Exception during OAuth:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      code: 'oauth_exception'
    };
  }
};

/**
 * Handle OAuth callback and create/update user account
 */
export const handleOAuthCallback = async () => {
  try {
    // Get session after OAuth redirect
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[OAUTH] Session error:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    if (!session) {
      console.warn('[OAUTH] No session found after OAuth');
      return { success: false, error: 'OAuth session not found' };
    }
    
    // Session exists, now create/sync account in backend
    const user = session.user;
    const username = user.user_metadata?.full_name || user.email.split('@')[0];
    
    try {
      const loginResult = await agent.Auth.supabaseLogin({
        email: user.email,
        username: username,
        supabaseId: user.id
      });
      
      return { success: true, user: loginResult };
    } catch (backendError) {
      // Backend error - might be duplicate or validation issue
      console.error('[OAUTH] Backend sync error:', backendError);
      
      // Still consider it a success if we have a session
      return {
        success: true,
        user: { email: user.email, username },
        warning: 'Session created but account sync failed'
      };
    }
  } catch (error) {
    console.error('[OAUTH] Callback handler error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify OAuth session is valid
 */
export const verifyOAuthSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('[OAUTH] Verification error:', error);
    return false;
  }
};
