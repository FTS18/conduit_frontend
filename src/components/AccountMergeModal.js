import React, { useState } from 'react';
import { mergeExistingAccounts } from '../utils/accountMerging';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';

const AccountMergeModal = ({ email, accounts, onSuccess, onCancel }) => {
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState('');

  const emailAccount = accounts.find(acc => acc.authMethods.includes('email'));
  const googleAccount = accounts.find(acc => acc.authMethods.includes('google'));

  const handleMerge = async () => {
    setIsMerging(true);
    setError('');

    try {
      const result = await mergeExistingAccounts(email);
      
      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to merge accounts. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="merge-modal-overlay">
      <Card className="merge-modal">
        <CardHeader>
          <CardTitle>Merge Duplicate Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="merge-description">
            We found multiple accounts with the email <strong>{email}</strong>. 
            Would you like to merge them into a single account?
          </p>

          <div className="accounts-preview">
            <div className="account-item">
              <div className="account-header">
                <div className="auth-badge email">EMAIL</div>
                <span className="account-type">Email Account</span>
              </div>
              <div className="account-stats">
                <span>{emailAccount?.totalArticlesCount || 0} articles</span>
                <span>{emailAccount?.totalCommentsCount || 0} comments</span>
                <span>{emailAccount?.followersCount || 0} followers</span>
              </div>
            </div>

            <div className="merge-arrow">→</div>

            <div className="account-item">
              <div className="account-header">
                <div className="auth-badge google">G</div>
                <span className="account-type">Google Account</span>
              </div>
              <div className="account-stats">
                <span>{googleAccount?.totalArticlesCount || 0} articles</span>
                <span>{googleAccount?.totalCommentsCount || 0} comments</span>
                <span>{googleAccount?.followersCount || 0} followers</span>
              </div>
            </div>
          </div>

          <div className="merge-info">
            <h4>What will happen:</h4>
            <ul>
              <li>Your email account will be kept as the primary account</li>
              <li>All articles and comments will be combined</li>
              <li>Followers and following lists will be merged</li>
              <li>You'll be able to sign in with both email and Google</li>
              <li>The duplicate Google account will be removed</li>
            </ul>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <div className="button-group">
            <Button variant="ghost" onClick={onCancel} disabled={isMerging}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMerge} disabled={isMerging}>
              {isMerging ? 'Merging...' : 'Merge Accounts'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .merge-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .merge-modal {
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .merge-description {
          color: var(--text-secondary, #6b7280);
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }

        .accounts-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--bg-hover, #f9fafb);
          border-radius: 8px;
        }

        .account-item {
          flex: 1;
          text-align: center;
        }

        .account-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .auth-badge {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.7rem;
          color: white;
        }

        .auth-badge.email {
          background: #6b7280;
        }

        .auth-badge.google {
          background: #4285f4;
        }

        .account-type {
          font-weight: 600;
          color: var(--text-main, #111827);
        }

        .account-stats {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.85rem;
          color: var(--text-secondary, #6b7280);
        }

        .merge-arrow {
          font-size: 1.5rem;
          color: var(--primary, #3b82f6);
          font-weight: bold;
        }

        .merge-info {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: var(--bg-hover, #f9fafb);
          border-radius: 8px;
        }

        .merge-info h4 {
          margin: 0 0 0.75rem 0;
          color: var(--text-main, #111827);
          font-size: 1rem;
        }

        .merge-info ul {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--text-secondary, #6b7280);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .merge-info li {
          margin-bottom: 0.25rem;
        }

        .error-message {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        @media (prefers-color-scheme: dark) {
          .merge-description {
            color: var(--text-secondary, #9ca3af);
          }

          .accounts-preview {
            background: var(--bg-hover, #374151);
          }

          .account-type {
            color: var(--text-main, #f9fafb);
          }

          .account-stats {
            color: var(--text-secondary, #9ca3af);
          }

          .merge-info {
            background: var(--bg-hover, #374151);
          }

          .merge-info h4 {
            color: var(--text-main, #f9fafb);
          }

          .merge-info ul {
            color: var(--text-secondary, #9ca3af);
          }
        }

        @media (max-width: 768px) {
          .accounts-preview {
            flex-direction: column;
            gap: 0.75rem;
          }

          .merge-arrow {
            transform: rotate(90deg);
          }

          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountMergeModal;