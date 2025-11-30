import React, { useState } from 'react';
import { linkSocialAccount, convertToEmailPassword } from '../utils/accountLinking';

const AccountLinkingModal = ({ 
  email, 
  existingAuthMethod, 
  newAuthMethod, 
  socialData,
  onSuccess, 
  onCancel 
}) => {
  const [password, setPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState('');
  const [linkingOption, setLinkingOption] = useState('link'); // 'link' or 'convert'

  const handleLinkAccounts = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLinking(true);
    setError('');

    try {
      const result = await linkSocialAccount(email, password, newAuthMethod, socialData);
      
      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to link accounts. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleConvertAccount = async () => {
    if (!password) {
      setError('Please enter a password for your new account');
      return;
    }

    setIsLinking(true);
    setError('');

    try {
      const result = await convertToEmailPassword(socialData, password);
      
      if (result.success) {
        onSuccess(result);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to convert account. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="account-linking-overlay">
      <div className="account-linking-modal">
        <h2>Account Already Exists</h2>
        <p>An account with <strong>{email}</strong> already exists using {existingAuthMethod} authentication.</p>
        
        <div className="linking-options">
          <label className="option-label">
            <input
              type="radio"
              name="linkingOption"
              value="link"
              checked={linkingOption === 'link'}
              onChange={(e) => setLinkingOption(e.target.value)}
            />
            <span className="option-content">
              <strong>Link Accounts</strong>
              <small>Connect your {newAuthMethod} account to your existing account</small>
            </span>
          </label>

          <label className="option-label">
            <input
              type="radio"
              name="linkingOption"
              value="convert"
              checked={linkingOption === 'convert'}
              onChange={(e) => setLinkingOption(e.target.value)}
            />
            <span className="option-content">
              <strong>Create New Account</strong>
              <small>Create a separate account with email/password</small>
            </span>
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="password-input">
          <input
            type="password"
            placeholder={linkingOption === 'link' ? 'Enter your current password' : 'Create a password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="button-group">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button 
            onClick={linkingOption === 'link' ? handleLinkAccounts : handleConvertAccount}
            disabled={isLinking || !password}
            className="btn-primary">
            {isLinking ? 'Processing...' : (linkingOption === 'link' ? 'Link Accounts' : 'Create Account')}
          </button>
        </div>
      </div>

      <style>{`
        .account-linking-overlay {
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
        }

        .account-linking-modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }

        .account-linking-modal h2 {
          margin-bottom: 1rem;
          color: #333;
        }

        .account-linking-modal p {
          margin-bottom: 1.5rem;
          color: #666;
        }

        .linking-options {
          margin-bottom: 1.5rem;
        }

        .option-label {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-label:hover {
          border-color: #007bff;
        }

        .option-label input[type="radio"] {
          margin-right: 1rem;
          margin-top: 0.25rem;
        }

        .option-label input[type="radio"]:checked + .option-content {
          color: #007bff;
        }

        .option-content {
          flex: 1;
        }

        .option-content strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .option-content small {
          color: #6c757d;
          font-size: 0.875rem;
        }

        .password-input {
          margin-bottom: 1.5rem;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-control:focus {
          outline: none;
          border-color: #007bff;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-cancel, .btn-primary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #dc3545;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f8d7da;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AccountLinkingModal;