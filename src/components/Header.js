import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import NotificationBell from './NotificationBell';
import FontSizeControl from './FontSizeControl';

const toggleDarkTheme = () => {
  const html = document.documentElement;
  html.classList.toggle('dark-theme');
  localStorage.setItem('theme', html.classList.contains('dark-theme') ? 'dark' : 'light');
};

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"></path>
  </svg>
);



const LoggedOutView = props => {
  if (!props.currentUser) {
    return (
      <div>
        <li className="nav-item">
          <NavLink exact to="/" className="nav-link">
            Home
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/login" className="nav-link">
            Sign in
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/register" className="nav-link">
            Sign up
          </NavLink>
        </li>
      </div>
    );
  }
  return null;
};

const LoggedInView = props => {
  if (props.currentUser) {
    return (
      <div>
        <li className="nav-item">
          <NavLink exact to="/" className="nav-link">
            <HomeIcon /> Home
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/editor" className="nav-link">
            <PlusIcon /> New
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/reading-list" className="nav-link">
            <BookmarkIcon /> List
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/settings" className="nav-link">
            <SettingsIcon /> Settings
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to={`/@${props.currentUser.username}`} className="nav-link">
            <UserAvatar username={props.currentUser.username} image={props.currentUser.image} size="sm" /> {props.currentUser.username}
          </NavLink>
        </li>
      </div>
    );
  }

  return null;
};

class Header extends React.Component {
  render() {
    return (
      <div>
        <nav className="navbar navbar-light desktop-navbar">
          <div className="container">
            <Link to="/" className="navbar-brand">
              {this.props.appName.toLowerCase()}
            </Link>

            <ul className="nav navbar-nav pull-xs-right">
              <LoggedOutView currentUser={this.props.currentUser} />
              <LoggedInView currentUser={this.props.currentUser} />
              
              <li className="nav-item">
                <button className="theme-toggle-desktop" onClick={toggleDarkTheme} title="Toggle dark theme">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                </button>
              </li>

              <li className="nav-item">
                <FontSizeControl />
              </li>
              <li className="nav-item">
                <NotificationBell currentUser={this.props.currentUser} />
              </li>
            </ul>
          </div>
        </nav>

        <nav className="mobile-navbar">
          <div className="mobile-navbar-top">
            <Link to="/" className="navbar-brand">
              {this.props.appName.toLowerCase()}
            </Link>
            <div className="mobile-navbar-right">
              <button className="theme-toggle" onClick={toggleDarkTheme} title="Toggle dark theme">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              </button>
              <NotificationBell currentUser={this.props.currentUser} />
              {this.props.currentUser && (
                <Link to={`/@${this.props.currentUser.username}`} className="profile-link">
                  <UserAvatar username={this.props.currentUser.username} image={this.props.currentUser.image} size="sm" />
                </Link>
              )}
            </div>
          </div>

          <ul className="nav bottom-nav">
            {this.props.currentUser ? (
              <div style={{ display: 'contents' }}>
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    <HomeIcon />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/editor" className="nav-link">
                    <PlusIcon />
                    <span>New</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/reading-list" className="nav-link">
                    <BookmarkIcon />
                    <span>List</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/settings" className="nav-link">
                    <SettingsIcon />
                    <span>Settings</span>
                  </Link>
                </li>
              </div>
            ) : (
              <div style={{ display: 'contents' }}>
                <li className="nav-item">
                  <Link to="/" className="nav-link">
                    <HomeIcon />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    <span>Sign in</span>
                  </Link>
                </li>
              </div>
            )}
          </ul>
        </nav>

        <style>{`
          .desktop-navbar {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border-bottom: 1px solid #e1e4e8;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 999;
          }

          .mobile-navbar {
            display: none;
          }

          body {
            padding-top: 60px;
          }

          .desktop-navbar .navbar-brand {
            color: #5cb85c;
            margin-right: auto;
          }

          .desktop-navbar .nav {
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            gap: 0;
          }

          .search-bar {
            margin: 0 1rem;
          }

          .desktop-navbar .nav-item {
            display: flex;
            align-items: center;
            white-space: nowrap;
            margin: 0;
          }

          .desktop-navbar .nav-link {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            font-size: 0.95rem;
            color: #373a3c;
            text-decoration: none;
            transition: color 0.2s;
          }

          .desktop-navbar .nav-link:hover {
            color: #5cb85c;
            text-decoration: none;
          }

          .desktop-navbar .nav-link.active {
            color: #5cb85c;
            font-weight: 600;
          }

          .desktop-navbar .nav-link svg {
            width: 18px;
            height: 18px;
            stroke-width: 1.5;
          }

          .dark-theme .desktop-navbar {
            background: #1a1a1a;
            border-bottom-color: #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .dark-theme .desktop-navbar .nav-link {
            color: #ccc;
          }

          .dark-theme .desktop-navbar .nav-link:hover {
            color: #5cb85c;
            text-decoration: none;
          }

          .dark-theme .desktop-navbar .nav-link.active {
            color: #5cb85c;
          }

          .theme-toggle-desktop,
          .notification-btn-desktop {
            background: none;
            border: none;
            cursor: pointer;
            color: #373a3c;
            padding: 0.5rem 1rem;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .theme-toggle-desktop svg,
          .notification-btn-desktop svg {
            width: 18px;
            height: 18px;
            stroke-width: 1.5;
          }

          .theme-toggle-desktop:hover,
          .notification-btn-desktop:hover {
            color: #5cb85c;
          }

          .dark-theme .theme-toggle-desktop,
          .dark-theme .notification-btn-desktop {
            color: #e0e0e0;
          }

          .dark-theme .theme-toggle-desktop:hover,
          .dark-theme .notification-btn-desktop:hover {
            color: #5cb85c;
          }

          .mobile-navbar-top {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 12px 15px;
            border-bottom: 1px solid #e1e4e8;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            z-index: 998;
          }

          .dark-theme .mobile-navbar-top {
            background: #1a1a1a;
            border-bottom-color: #333;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .mobile-navbar-top .navbar-brand {
            font-size: 16px;
            font-weight: 600;
            color: #5cb85c;
            text-decoration: none;
            margin: 0;
          }

          .mobile-navbar-right {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .theme-toggle,
          .notification-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #373a3c;
            padding: 8px;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
          }

          .theme-toggle svg,
          .notification-btn svg {
            width: 20px;
            height: 20px;
            stroke-width: 1.5;
          }

          .theme-toggle:hover,
          .notification-btn:hover {
            color: #5cb85c;
          }

          .dark-theme .theme-toggle,
          .dark-theme .notification-btn {
            color: #e0e0e0;
          }

          .dark-theme .theme-toggle:hover,
          .dark-theme .notification-btn:hover {
            color: #5cb85c;
          }

          .profile-link {
            display: flex;
            align-items: center;
            min-width: 44px;
            min-height: 44px;
            justify-content: center;
          }

          .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid #e1e4e8;
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex !important;
            z-index: 1000;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
          }

          .dark-theme .bottom-nav {
            background: #1a1a1a;
            border-top-color: #333;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
          }

          .bottom-nav .nav-item {
            flex: 1;
            text-align: center;
            border-right: 1px solid #e1e4e8;
          }

          .bottom-nav .nav-item:last-child {
            border-right: none;
          }

          .dark-theme .bottom-nav .nav-item {
            border-right-color: #333;
          }

          .bottom-nav .nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 0;
            color: #373a3c;
            text-decoration: none;
            font-size: 16px;
            gap: 4px;
            transition: color 0.2s;
          }

          .bottom-nav .nav-link svg {
            width: 24px;
            height: 24px;
            stroke-width: 1.5;
          }

          .bottom-nav .nav-link span {
            font-size: 11px;
            font-weight: 500;
          }

          .bottom-nav .nav-link:hover {
            color: #5cb85c;
            text-decoration: none;
          }

          .dark-theme .bottom-nav .nav-link {
            color: #999;
          }

          .dark-theme .bottom-nav .nav-link:hover {
            color: #5cb85c;
            text-decoration: none;
          }

          .dark-theme {
            background: #0d0d0d !important;
            color: #e0e0e0 !important;
          }

          .dark-theme body {
            background: #0d0d0d !important;
            color: #e0e0e0 !important;
          }

          .dark-theme * {
            color: #e0e0e0;
          }

          .dark-theme a {
            color: #5cb85c;
          }

          .dark-theme a:hover {
            color: #6cc76c;
            text-decoration: none;
          }

          .dark-theme .navbar-brand {
            color: #5cb85c !important;
          }

          .dark-theme .nav-link {
            color: #e0e0e0 !important;
          }

          .dark-theme .nav-link:hover {
            color: #5cb85c !important;
          }

          .dark-theme input,
          .dark-theme textarea,
          .dark-theme select {
            background: #1a1a1a !important;
            color: #e0e0e0 !important;
            border-color: #333 !important;
          }

          .dark-theme button {
            color: #e0e0e0 !important;
          }

          .dark-theme .btn-primary {
            background-color: #5cb85c !important;
            border-color: #5cb85c !important;
            color: white !important;
          }

          .dark-theme .btn-outline-primary {
            color: #5cb85c !important;
            border-color: #5cb85c !important;
          }

          .dark-theme .btn-outline-primary:hover {
            background-color: #5cb85c !important;
            color: white !important;
          }

          .dark-theme .article-preview {
            background: #1a1a1a !important;
            border-color: #333 !important;
            color: #e0e0e0 !important;
          }

          .dark-theme .feed-toggle {
            background: #1a1a1a !important;
            border-color: #333 !important;
          }

          .dark-theme .feed-toggle .nav-link {
            color: #ccc !important;
          }

          .dark-theme .feed-toggle .nav-link.active {
            color: #5cb85c !important;
            border-color: #5cb85c !important;
          }

          .dark-theme .sidebar {
            background: #1a1a1a !important;
          }

          .dark-theme .sidebar p {
            color: #e0e0e0 !important;
          }

          .dark-theme .nav-pills .nav-link {
            color: #ccc !important;
          }

          .dark-theme .nav-pills .nav-link.active {
            background-color: transparent !important;
            color: #5cb85c !important;
          }

          .dark-theme .tag-pill {
            background-color: #555 !important;
          }

          .dark-theme .tag-pill:hover {
            background-color: #5cb85c !important;
          }

          @media (max-width: 768px) {
            .desktop-navbar {
              display: none;
            }

            .mobile-navbar {
              display: block;
            }

            body {
              padding-top: 50px;
              padding-bottom: 75px;
            }
          }

          @media (min-width: 769px) {
            .mobile-navbar {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default Header;
