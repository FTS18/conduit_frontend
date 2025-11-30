import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  currentUser: state.common.currentUser
});

const Sidebar = ({ currentUser, location }) => {
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="sidebar-nav">
      <div className="sidebar-content">
        <div className="nav-section">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <span className="nav-text">Home</span>
          </Link>

          {currentUser && (
            <Link to="/editor" className={`nav-item ${isActive('/editor') ? 'active' : ''}`}>
              <span className="nav-text">Write</span>
            </Link>
          )}

          <Link to="/reading-list" className={`nav-item ${isActive('/reading-list') ? 'active' : ''}`}>
            <span className="nav-text">Bookmarks</span>
          </Link>

          <Link to="/notifications" className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}>
            <span className="nav-text">Notifications</span>
          </Link>

          {currentUser && (
            <Link to={`/@${currentUser.username}`} className={`nav-item ${location.pathname === `/@${currentUser.username}` ? 'active' : ''}`}>
              <span className="nav-text">Profile</span>
            </Link>
          )}
        </div>

        {currentUser && (
          <div className="nav-section">
            <div className="nav-divider"></div>
            <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
              <span className="nav-text">Settings</span>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .sidebar-nav {
          position: fixed;
          left: 0;
          top: 64px;
          width: 280px;
          height: calc(100vh - 64px);
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          z-index: 100;
          overflow-y: auto;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .sidebar-content {
          padding: 1.5rem 0;
        }

        .nav-section {
          margin-bottom: 1rem;
        }

        .nav-divider {
          height: 1px;
          background: var(--border-color);
          margin: 1rem 1.5rem;
        }

        .nav-item {
          display: block;
          padding: 0.75rem 1.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
          border-radius: 0;
          font-weight: 600;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--primary);
          text-decoration: none;
        }

        .nav-item.active {
          background: var(--bg-hover);
          color: var(--primary);
          border-left-color: var(--primary);
        }

        .nav-text {
          font-size: 1rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .sidebar-nav {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            top: 56px;
            height: calc(100vh - 56px);
          }

          .sidebar-nav.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default withRouter(connect(mapStateToProps)(Sidebar));
