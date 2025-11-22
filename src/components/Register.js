import { Link } from 'react-router-dom';
import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
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
  onSubmit: (username, email, password) => {
    const payload = agent.Auth.register(username, email, password);
    dispatch({ type: REGISTER, payload })
  },
  onUnload: () =>
    dispatch({ type: REGISTER_PAGE_UNLOADED })
});

class Register extends React.Component {
  constructor() {
    super();
    this.changeEmail = ev => this.props.onChangeEmail(ev.target.value);
    this.changePassword = ev => this.props.onChangePassword(ev.target.value);
    this.changeUsername = ev => this.props.onChangeUsername(ev.target.value);
    this.submitForm = (username, email, password) => ev => {
      ev.preventDefault();
      this.props.onSubmit(username, email, password);
    }
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
                      className="form-control form-control-lg"
                      type="text"
                      placeholder="Username"
                      value={this.props.username}
                      onChange={this.changeUsername} />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="email"
                      placeholder="Email"
                      value={this.props.email}
                      onChange={this.changeEmail} />
                  </fieldset>

                  <fieldset className="form-group">
                    <input
                      className="form-control form-control-lg"
                      type="password"
                      placeholder="Password"
                      value={this.props.password}
                      onChange={this.changePassword} />
                  </fieldset>

                  <button
                    className="btn btn-lg btn-primary pull-xs-right"
                    type="submit"
                    disabled={this.props.inProgress}>
                    Sign up
                  </button>

                </fieldset>
              </form>
            </div>

          </div>
        </div>

        <style>{`
          .auth-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 2rem 0;
          }

          .dark-theme .auth-page {
            background: #0d0d0d;
          }

          .auth-page h1 {
            text-align: center;
            margin-bottom: 1rem;
            color: #373a3c;
            font-size: 2rem;
          }

          .dark-theme .auth-page h1 {
            color: #e0e0e0;
          }

          .auth-page p {
            text-align: center;
            margin-bottom: 2rem;
          }

          .auth-page a {
            color: #5cb85c;
            text-decoration: none;
          }

          .auth-page a:hover {
            text-decoration: underline;
          }

          .auth-page .form-group {
            margin-bottom: 1.5rem;
          }

          .auth-page .form-control {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 1rem;
            color: #373a3c;
            background: white;
            transition: border-color 0.2s;
          }

          .auth-page .form-control:focus {
            border-color: #5cb85c;
            outline: none;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.1);
          }

          .dark-theme .auth-page .form-control {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }

          .dark-theme .auth-page .form-control:focus {
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
          }

          .auth-page .form-control-lg {
            font-size: 1.25rem;
            padding: 0.85rem;
          }

          .auth-page .btn {
            min-height: 44px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);
