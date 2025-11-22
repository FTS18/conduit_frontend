import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  SETTINGS_SAVED,
  SETTINGS_PAGE_UNLOADED,
  LOGOUT
} from '../constants/actionTypes';

class SettingsForm extends React.Component {
  constructor() {
    super();

    this.state = {
      image: '',
      username: '',
      bio: '',
      email: '',
      password: ''
    };

    this.updateState = field => ev => {
      const state = this.state;
      const newState = Object.assign({}, state, { [field]: ev.target.value });
      this.setState(newState);
    };

    this.submitForm = ev => {
      ev.preventDefault();

      const user = Object.assign({}, this.state);
      if (!user.password) {
        delete user.password;
      }

      this.props.onSubmitForm(user);
    };
  }

  componentWillMount() {
    if (this.props.currentUser) {
      Object.assign(this.state, {
        image: this.props.currentUser.image || '',
        username: this.props.currentUser.username,
        bio: this.props.currentUser.bio,
        email: this.props.currentUser.email
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser) {
      this.setState(Object.assign({}, this.state, {
        image: nextProps.currentUser.image || '',
        username: nextProps.currentUser.username,
        bio: nextProps.currentUser.bio,
        email: nextProps.currentUser.email
      }));
    }
  }

  render() {
    return (
      <form onSubmit={this.submitForm}>
        <fieldset>

          <fieldset className="form-group">
            <input
              className="form-control"
              type="text"
              placeholder="URL of profile picture"
              value={this.state.image}
              onChange={this.updateState('image')} />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={this.state.username}
              onChange={this.updateState('username')} />
          </fieldset>

          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows="8"
              placeholder="Short bio about you"
              value={this.state.bio}
              onChange={this.updateState('bio')}>
            </textarea>
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.updateState('email')} />
          </fieldset>

          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="New Password"
              value={this.state.password}
              onChange={this.updateState('password')} />
          </fieldset>

          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={this.state.inProgress}>
            Update Settings
          </button>

        </fieldset>
      </form>
    );
  }
}

const mapStateToProps = state => ({
  ...state.settings,
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onClickLogout: () => dispatch({ type: LOGOUT }),
  onSubmitForm: user =>
    dispatch({ type: SETTINGS_SAVED, payload: agent.Auth.save(user) }),
  onUnload: () => dispatch({ type: SETTINGS_PAGE_UNLOADED })
});

class Settings extends React.Component {
  render() {
    return (
      <div className="settings-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">

              <h1 className="text-xs-center">Your Settings</h1>

              <ListErrors errors={this.props.errors}></ListErrors>

              <SettingsForm
                currentUser={this.props.currentUser}
                onSubmitForm={this.props.onSubmitForm} />

              <hr />

              <button
                className="btn btn-outline-danger"
                onClick={this.props.onClickLogout}>
                Or click here to logout.
              </button>

            </div>
          </div>
        </div>

        <style>{`
          .settings-page {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 2rem 0;
          }

          .dark-theme .settings-page {
            background: #0d0d0d;
          }

          .settings-page h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: #373a3c;
            font-size: 2rem;
          }

          .dark-theme .settings-page h1 {
            color: #e0e0e0;
          }

          .settings-page .form-group {
            margin-bottom: 1.5rem;
          }

          .settings-page .form-control {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.75rem;
            font-size: 1rem;
            color: #373a3c;
            background: white;
            transition: border-color 0.2s;
          }

          .settings-page .form-control:focus {
            border-color: #5cb85c;
            outline: none;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.1);
          }

          .dark-theme .settings-page .form-control {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }

          .dark-theme .settings-page .form-control:focus {
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
          }

          .settings-page .form-control-lg {
            font-size: 1.25rem;
            padding: 0.85rem;
          }

          .settings-page textarea.form-control {
            resize: vertical;
            min-height: 150px;
          }

          .settings-page .btn {
            min-height: 44px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }

          .settings-page hr {
            border-color: #e1e4e8;
            margin: 2rem 0;
          }

          .dark-theme .settings-page hr {
            border-color: #333;
          }

          @media (max-width: 768px) {
            .settings-page {
              padding: 1rem 0;
            }

            .col-md-6 {
              width: 100% !important;
              margin-left: 0 !important;
              padding: 0 1rem;
            }

            .settings-page h1 {
              font-size: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .settings-page .form-control {
              font-size: 16px;
              padding: 0.85rem;
            }

            .settings-page .form-control-lg {
              font-size: 1rem;
            }

            .settings-page textarea.form-control {
              min-height: 120px;
            }

            .settings-page .btn {
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
