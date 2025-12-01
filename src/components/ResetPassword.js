import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { validatePassword } from '../utils/authValidation';

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      confirmPassword: '',
      showPassword: false,
      isLoading: false,
      message: '',
      error: '',
      passwordError: '',
      isValid: false,
      sessionValid: true
    };
  }

  componentDidMount() {
    this.checkSession();
  }

  checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        this.setState({ 
          error: 'Invalid or expired reset link. Please request a new password reset.',
          sessionValid: false 
        });
      }
    } catch (err) {
      console.error('[RESET_PASSWORD] Session check error:', err);
      this.setState({ error: 'An error occurred. Please try again.' });
    }
  };

  handlePasswordChange = (e) => {
    const value = e.target.value;
    this.setState({ password: value });
    
    if (value) {
      const validation = validatePassword(value);
      this.setState({ passwordError: validation.isValid ? '' : validation.message });
    } else {
      this.setState({ passwordError: '' });
    }
    
    this.updateValidity(value, this.state.confirmPassword);
  };

  handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    this.setState({ confirmPassword: value });
    this.updateValidity(this.state.password, value);
  };

  updateValidity = (pwd, confirm) => {
    const validation = validatePassword(pwd);
    const isValid = validation.isValid && pwd === confirm && pwd.length > 0;
    this.setState({ isValid });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!this.state.isValid) {
      this.setState({ error: 'Passwords do not match or do not meet requirements' });
      return;
    }

    this.setState({ isLoading: true, error: '' });

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: this.state.password
      });

      if (updateError) throw updateError;

      this.setState({ message: 'Password reset successfully! Redirecting to login...' });
      setTimeout(() => {
        this.props.history.push('/login');
      }, 2000);
    } catch (err) {
      console.error('[RESET_PASSWORD] Update error:', err);
      this.setState({ error: err.message || 'Failed to reset password. Please try again.' });
    } finally {
      this.setState({ isLoading: false });
    }
  };

  render() {
    const { password, confirmPassword, showPassword, isLoading, message, error, passwordError, isValid } = this.state;

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Reset Password</h1>
              <p className="text-xs-center">
                <Link to="/login">Back to Sign In</Link>
              </p>

              {error && (
                <div className="alert alert-danger" style={{
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem 1.25rem',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb',
                  borderRadius: '0.25rem'
                }}>
                  {error}
                </div>
              )}

              {message && (
                <div className="alert alert-success" style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '0.75rem 1.25rem',
                  marginBottom: '1rem',
                  border: '1px solid #c3e6cb',
                  borderRadius: '0.25rem'
                }}>
                  {message}
                </div>
              )}

              {!message && (
                <form onSubmit={this.handleSubmit}>
                  <fieldset>
                    <fieldset className="form-group password-field">
                      <label className="form-label">New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          className={`form-control form-control-lg ${passwordError ? 'is-invalid' : ''}`}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={password}
                          onChange={this.handlePasswordChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => this.setState({ showPassword: !showPassword })}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="m10.73 5.08-1.4.14a11.32 11.32 0 0 0-7.4 7.78l-.27.68a11.32 11.32 0 0 0 7.4 7.78l.27-.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="m17 17-5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordError && (
                        <div className="invalid-feedback" style={{ display: 'block' }}>
                          {passwordError}
                        </div>
                      )}
                    </fieldset>

                    <fieldset className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        className={`form-control form-control-lg ${password && confirmPassword !== password ? 'is-invalid' : ''}`}
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={this.handleConfirmPasswordChange}
                        required
                      />
                      {password && confirmPassword !== password && (
                        <div className="invalid-feedback" style={{ display: 'block' }}>
                          Passwords do not match
                        </div>
                      )}
                    </fieldset>

                    <button
                      className="btn btn-lg btn-primary pull-xs-right"
                      type="submit"
                      disabled={!isValid || isLoading}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </fieldset>
                </form>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .auth-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 0;
          }

          .auth-page h1 {
            text-align: center;
            margin-bottom: 1rem;
            color: var(--text-main);
            font-size: 2rem;
          }

          .auth-page p {
            text-align: center;
            margin-bottom: 2rem;
          }

          .auth-page a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
          }

          .auth-page a:hover {
            text-decoration: underline;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-main);
            font-weight: 600;
            font-size: 0.95rem;
          }

          .form-control {
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 0;
            padding: 0.75rem;
            font-size: 1rem;
            color: var(--text-main);
            background: var(--bg-card);
            transition: border-color 0.2s;
          }

          .form-control:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: none;
          }

          .form-control-lg {
            font-size: 1.25rem;
            padding: 0.85rem;
          }

          .form-control.is-invalid {
            border-color: #dc3545;
          }

          .invalid-feedback {
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
          }

          .btn {
            min-height: 44px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 0;
            border: none;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
          }

          .btn-primary {
            background: var(--primary);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            opacity: 0.9;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .pull-xs-right {
            float: right;
          }

          .password-field {
            position: relative;
          }

          .password-input-wrapper {
            position: relative;
          }

          .password-toggle {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }

          .password-toggle:hover {
            color: var(--text-main);
          }

          @media (max-width: 768px) {
            .auth-page {
              padding: 1rem 0;
            }

            .col-md-6 {
              width: 100% !important;
              margin-left: 0 !important;
              padding: 0 1rem;
            }

            .auth-page h1 {
              font-size: 1.5rem;
              margin-bottom: 0.75rem;
            }

            .pull-xs-right {
              float: none !important;
              width: 100%;
            }

            .btn {
              width: 100%;
              margin-top: 1rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default withRouter(ResetPassword);
