import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import agent from '../agent';

const AccountLinkingSettings = ({ currentUser }) => {
  const [isLinking, setIsLinking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const authMethods = currentUser?.authMethods || ['email'];
  const hasGoogle = authMethods.includes('google');

  const handleLinkGoogle = async () => {
    setShowPasswordInput(true);
    setError('');
  };

  const handlePasswordVerification = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLinking(true);
    setError('');

    try {
      await agent.Auth.verifyPassword(password);
      setMessage('Google account successfully linked!');
      setShowPasswordInput(false);
      setPassword('');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError('Invalid password. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (authMethods.length <= 1) {
      setError('Cannot unlink the only authentication method');
      return;
    }

    setIsLinking(true);
    setError('');

    try {
      const { error: err } = await supabase.auth.unlinkIdentity({
        identity_id: `google_${currentUser.id}`
      });

      if (err) throw err;
      setMessage('Google account successfully unlinked!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err.message || 'Failed to unlink Google account');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="account-linking-settings">
      <p className="description">Link your Google account for easier sign-in.</p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="auth-methods">
        <div className="auth-method">
          <div className="method-info">
            <div className="method-icon-text google">G</div>
            <div>
              <div className="method-name">Google</div>
              <div className="method-description">Sign in with your Google account</div>
            </div>
          </div>
          <div className="method-status">
            {hasGoogle ? (
              <div className="connected-actions">
                <span className="status-connected">Connected</span>
                <button 
                  className="btn-unlink"
                  onClick={handleUnlinkGoogle}
                  disabled={isLinking || authMethods.length <= 1}>
                  Unlink
                </button>
              </div>
            ) : (
              <button 
                className="btn-link"
                onClick={handleLinkGoogle}
                disabled={isLinking}>
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {showPasswordInput && (
        <div className="password-verification">
          <h4>Verify Your Password</h4>
          <p>Enter your current password to link your Google account.</p>
          <div className="password-input-group">
            <input
              type="password"
              placeholder="Current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
            <div className="button-group">
              <button 
                onClick={() => {
                  setShowPasswordInput(false);
                  setPassword('');
                }}
                className="btn-cancel">
                Cancel
              </button>
              <button 
                onClick={handlePasswordVerification}
                disabled={isLinking || !password}
                className="btn-verify">
                {isLinking ? 'Verifying...' : 'Verify & Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .account-linking-settings {
          width: 100%;
        }

        .description {
          color: var(--text-secondary);
          margin: 0 0 1.5rem 0;
          font-size: 0.95rem;
        }

        .alert {
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .auth-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-method {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-hover);
        }

        .method-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .method-icon-text {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          color: white;
          background: #6c757d;
        }
        
        .method-icon-text.google {
          background: #4285f4;
        }

        .method-name {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .method-description {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .method-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .connected-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-connected {
          color: #28a745;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .btn-link, .btn-unlink, .btn-verify, .btn-cancel {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-link {
          background: var(--primary);
          color: white;
        }

        .btn-link:hover:not(:disabled) {
          background: var(--primary-hover);
        }

        .btn-unlink {
          background: transparent;
          color: #dc3545;
          border: 1px solid #dc3545;
        }

        .btn-unlink:hover:not(:disabled) {
          background: rgba(220, 53, 69, 0.1);
        }

        .btn-verify {
          background: var(--primary);
          color: white;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-link:disabled, .btn-unlink:disabled, .btn-verify:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-verification {
          margin-top: 1.5rem;
          padding: 1.5rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-card);
        }

        .password-verification h4 {
          margin-bottom: 0.5rem;
          color: var(--text-main);
          font-size: 1.1rem;
        }

        .password-verification p {
          margin-bottom: 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .password-input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .password-input-group .form-control {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 0.95rem;
          color: var(--text-main);
          background: var(--bg-body);
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .auth-method {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .method-status {
            width: 100%;
            justify-content: flex-end;
          }

          .button-group {
            flex-direction: column;
            width: 100%;
          }

          .btn-link, .btn-unlink, .btn-verify, .btn-cancel {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountLinkingSettings;
