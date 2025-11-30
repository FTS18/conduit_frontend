// Session management and security
export class SessionManager {
  static SESSION_KEY = 'user_session';
  static ACTIVITY_KEY = 'last_activity';
  static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  static WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  static startSession(userData) {
    const sessionData = {
      ...userData,
      startTime: Date.now(),
      lastActivity: Date.now(),
      deviceFingerprint: this.getDeviceFingerprint()
    };
    
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
    
    this.startActivityMonitoring();
  }

  static updateActivity() {
    const now = Date.now();
    localStorage.setItem(this.ACTIVITY_KEY, now.toString());
    
    const session = this.getSession();
    if (session) {
      session.lastActivity = now;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }
  }

  static getSession() {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch {
      return null;
    }
  }

  static isSessionValid() {
    const session = this.getSession();
    if (!session) return false;
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    return timeSinceActivity < this.SESSION_TIMEOUT;
  }

  static getTimeUntilExpiry() {
    const session = this.getSession();
    if (!session) return 0;
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    return Math.max(0, this.SESSION_TIMEOUT - timeSinceActivity);
  }

  static shouldShowWarning() {
    const timeLeft = this.getTimeUntilExpiry();
    return timeLeft > 0 && timeLeft <= this.WARNING_TIME;
  }

  static extendSession() {
    this.updateActivity();
  }

  static endSession() {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ACTIVITY_KEY);
    localStorage.removeItem('deviceTrusted');
  }

  static startActivityMonitoring() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check session validity periodically
    setInterval(() => {
      if (!this.isSessionValid()) {
        this.endSession();
        window.location.href = '/login?expired=true';
      }
    }, 60000); // Check every minute
  }

  static getDeviceFingerprint() {
    return btoa(JSON.stringify({
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    }));
  }
}

// Session timeout warning component
export const SessionWarning = ({ onExtend, onLogout, timeLeft }) => {
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <h3>Session Expiring Soon</h3>
        <p>Your session will expire in {minutes}:{seconds.toString().padStart(2, '0')}</p>
        <div className="warning-buttons">
          <button onClick={onExtend} className="btn-extend">
            Stay Logged In
          </button>
          <button onClick={onLogout} className="btn-logout">
            Log Out
          </button>
        </div>
      </div>

      <style>{`
        .session-warning-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .session-warning-modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .warning-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .btn-extend, .btn-logout {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-extend {
          background: #007bff;
          color: white;
        }

        .btn-logout {
          background: #6c757d;
          color: white;
        }
      `}</style>
    </div>
  );
};