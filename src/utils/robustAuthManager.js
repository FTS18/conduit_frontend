/**
 * Robust Authentication Manager
 * Centralized authentication and session management with enhanced security
 */

import agent from '../agent';
import { clearSession, isSessionValid, setTokenWithExpiry, clearTokenRefresh } from './authSecurity';

class RobustAuthManager {
  constructor() {
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
    this.sessionTimeoutId = null;
    this.warningTimeoutId = null;
    this.isInitialized = false;
    this.listeners = [];
  }

  /**
   * Initialize session monitoring
   */
  initialize() {
    if (this.isInitialized) return;
    
    this.isInitialized = true;
    this.setupActivityListeners();
    this.resetSessionTimer();
    
    console.log('[AUTH] Session manager initialized');
  }

  /**
   * Cleanup and teardown
   */
  destroy() {
    this.clearTimers();
    this.removeActivityListeners();
    this.isInitialized = false;
    clearTokenRefresh();
  }

  /**
   * Setup activity listeners for session reset
   */
  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handler = () => this.resetSessionTimer();
    
    events.forEach(event => {
      document.addEventListener(event, handler, true);
    });
    
    // Store handler for cleanup
    this.activityHandler = handler;
    this.activityEvents = events;
  }

  /**
   * Remove activity listeners
   */
  removeActivityListeners() {
    if (this.activityHandler && this.activityEvents) {
      this.activityEvents.forEach(event => {
        document.removeEventListener(event, this.activityHandler, true);
      });
    }
  }

  /**
   * Reset session timer on user activity
   */
  resetSessionTimer() {
    this.clearTimers();
    
    if (!isSessionValid()) return;
    
    // Schedule warning
    this.warningTimeoutId = setTimeout(() => {
      this.notifyListeners('session_warning', { 
        message: 'Your session will expire in 5 minutes due to inactivity' 
      });
    }, this.sessionTimeout - this.warningTime);
    
    // Schedule session expiry
    this.sessionTimeoutId = setTimeout(() => {
      this.handleSessionExpiry();
    }, this.sessionTimeout);
  }

  /**
   * Handle session expiry
   */
  handleSessionExpiry() {
    console.warn('[AUTH] Session expired due to inactivity');
    clearSession();
    this.notifyListeners('session_expired', { 
      message: 'Your session has expired. Please login again.' 
    });
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.sessionTimeoutId) clearTimeout(this.sessionTimeoutId);
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
  }

  /**
   * Handle successful login
   */
  handleLoginSuccess(token, expiresIn = 24 * 60 * 60) {
    setTokenWithExpiry(token, expiresIn * 1000);
    this.resetSessionTimer();
    this.notifyListeners('login_success', { timestamp: Date.now() });
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.clearTimers();
    clearSession();
    this.notifyListeners('logout', { timestamp: Date.now() });
  }

  /**
   * Subscribe to auth events
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('[AUTH] Listener error:', e);
      }
    });
  }

  /**
   * Verify session is still valid
   */
  validateSession() {
    return isSessionValid();
  }

  /**
   * Get session info
   */
  getSessionInfo() {
    const token = localStorage.getItem('jwt');
    const expiresAt = localStorage.getItem('jwt_expires_at');
    
    return {
      isValid: isSessionValid(),
      token: token ? '***' : null,
      expiresAt: expiresAt ? new Date(parseInt(expiresAt)) : null,
      expiresIn: expiresAt ? Math.max(0, parseInt(expiresAt) - Date.now()) : 0
    };
  }

  /**
   * Extend session
   */
  extendSession(additionalTime = 15 * 60 * 1000) {
    const expiresAt = localStorage.getItem('jwt_expires_at');
    if (expiresAt) {
      const newExpiresAt = Date.now() + additionalTime;
      localStorage.setItem('jwt_expires_at', newExpiresAt.toString());
      this.resetSessionTimer();
      this.notifyListeners('session_extended', { newExpiresAt });
      return true;
    }
    return false;
  }

  /**
   * Force session refresh from backend
   */
  async refreshSession() {
    try {
      const response = await agent.Auth.current();
      if (response && response.user) {
        // Session is valid, reset timers
        this.resetSessionTimer();
        this.notifyListeners('session_refreshed', { timestamp: Date.now() });
        return true;
      }
    } catch (error) {
      console.error('[AUTH] Session refresh failed:', error);
      this.handleSessionExpiry();
      return false;
    }
  }
}

// Export singleton instance
export default new RobustAuthManager();
