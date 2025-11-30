import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import NotificationBell from './NotificationBell';
import FontSizeControl from './FontSizeControl';

const toggleDarkTheme = () => {
  const body = document.body;
  body.classList.toggle('dark-theme');
  localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
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

class Header extends React.Component {
  render() {
    const { pathname } = this.props.location;
    const isHomeActive = pathname === '/' || pathname.startsWith('/article/');

    return (
      <div>
        <nav className="navbar navbar-light desktop-navbar">
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              {this.props.appName.toLowerCase()}
            </Link>
          </div>

          <div className="navbar-right">
            <button className="nav-icon-btn" onClick={toggleDarkTheme} title="Toggle dark theme">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </button>
            <FontSizeControl />
            <NotificationBell currentUser={this.props.currentUser} />
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
                  <Link to="/" className={`nav-link ${isHomeActive ? 'active' : ''}`}>
                    <HomeIcon />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/editor" className={`nav-link ${pathname === '/editor' ? 'active' : ''}`}>
                    <PlusIcon />
                    <span>New</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/reading-list" className={`nav-link ${pathname === '/reading-list' ? 'active' : ''}`}>
                    <BookmarkIcon />
                    <span>List</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/settings" className={`nav-link ${pathname === '/settings' ? 'active' : ''}`}>
                    <SettingsIcon />
                    <span>Settings</span>
                  </Link>
                </li>
              </div>
            ) : (
              <div style={{ display: 'contents' }}>
                <li className="nav-item">
                  <Link to="/" className={`nav-link ${isHomeActive ? 'active' : ''}`}>
                    <HomeIcon />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
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
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.3);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 999;
            height: 56px;
            align-items: center;
            padding: 0;
            backdrop-filter: blur(20px);
          }
          
          .navbar-left {
            flex-shrink: 0;
            width: 360px;
            display: flex;
            align-items: center;
            padding-left: 2rem;
            height: 100%;
          }

          .navbar-brand {
            color: var(--primary);
            font-size: 1.4rem;
            font-weight: 700;
            text-decoration: none;
            margin: 0;
          }

          .navbar-right {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding-right: 2rem;
            width: 450px;
          }

          .nav-icon-btn {
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0.6rem 0.8rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            min-height: 40px;
            min-width: 40px;
            font-size: 0.9rem;
            font-weight: 500;
          }

          .nav-icon-btn:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
          }

          .nav-icon-btn svg {
            width: 18px;
            height: 18px;
            stroke-width: 1.5;
          }

          .mobile-navbar-top {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--bg-card);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            z-index: 998;
            height: 56px;
          }

          .mobile-navbar-top .navbar-brand {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--primary);
            text-decoration: none;
            margin: 0;
          }

          .mobile-navbar-right {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .theme-toggle,
          .notification-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 8px;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 44px;
            border-radius: 8px;
          }

          .theme-toggle:hover,
          .notification-btn:hover {
            color: var(--primary);
          }

          .theme-toggle svg,
          .notification-btn svg {
            width: 20px;
            height: 20px;
            stroke-width: 1.5;
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
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex !important;
            z-index: 1000;
            box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
          }

          .bottom-nav .nav-item {
            flex: 1;
            text-align: center;
            border-right: 1px solid var(--border-color);
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .bottom-nav .nav-item:last-child {
            border-right: none;
          }

          .bottom-nav .nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 0;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 16px;
            gap: 4px;
            transition: color 0.2s;
          }

          .bottom-nav .nav-link:hover,
          .bottom-nav .nav-link.active {
            color: var(--primary);
            text-decoration: none;
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

          body {
            padding-top: 56px;
          }

          @media (max-width: 768px) {
            .desktop-navbar {
              display: none;
            }

            .mobile-navbar {
              display: block;
            }

            body {
              padding-top: 56px;
              padding-bottom: 60px;
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

export default withRouter(Header);
