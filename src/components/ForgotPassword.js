import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { validateEmail } from '../utils/authValidation';
import { emailService } from '../utils/emailService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Generate reset token via Supabase
      const { error: resetError, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (resetError) throw resetError;

      // Get user info for personalized email
      const { data: { user } } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.name || email.split('@')[0];

      // Send personalized email via email service
      const resetToken = data?.code || 'reset-token';
      const emailResult = await emailService.sendPasswordReset(email, userName, resetToken);
      
      if (!emailResult.success) {
        console.warn('[FORGOT_PASSWORD] Email service warning:', emailResult.error);
        // Still consider it a success - Supabase will send email anyway
      }
      
      setMessage('Password reset email sent! Check your inbox for instructions.');
      setEmailSent(true);
      setEmail('');
    } catch (err) {
      console.error('[FORGOT_PASSWORD] Error:', err);
      setError(err.message || 'Failed to process password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Reset Password</h1>
            <p className="text-xs-center">
              <Link to="/login">Back to Sign In</Link>
            </p>

            {message && (
              <div className="alert alert-success">{message}</div>
            )}

            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </fieldset>

              <button
                className="btn btn-lg btn-primary pull-xs-right"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .alert {
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border: 1px solid transparent;
          border-radius: 4px;
        }
        .alert-success {
          color: #155724;
          background-color: #d4edda;
          border-color: #c3e6cb;
        }
        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;