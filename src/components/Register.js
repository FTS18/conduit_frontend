import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { supabase } from '../supabaseClient';
import { connect } from 'react-redux';
import { validateEmail, validatePassword, validateUsername, checkEmailFormat } from '../utils/authValidation';
import { checkPasswordBreach, getDeviceFingerprint } from '../utils/authSecurity';
import { handleAccountLinking } from '../utils/accountLinking';
import AccountLinkingModal from './AccountLinkingModal';
import {
  UPDATE_FIELD_AUTH,
  REGISTER,
  REGISTER_PAGE_UNLOADED
} from '../constants/actionTypes';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  onChangeEmail: value =>
    dispatch({ type: UPDATE_FIELD_AUTH, key: 'email', value }),
  onChangePassword: value =>
    dispatch({ type: UPDATE_FIELD_AUTH, key: 'password', value }),
  onChangeUsername: value =>
    dispatch({ type: UPDATE_FIELD_AUTH, key: 'username', value }),
  onSubmit: (payload) => {
    dispatch({ type: REGISTER, payload })
  },
  onUnload: () =>
    dispatch({ type: REGISTER_PAGE_UNLOADED })
});

class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      showPassword: false,
      emailError: '',
      passwordError: '',
      usernameError: '',
      passwordStrength: 0,
      emailSuggestion: '',
      isValidating: false,
      acceptTerms: false,
      acceptMarketing: false,
      passwordBreach: false,
      emailVerificationSent: false,
      showAccountLinking: false,
      linkingData: null
    };
    
    this.changeEmail = ev => {
      const email = ev.target.value;
      this.props.onChangeEmail(email);
      
      if (email) {
        const validation = validateEmail(email);
        const suggestion = checkEmailFormat(email);
        this.setState({ 
          emailError: validation.isValid ? '' : validation.message,
          emailSuggestion: suggestion.suggestion
        });
      } else {
        this.setState({ emailError: '', emailSuggestion: '' });
      }
    };
    
    this.changePassword = ev => {
      const password = ev.target.value;
      this.props.onChangePassword(password);
      
      if (password) {
        const validation = validatePassword(password);
        const isBreach = checkPasswordBreach(password);
        
        let errorMessage = validation.message;
        if (isBreach) {
          errorMessage = 'This password has been found in data breaches. Please choose a different one.';
        }
        
        this.setState({ 
          passwordError: validation.isValid && !isBreach ? '' : errorMessage,
          passwordStrength: isBreach ? 0 : validation.strength,
          passwordBreach: isBreach
        });
      } else {
        this.setState({ passwordError: '', passwordStrength: 0, passwordBreach: false });
      }
    };
    
    this.changeUsername = ev => {
      const username = ev.target.value;
      this.props.onChangeUsername(username);
      
      if (username) {
        const validation = validateUsername(username);
        this.setState({ usernameError: validation.isValid ? '' : validation.message });
      } else {
        this.setState({ usernameError: '' });
      }
    };
    
    this.togglePasswordVisibility = () => {
      this.setState(prev => ({ showPassword: !prev.showPassword }));
    };
    
    this.submitForm = (username, email, password) => ev => {
      ev.preventDefault();
      
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      const usernameValidation = validateUsername(username);
      const isBreach = checkPasswordBreach(password);
      
      if (!this.state.acceptTerms) {
        alert('Please accept the Terms of Service to continue.');
        return;
      }
      
      if (!emailValidation.isValid || !passwordValidation.isValid || !usernameValidation.isValid || isBreach) {
        this.setState({
          emailError: emailValidation.isValid ? '' : emailValidation.message,
          passwordError: passwordValidation.isValid && !isBreach ? '' : (isBreach ? 'Password found in data breaches' : passwordValidation.message),
          usernameError: usernameValidation.isValid ? '' : usernameValidation.message
        });
        return;
      }
      
      this.setState({ isValidating: true });
      const promise = (async () => {
        // Check for account linking scenarios
        const linkingCheck = await handleAccountLinking(email, 'email');
        
        if (linkingCheck.action === 'link_required') {
          this.setState({
            showAccountLinking: true,
            linkingData: linkingCheck,
            isValidating: false
          });
          return null;
        }
        
        const deviceFingerprint = getDeviceFingerprint();
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              username,
              deviceFingerprint,
              acceptedTerms: true,
              acceptedMarketing: this.state.acceptMarketing,
              registrationDate: new Date().toISOString()
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          this.setState({ emailVerificationSent: true, isValidating: false });
          return null;
        }
        
        if (data.user) {
          return agent.Auth.supabaseLogin({
            email: data.user.email,
            username: username,
            supabaseId: data.user.id
          });
        }
        
        throw new Error('Registration successful! Please check your email to confirm.');
      })();
      
      if (promise) {
        promise.finally(() => this.setState({ isValidating: false }));
        this.props.onSubmit(promise);
      }
    };

    this.handleGoogleLogin = async () => {
      try {
        // First check if account linking is needed
        if (this.props.email) {
          const linkingCheck = await handleAccountLinking(this.props.email, 'google');
          
          if (linkingCheck.action === 'link_required') {
            this.setState({
              showAccountLinking: true,
              linkingData: { ...linkingCheck, newAuthMethod: 'google' }
            });
            return;
          }
        }
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
          }
        });
        if (error) throw error;
      } catch (error) {
        console.error('Google login error:', error);
      }
    };
    
    this.handleAccountLinkingSuccess = (result) => {
      this.setState({ showAccountLinking: false, linkingData: null });
      if (result.action === 'register') {
        this.setState({ emailVerificationSent: true });
      } else {
        // Continue with login flow
        const loginData = agent.Auth.supabaseLogin({
          email: result.user.email,
          username: result.user.user_metadata?.username || result.user.email.split('@')[0],
          supabaseId: result.user.id
        });
        this.props.onSubmit(Promise.resolve(loginData));
      }
    };
    
    this.handleAccountLinkingCancel = () => {
      this.setState({ showAccountLinking: false, linkingData: null });
    };
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const email = this.props.email;
    const password = this.props.password;
    const username = this.props.username;

    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">

            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign Up</h1>
              <p className="text-xs-center">
                <Link to="/login">
                  Have an account?
                </Link>
              </p>

              <ListErrors errors={this.props.errors} />

              <form onSubmit={this.submitForm(username, email, password)}>
                <fieldset>

                  <fieldset className="form-group">
                    <input
                      className={`form-control form-control-lg ${this.state.usernameError ? 'is-invalid' : ''}`}
                      type="text"
                      placeholder="Username"
                      value={this.props.username}
                      onChange={this.changeUsername}
                      required />
                    {this.state.usernameError && (
                      <div className="invalid-feedback">{this.state.usernameError}</div>
                    )}
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className={`form-control form-control-lg ${this.state.emailError ? 'is-invalid' : ''}`}
                      type="email"
                      placeholder="Email"
                      value={this.props.email}
                      onChange={this.changeEmail}
                      required />
                    {this.state.emailError && (
                      <div className="invalid-feedback">{this.state.emailError}</div>
                    )}
                    {this.state.emailSuggestion && (
                      <div className="email-suggestion">{this.state.emailSuggestion}</div>
                    )}
                  </fieldset>

                  <fieldset className="form-group password-field">
                    <div className="password-input-wrapper">
                      <input
                        className={`form-control form-control-lg ${this.state.passwordError ? 'is-invalid' : ''}`}
                        type={this.state.showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={this.props.password}
                        onChange={this.changePassword}
                        required />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={this.togglePasswordVisibility}
                        aria-label={this.state.showPassword ? 'Hide password' : 'Show password'}>
                        {this.state.showPassword ? (
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
                    {this.props.password && (
                      <div className="password-strength">
                        <div className="strength-bar">
                          <div 
                            className={`strength-fill strength-${this.state.passwordStrength}`}
                            style={{ width: `${(this.state.passwordStrength / 5) * 100}%` }}>
                          </div>
                        </div>
                        <span className="strength-text">
                          {this.state.passwordStrength === 0 && 'Very Weak'}
                          {this.state.passwordStrength === 1 && 'Weak'}
                          {this.state.passwordStrength === 2 && 'Fair'}
                          {this.state.passwordStrength === 3 && 'Good'}
                          {this.state.passwordStrength === 4 && 'Strong'}
                          {this.state.passwordStrength === 5 && 'Very Strong'}
                        </span>
                      </div>
                    )}
                    {this.state.passwordError && (
                      <div className="invalid-feedback">{this.state.passwordError}</div>
                    )}
                  </fieldset>

                  <fieldset className="form-group terms-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={this.state.acceptTerms}
                        onChange={(e) => this.setState({ acceptTerms: e.target.checked })}
                        required
                      />
                      <span className="checkmark"></span>
                      I agree to the <Link to="/terms" target="_blank">Terms of Service</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
                    </label>
                  </fieldset>

                  <fieldset className="form-group marketing-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={this.state.acceptMarketing}
                        onChange={(e) => this.setState({ acceptMarketing: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      Send me product updates and newsletters (optional)
                    </label>
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={this.props.inProgress || this.state.isValidating || this.state.emailError || this.state.passwordError || this.state.usernameError || !this.state.acceptTerms}>
                    {this.props.inProgress || this.state.isValidating ? 'Creating account...' : 'Sign up'}
                  </button>

                </fieldset>
              </form>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <button
                className="btn btn-lg btn-google"
                type="button"
                onClick={this.handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
                  <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

          </div>
        </div>
        
        {this.state.emailVerificationSent && (
          <div className="verification-overlay">
            <div className="verification-modal">
              <h2>Check Your Email</h2>
              <p>We've sent a verification link to <strong>{this.props.email}</strong></p>
              <p>Please click the link in the email to activate your account.</p>
              <button 
                className="btn btn-primary"
                onClick={() => this.setState({ emailVerificationSent: false })}>
                Got it
              </button>
            </div>
          </div>
        )}
        
        {this.state.showAccountLinking && this.state.linkingData && (
          <AccountLinkingModal
            email={this.props.email}
            existingAuthMethod={this.state.linkingData.existingUser?.authMethods?.[0] || 'social'}
            newAuthMethod={this.state.linkingData.newAuthMethod || 'email'}
            socialData={this.state.linkingData.existingUser}
            onSuccess={this.handleAccountLinkingSuccess}
            onCancel={this.handleAccountLinkingCancel}
          />
        )}

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

          .auth-page .form-group {
            margin-bottom: 1.5rem;
          }

          .auth-page .form-control {
            border: 1px solid var(--border-color);
            border-radius: 0;
            padding: 0.75rem;
            font-size: 1rem;
            color: var(--text-main);
            background: var(--bg-card);
            transition: border-color 0.2s;
          }

          .auth-page .form-control:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: none;
          }

          .auth-page .form-control-lg {
            font-size: 1.25rem;
            padding: 0.85rem;
          }

          .auth-page .btn {
            min-height: 44px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            border-radius: 0;
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

            .auth-page p {
              margin-bottom: 1.5rem;
            }

            .auth-page .form-control {
              font-size: 16px;
              padding: 0.85rem;
            }

            .auth-page .form-control-lg {
              font-size: 1rem;
            }

            .auth-page .btn {
              width: 100%;
              margin-top: 1rem;
            }

            .pull-xs-right {
              float: none !important;
            }
          }

          .auth-divider {
            text-align: center;
            margin: 2rem 0;
            position: relative;
          }

          .auth-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--border-color);
          }

          .auth-divider span {
            background: var(--bg-body);
            padding: 0 1rem;
            position: relative;
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 600;
          }

          .btn-google {
            width: 100%;
            background: white;
            color: #333;
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            font-weight: 600;
            transition: all 0.2s;
          }

          .btn-google:hover {
            background: #f8f9fa;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .btn-google svg {
            flex-shrink: 0;
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

          .password-toggle:focus {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
            border-radius: 4px;
          }

          .form-control.is-invalid {
            border-color: #dc3545;
          }

          .invalid-feedback {
            display: block;
            width: 100%;
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: #dc3545;
          }

          .email-suggestion {
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: #6c757d;
            font-style: italic;
          }

          .password-strength {
            margin-top: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .strength-bar {
            flex: 1;
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
          }

          .strength-fill {
            height: 100%;
            transition: width 0.3s ease, background-color 0.3s ease;
            border-radius: 2px;
          }

          .strength-0, .strength-1 { background-color: #dc3545; }
          .strength-2 { background-color: #fd7e14; }
          .strength-3 { background-color: #ffc107; }
          .strength-4 { background-color: #20c997; }
          .strength-5 { background-color: #28a745; }

          .strength-text {
            font-size: 0.75rem;
            font-weight: 600;
            min-width: 80px;
            text-align: right;
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .terms-section, .marketing-section {
            margin: 1rem 0;
          }

          .checkbox-label {
            display: flex;
            align-items: flex-start;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.4;
          }

          .checkbox-label input[type="checkbox"] {
            display: none;
          }

          .checkmark {
            width: 18px;
            height: 18px;
            border: 2px solid var(--border-color);
            border-radius: 3px;
            margin-right: 0.5rem;
            margin-top: 2px;
            position: relative;
            transition: all 0.2s;
            flex-shrink: 0;
          }

          .checkbox-label input:checked + .checkmark {
            background: var(--primary);
            border-color: var(--primary);
          }

          .checkbox-label input:checked + .checkmark::after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 2px;
            color: white;
            font-size: 12px;
            font-weight: bold;
          }

          .checkbox-label a {
            color: var(--primary);
            text-decoration: none;
          }

          .checkbox-label a:hover {
            text-decoration: underline;
          }

          .verification-overlay {
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

          .verification-modal {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 400px;
            width: 90%;
            text-align: center;
          }

          .verification-modal h2 {
            color: var(--text-main);
            margin-bottom: 1rem;
          }

          .verification-modal p {
            color: var(--text-secondary);
            margin-bottom: 1rem;
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);
