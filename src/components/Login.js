import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { supabase } from '../supabaseClient';
import { connect } from 'react-redux';
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
  onSubmit: (email, password) =>
    dispatch({ type: LOGIN, payload: agent.Auth.login(email, password) }),
  onUnload: () =>
    dispatch({ type: LOGIN_PAGE_UNLOADED })
});

class Login extends React.Component {
  constructor() {
    super();
    this.changeEmail = ev => this.props.onChangeEmail(ev.target.value);
    this.changePassword = ev => this.props.onChangePassword(ev.target.value);
    this.submitForm = (email, password) => ev => {
      ev.preventDefault();
      this.props.onSubmit(email, password);
    };

    this.handleGoogleLogin = async () => {
      try {
        const { error } = await supabase.auth.signIn({
          provider: 'google'
        }, {
          redirectTo: `${window.location.origin}/`
        });
        if (error) throw error;
      } catch (error) {
        console.error('Google login error:', error);
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
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={this.changeEmail} />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={this.changePassword} />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={this.props.inProgress}>
                    Sign in
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
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
