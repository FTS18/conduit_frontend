import ListErrors from './ListErrors';
import React from 'react';
import agent from '../agent';
import { connect } from 'react-redux';
import AccountLinkingSettings from './AccountLinkingSettings';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
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
      password: '',
      location: '',
      website: '',
      inProgress: false
    };

    this.updateState = field => ev => {
      const state = this.state;
      const newState = Object.assign({}, state, { [field]: ev.target.value });
      this.setState(newState);
    };

    this.submitForm = ev => {
      ev.preventDefault();
      
      this.setState({ inProgress: true });

      const user = {
        image: this.state.image,
        username: this.state.username,
        bio: this.state.bio,
        email: this.state.email,
        location: this.state.location,
        website: this.state.website
      };
      
      if (this.state.password && this.state.password.trim()) {
        user.password = this.state.password;
      }

      this.props.onSubmitForm(user);
    };
  }

  componentWillMount() {
    if (this.props.currentUser) {
      this.setState({
        image: this.props.currentUser.image || '',
        username: this.props.currentUser.username || '',
        bio: this.props.currentUser.bio || '',
        email: this.props.currentUser.email || '',
        location: this.props.currentUser.location || '',
        website: this.props.currentUser.website || ''
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUser && nextProps.currentUser !== this.props.currentUser) {
      this.setState({
        image: nextProps.currentUser.image || '',
        username: nextProps.currentUser.username || '',
        bio: nextProps.currentUser.bio || '',
        email: nextProps.currentUser.email || '',
        location: nextProps.currentUser.location || '',
        website: nextProps.currentUser.website || '',
        password: '',
        inProgress: false
      });
    }
    
    if (nextProps.errors !== this.props.errors) {
      this.setState({ inProgress: false });
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
            <label className="form-label">Location (optional)</label>
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="City, Country"
              value={this.state.location}
              onChange={this.updateState('location')} />
          </fieldset>

          <fieldset className="form-group">
            <label className="form-label">Website (optional)</label>
            <input
              className="form-control form-control-lg"
              type="url"
              placeholder="https://yourwebsite.com"
              value={this.state.website}
              onChange={this.updateState('website')} />
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

          <Button
            variant="primary"
            size="lg"
            className="update-btn"
            type="submit"
            disabled={this.state.inProgress}>
            {this.state.inProgress ? 'Updating...' : 'Update Profile'}
          </Button>

        </fieldset>
      </form>
    );
  }
}

const mapStateToProps = state => (({
  ...state.settings,
  currentUser: state.common.currentUser
}));

const mapDispatchToProps = dispatch => (({
  onClickLogout: () => dispatch({ type: LOGOUT }),
  onSubmitForm: user =>
    dispatch({ type: SETTINGS_SAVED, payload: agent.Auth.save(user) }),
  onUnload: () => dispatch({ type: SETTINGS_PAGE_UNLOADED })
}));

class Settings extends React.Component {
  handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) {
      agent.Auth.delete().then(() => {
        window.localStorage.removeItem('jwt');
        window.location.href = '/';
      }).catch(err => {
        alert('Failed to delete account');
      });
    }
  };

  render() {
    return (
      <div className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <h1>Account Settings</h1>
            <p>Manage your profile information and account preferences</p>
          </div>

          <ListErrors errors={this.props.errors}></ListErrors>

          <Card className="profile-settings-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsForm
                currentUser={this.props.currentUser}
                onSubmitForm={this.props.onSubmitForm} />
            </CardContent>
          </Card>

          <Card className="account-linking-card">
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountLinkingSettings currentUser={this.props.currentUser} />
            </CardContent>
          </Card>

          <Card className="danger-zone-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="action-buttons">
                <Button
                  variant="destructive"
                  size="lg"
                  className="logout-btn"
                  onClick={this.props.onClickLogout}>
                  Sign Out
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="delete-btn"
                  onClick={this.handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <style>{`
          .settings-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .settings-container {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .settings-header {
            text-align: center;
            margin-bottom: 1rem;
          }

          .settings-header h1 {
            margin: 0 0 0.5rem 0;
            color: var(--text-main);
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -0.5px;
          }

          .settings-header p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 1.1rem;
          }

          .profile-settings-card,
          .account-linking-card,
          .danger-zone-card {
            width: 100%;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .logout-btn,
          .delete-btn {
            width: 100%;
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
            border-radius: 8px;
            padding: 0.75rem;
            font-size: 0.95rem;
            color: var(--text-main);
            background: var(--bg-body);
            transition: all 0.2s;
            box-sizing: border-box;
            font-family: inherit;
          }

          .form-control:focus {
            border-color: var(--primary);
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .form-control-lg {
            font-size: 0.95rem;
            padding: 0.85rem;
          }

          textarea.form-control {
            resize: vertical;
            min-height: 100px;
          }

          .update-btn {
            width: 100%;
            margin-top: 1rem;
          }

          @media (max-width: 768px) {
            .settings-page {
              padding: 1rem 0.5rem;
            }

            .settings-container {
              gap: 1.5rem;
            }

            .settings-header h1 {
              font-size: 2rem;
            }

            .settings-header p {
              font-size: 1rem;
            }

            .form-group {
              margin-bottom: 1.25rem;
            }

            .form-label {
              font-size: 0.9rem;
              margin-bottom: 0.4rem;
            }

            .form-control {
              font-size: 16px;
              padding: 0.75rem;
            }
          }
        `}</style>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
