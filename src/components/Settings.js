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
            <label className="form-label">Profile Picture URL</label>
            <input
              className="form-control"
              type="text"
              placeholder="https://example.com/image.jpg"
              value={this.state.image}
              onChange={this.updateState('image')} />
          </fieldset>

          <fieldset className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={this.state.username}
              onChange={this.updateState('username')} />
          </fieldset>

          <fieldset className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control form-control-lg"
              rows="5"
              placeholder="Tell us about yourself..."
              value={this.state.bio}
              onChange={this.updateState('bio')}>
            </textarea>
          </fieldset>

          <fieldset className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={this.state.email}
              onChange={this.updateState('email')} />
          </fieldset>

          <fieldset className="form-group">
            <label className="form-label">New Password (optional)</label>
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Leave blank to keep current password"
              value={this.state.password}
              onChange={this.updateState('password')} />
          </fieldset>

          <button
            className="btn btn-lg btn-primary btn-block"
            type="submit"
            disabled={this.state.inProgress}>
            Update Settings
          </button>

        </fieldset>
      </form>
    );
  }
}

const mapStateToProps = state => ((({
  ...state.settings,
  currentUser: state.common.currentUser
})));

const mapDispatchToProps = dispatch => ((({
  onClickLogout: () => dispatch({ type: LOGOUT }),
  onSubmitForm: user =>
    dispatch({ type: SETTINGS_SAVED, payload: agent.Auth.save(user) }),
  onUnload: () => dispatch({ type: SETTINGS_PAGE_UNLOADED })
})));

class Settings extends React.Component {
  render() {
    return (
      <div className="settings-page">
        <div className="settings-main">
          <h1>Settings</h1>

          <ListErrors errors={this.props.errors}></ListErrors>

          <SettingsForm
            currentUser={this.props.currentUser}
            onSubmitForm={this.props.onSubmitForm} />

          <hr className="settings-divider" />

          <button
            className="btn btn-outline-danger btn-block"
            onClick={this.props.onClickLogout}>
            Logout
          </button>
        </div>

        <style>{`
          .settings-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .settings-main {
            max-width: 600px;
            margin: 0 auto;
            background: var(--bg-card);
            border-radius: 12px;
            padding: 2.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid var(--border-color);
          }

          .settings-main h1 {
            text-align: center;
            margin-bottom: 2.5rem;
            color: var(--primary);
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: -0.5px;
          }

          .settings-main .form-group {
            margin-bottom: 1.75rem;
          }

          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            color: var(--text-main);
            font-weight: 600;
            font-size: 0.95rem;
          }

          .settings-main .form-control {
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.85rem;
            font-size: 1rem;
            color: var(--text-main);
            background: var(--bg-hover);
            transition: all 0.2s;
            box-sizing: border-box;
            font-family: inherit;
          }

          .settings-main .form-control:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .settings-main .form-control-lg {
            font-size: 1rem;
            padding: 0.9rem;
          }

          .settings-main textarea.form-control {
            resize: vertical;
            min-height: 120px;
          }

          .settings-main .btn {
            width: 100%;
            min-height: 48px;
            padding: 0.85rem 1.5rem;
            font-size: 1rem;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }

          .btn-primary {
            background: var(--primary);
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #0052a3;
          }

          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-outline-danger {
            background: transparent;
            color: #dc3545;
            border: 2px solid #dc3545;
          }

          .btn-outline-danger:hover {
            background: rgba(220, 53, 69, 0.1);
          }

          .btn-block {
            display: block;
            width: 100%;
          }

          .settings-divider {
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2rem 0;
          }

          @media (max-width: 768px) {
            .settings-page {
              padding: 1rem 0.5rem;
            }

            .settings-main {
              padding: 1.5rem;
              border-radius: 8px;
            }

            .settings-main h1 {
              font-size: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .settings-main .form-group {
              margin-bottom: 1.25rem;
            }

            .form-label {
              font-size: 0.9rem;
              margin-bottom: 0.4rem;
            }

            .settings-main .form-control {
              font-size: 16px;
              padding: 0.75rem;
            }

            .settings-main .btn {
              min-height: 44px;
              padding: 0.75rem 1rem;
              font-size: 0.95rem;
            }

            .settings-divider {
              margin: 1.5rem 0;
            }
          }
        `}</style>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
