import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import NavbarSearch from './NavbarSearch';

const mapStateToProps = state => ({
  appName: state.common.appName,
  currentUser: state.common.currentUser
});

const MinimalHeader = ({ appName, currentUser }) => {
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark-theme'));
  const [fontSize, setFontSize] = useState('medium');

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    document.body.className = document.body.className.replace(/font-\w+/g, '');
    document.body.classList.add(`font-${size}`);
    if (isDark) {
      document.body.classList.add('dark-theme');
    }
  };

  return (
    <nav className="minimal-navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          {appName}
        </Link>

        <NavbarSearch />

        <div className="navbar-controls">
          <div className="font-controls">
            <button
              className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
              onClick={() => changeFontSize('small')}
              title="Small text"
            >
              A
            </button>
            <button
              className={`font-btn ${fontSize === 'medium' ? 'active' : ''}`}
              onClick={() => changeFontSize('medium')}
              title="Medium text"
            >
              A
            </button>
            <button
              className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => changeFontSize('large')}
              title="Large text"
            >
              A
            </button>
          </div>

          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isDark ? (
                <g>
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </g>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              )}
            </svg>
          </button>

          {!currentUser && (
            <div className="auth-controls">
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .minimal-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          z-index: 1000;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 2rem;
          width: 100%;
          margin: 0 auto;
          align-content: center;
          flex-wrap: wrap;
        }

        .navbar-brand {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
          text-decoration: none;
          letter-spacing: -1px;
          text-transform: uppercase;
        }

        .navbar-brand:hover {
          text-decoration: none;
          color: var(--primary-hover);
        }

        .navbar-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .font-controls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--bg-hover);
          border-radius: 0;
          padding: 0.25rem;
          border: 1px solid var(--border-color);
        }

        .font-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          border-radius: 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .font-btn:nth-child(2) {
          font-size: 0.9rem;
        }

        .font-btn:nth-child(3) {
          font-size: 1rem;
        }

        .font-btn:hover {
          background: var(--bg-card);
          color: var(--primary);
        }

        .font-btn.active {
          background: var(--primary);
          color: var(--bg-body);
        }

        .theme-toggle {
          width: 40px;
          height: 40px;
          border: none;
          background: var(--bg-hover);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .theme-toggle:hover {
          background: var(--primary);
          color: white;
        }

        .theme-toggle svg {
          width: 20px;
          height: 20px;
          stroke-width: 1.5;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
          text-decoration: none;
        }

        .btn-outline-primary {
          background: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
        }

        .btn-outline-primary:hover {
          background: rgba(0, 102, 204, 0.1);
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .minimal-navbar {
            height: 56px;
          }

          .navbar-content {
            padding: 0 0.5rem;
            gap: 0.5rem;
          }

          .navbar-brand {
            font-size: 1.2rem;
            flex-shrink: 0;
          }

          .font-controls {
            display: none;
          }

          .navbar-controls {
            gap: 0.5rem;
            margin-left: auto;
          }

          .theme-toggle {
            width: 36px;
            height: 36px;
          }

          .auth-controls {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
};

export default connect(mapStateToProps)(MinimalHeader);
