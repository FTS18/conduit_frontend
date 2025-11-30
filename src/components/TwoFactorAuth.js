import React, { useState, useEffect } from 'react';

const TwoFactorAuth = ({ onVerify, onCancel, email }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await onVerify(fullCode);
    } catch (err) {
      setError('Invalid verification code');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="two-factor-overlay">
      <div className="two-factor-modal">
        <h2>Two-Factor Authentication</h2>
        <p>We've sent a 6-digit code to {email}</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="code-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
                autoFocus={index === 0}
              />
            ))}
          </div>
          
          <div className="timer">
            Code expires in: {formatTime(timeLeft)}
          </div>
          
          <div className="button-group">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn-verify">
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .two-factor-overlay {
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
        
        .two-factor-modal {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        
        .code-inputs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin: 1.5rem 0;
        }
        
        .code-input {
          width: 50px;
          height: 50px;
          text-align: center;
          font-size: 1.5rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          outline: none;
        }
        
        .code-input:focus {
          border-color: #007bff;
        }
        
        .timer {
          color: #666;
          margin: 1rem 0;
        }
        
        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        .btn-cancel, .btn-verify {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-cancel {
          background: #6c757d;
          color: white;
        }
        
        .btn-verify {
          background: #007bff;
          color: white;
        }
        
        .btn-verify:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #dc3545;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  );
};

export default TwoFactorAuth;