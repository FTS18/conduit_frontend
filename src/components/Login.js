import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
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
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
