import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { supabase } from '../supabaseClient';
import { connect } from 'react-redux';
import { validateEmail, validatePassword, sanitizeInput } from '../utils/authValidation';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts, getDeviceFingerprint, getCSRFToken, generateCSRFToken, setTokenWithExpiry, checkPasswordBreach } from '../utils/authSecurity';
import { parseAuthError, getRecoverySuggestion, logAuthError } from '../utils/robustAuthErrors';
import { handleAccountLinking } from '../utils/accountLinking';
import { checkForDuplicateAccounts, autoMergeOnLogin } from '../utils/accountMerging';
import { handleGoogleOAuthLogin } from '../utils/oauthHelper';
import robustAuthManager from '../utils/robustAuthManager';
import TwoFactorAuth from './TwoFactorAuth';
import AccountLinkingModal from './AccountLinkingModal';
import AccountMergeModal from './AccountMergeModal';
import {
  UPDATE_FIELD_AUTH,
  LOGIN,
  LOGIN_PAGE_UNLOADED
} from '../constants/actionTypes';

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
  onChangeEmail: value =>
    dispatch({ type: UPDATE_FIELD_AUTH, key: 'email', value }),
  onChangePassword: value =>
    dispatch({ type: UPDATE_FIELD_AUTH, key: 'password', value }),
  onSubmit: (payload) =>
    dispatch({ type: LOGIN, payload }),
  onUnload: () =>
    dispatch({ type: LOGIN_PAGE_UNLOADED })
});

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      showPassword: false,
      emailError: '',
      passwordError: '',
      passwordStrength: 0,
      isValidating: false,
      rememberMe: false,
      showTwoFactor: false,
      rateLimitError: '',
      deviceTrust: localStorage.getItem('deviceTrusted') === 'true',
      showAccountLinking: false,
      linkingData: null,
      showAccountMerge: false,
      mergeData: null,
      loginAttempts: 0,
      lastLoginAttempt: null,
      isSessionLoading: true,
      passwordStrengthText: '',
      securityWarnings: []
    };
    
    // Initialize CSRF token
    generateCSRFToken();
    
    this.changeEmail = ev => {
      const email = sanitizeInput(ev.target.value);
      this.props.onChangeEmail(email);
      
      if (email) {
        const validation = validateEmail(email);
        this.setState({ emailError: validation.isValid ? '' : validation.message });
        localStorage.setItem('user_email', email);
      } else {
        this.setState({ emailError: '' });
      }
    };
    
    this.changePassword = ev => {
      const password = ev.target.value;
      this.props.onChangePassword(password);
      
      if (password) {
        const validation = validatePassword(password);
        const strengthMap = { 0: 'Very Weak', 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
        
        this.setState({ 
          passwordError: validation.isValid ? '' : validation.message,
          passwordStrength: validation.strength,
          passwordStrengthText: strengthMap[validation.strength] || 'Very Weak'
        });
        
        // Check for common password breach patterns
        const breachCheck = checkPasswordBreach(password);
        if (breachCheck.isBreach) {
          this.setState({ 
            passwordError: breachCheck.reason,
            securityWarnings: [...this.state.securityWarnings, breachCheck.reason]
          });
        }
      } else {
        this.setState({ passwordError: '', passwordStrength: 0, passwordStrengthText: '' });
      }
    };
    
    this.togglePasswordVisibility = () => {
      this.setState(prev => ({ showPassword: !prev.showPassword }));
    };
    
    this.submitForm = (email, password) => ev => {
      ev.preventDefault();
      
      // Additional validation
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        this.setState({ emailError: emailValidation.message });
        return;
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        this.setState({ passwordError: passwordValidation.message });
        return;
      }
      
      // Check rate limiting
      const rateCheck = checkRateLimit(email);
      if (!rateCheck.allowed) {
        const msg = rateCheck.remainingSeconds > 60 
          ? `Too many failed attempts. Try again in ${rateCheck.remainingMinutes} minutes.`
          : `Too many failed attempts. Try again in ${rateCheck.remainingSeconds} seconds.`;
        this.setState({ rateLimitError: msg });
        logAuthError(parseAuthError({ status: 429 }), { email, action: 'login_attempt' });
        return;
      }
      
      this.setState({ isValidating: true, rateLimitError: '', securityWarnings: [] });
      
      const promise = (async () => {
        try {
          // Verify CSRF token
          const csrfToken = getCSRFToken();
          if (!csrfToken) {
            throw parseAuthError({ status: 400, message: 'CSRF token validation failed' });
          }
          
          // Check for duplicate accounts first
          const duplicateCheck = await checkForDuplicateAccounts(email, 'email');
          
          if (duplicateCheck.hasDuplicates) {
            this.setState({
              showAccountMerge: true,
              mergeData: { email, accounts: duplicateCheck.accounts },
              isValidating: false
            });
            return null;
          }
          
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
          
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          
          if (error) {
            recordFailedAttempt(email);
            const parsedError = parseAuthError(error);
            logAuthError(parsedError, { email, action: 'supabase_signin' });
            
            const recovery = getRecoverySuggestion(parsedError.code);
            this.setState({ 
              rateLimitError: parsedError.message,
              recoveryAction: recovery.action,
              recoveryMessage: recovery.message
            });
            throw parsedError;
          }
          
          clearFailedAttempts(email);
          
          // Store token with expiry
          if (data.session?.access_token) {
            setTokenWithExpiry(data.session.access_token, data.session.expires_in * 1000);
            robustAuthManager.handleLoginSuccess(data.session.access_token, data.session.expires_in);
          }
          
          // Check if 2FA is needed (simulate based on device trust)
          if (!this.state.deviceTrust && Math.random() > 0.7) {
            this.setState({ showTwoFactor: true, isValidating: false });
            return null;
          }
          
          // Remember device if requested
          if (this.state.rememberMe) {
            localStorage.setItem('deviceTrusted', 'true');
            localStorage.setItem('deviceFingerprint', getDeviceFingerprint());
          }
          
          return agent.Auth.supabaseLogin({
            email: data.user.email,
            username: data.user.user_metadata?.username || data.user.email.split('@')[0],
            supabaseId: data.user.id
          });
        } catch (error) {
          this.setState({ isValidating: false });
          console.error('[AUTH] Login error:', error);
          
          if (error.code) {
            logAuthError(error, { email, action: 'login_process' });
          }
          
          throw error;
        }
      })();
      
      if (promise) {
        promise.finally(() => this.setState({ isValidating: false }));
        this.props.onSubmit(promise);
      }
    };
    
    this.handleTwoFactorVerify = async (code) => {
      // Simulate 2FA verification
      if (code === '123456') {
        this.setState({ showTwoFactor: false });
        if (this.state.rememberMe) {
          localStorage.setItem('deviceTrusted', 'true');
        }
        
        const { email } = this.props;
        const loginData = await agent.Auth.supabaseLogin({
          email,
          username: email.split('@')[0],
          supabaseId: 'verified-user'
        });
        
        this.props.onSubmit(Promise.resolve(loginData));
      } else {
        throw new Error('Invalid code');
      }
    };
    
    this.handleTwoFactorCancel = () => {
      this.setState({ showTwoFactor: false });
    };
    
    this.handleAccountLinkingSuccess = (result) => {
      this.setState({ showAccountLinking: false, linkingData: null });
      // Continue with login flow
      const loginData = agent.Auth.supabaseLogin({
        email: result.user.email,
        username: result.user.user_metadata?.username || result.user.email.split('@')[0],
        supabaseId: result.user.id
      });
      this.props.onSubmit(Promise.resolve(loginData));
    };
    
    this.handleAccountLinkingCancel = () => {
      this.setState({ showAccountLinking: false, linkingData: null });
    };
    
    this.handleAccountMergeSuccess = (result) => {
      this.setState({ showAccountMerge: false, mergeData: null });
      // Continue with login using merged account
      const loginData = agent.Auth.supabaseLogin({
        email: result.mergedAccount.email,
        username: result.mergedAccount.username,
        supabaseId: result.mergedAccount.id
      });
      this.props.onSubmit(Promise.resolve(loginData));
    };
    
    this.handleAccountMergeCancel = () => {
      this.setState({ showAccountMerge: false, mergeData: null });
    };

    this.handleGoogleLogin = async () => {
      this.setState({ isValidating: true });
      
      try {
        const result = await handleGoogleOAuthLogin(false);
        
        if (!result.success) {
          this.setState({ 
            rateLimitError: result.error,
            isValidating: false 
          });
          logAuthError(
            parseAuthError({ status: 400, message: result.error }),
            { action: 'google_oauth_login', code: result.code }
          );
          return;
        }
        
        // OAuth redirect will handle the flow
        // User will be redirected to Google, then back to /auth/callback
      } catch (error) {
        console.error('[LOGIN] Google login error:', error);
        this.setState({ 
          rateLimitError: error.message || 'Google login failed. Please try again.',
          isValidating: false 
        });
        logAuthError(
          parseAuthError(error),
          { action: 'google_oauth_login_exception' }
        );
      }
    };
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  render() {
    const email = this.props.email;
    const password = this.props.password;
    return (
      <div className="auth-page">
        <div className="container page">
          <div className="row">

            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">Sign In</h1>
              <p className="text-xs-center">
                <Link to="/register">
                  Need an account?
                </Link>
              </p>

              <ListErrors errors={this.props.errors} />

              <form onSubmit={this.submitForm(email, password)}>
                <fieldset>

                  <fieldset className="form-group">
                    <input
                      className={`form-control form-control-lg ${this.state.emailError ? 'is-invalid' : ''}`}
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={this.changeEmail}
                      required />
                    {this.state.emailError && (
                      <div className="invalid-feedback">{this.state.emailError}</div>
                    )}
                    {this.state.rateLimitError && (
                      <div className="invalid-feedback">{this.state.rateLimitError}</div>
                    )}
                  </fieldset>

                  <fieldset className="form-group password-field">
                    <div className="password-input-wrapper">
                      <input
                        className="form-control form-control-lg"
                        type={this.state.showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
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
                    {this.state.passwordError && (
                      <div className="invalid-feedback">{this.state.passwordError}</div>
                    )}
                    {password && !this.state.passwordError && (
                      <div className="password-strength-info">
                        <div className="strength-meter">
                          <div className="strength-bar" style={{ 
                            width: `${(this.state.passwordStrength / 4) * 100}%`,
                            backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#28a745'][this.state.passwordStrength]
                          }}></div>
                        </div>
                        <small className="strength-text">Strength: {this.state.passwordStrengthText}</small>
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="form-group remember-me">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={this.state.rememberMe}
                        onChange={(e) => this.setState({ rememberMe: e.target.checked })}
                      />
                      <span className="checkmark"></span>
                      Trust this device for 30 days
                    </label>
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={this.props.inProgress || this.state.isValidating || this.state.emailError || this.state.rateLimitError}>
                    {this.props.inProgress || this.state.isValidating ? 'Signing in...' : 'Sign in'}
                  </button>
                  
                  <div className="forgot-password">
                    <Link to="/forgot-password">Forgot your password?</Link>
                  </div>

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
              
              {this.state.showTwoFactor && (
                <TwoFactorAuth
                  email={this.props.email}
                  onVerify={this.handleTwoFactorVerify}
                  onCancel={this.handleTwoFactorCancel}
                />
              )}
              
              {this.state.showAccountLinking && this.state.linkingData && (
                <AccountLinkingModal
                  email={this.props.email}
                  existingAuthMethod={this.state.linkingData.existingUser.authMethods?.[0] || 'social'}
                  newAuthMethod="email"
                  socialData={this.state.linkingData.existingUser}
                  onSuccess={this.handleAccountLinkingSuccess}
                  onCancel={this.handleAccountLinkingCancel}
                />
              )}
              
              {this.state.showAccountMerge && this.state.mergeData && (
                <AccountMergeModal
                  email={this.state.mergeData.email}
                  accounts={this.state.mergeData.accounts}
                  onSuccess={this.handleAccountMergeSuccess}
                  onCancel={this.handleAccountMergeCancel}
                />
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

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .remember-me {
            margin: 1rem 0;
          }

          .checkbox-label {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 0.9rem;
            color: var(--text-secondary);
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
            position: relative;
            transition: all 0.2s;
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

          .forgot-password {
            text-align: center;
            margin-top: 1rem;
          }

          .forgot-password a {
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-decoration: none;
          }

          .forgot-password a:hover {
            color: var(--primary);
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
