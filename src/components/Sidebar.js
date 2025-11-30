import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { LOGOUT } from '../constants/actionTypes';

const mapStateToProps = state => (({
  currentUser: state.common.currentUser
}));

const mapDispatchToProps = dispatch => (({
  onLogout: () => dispatch({ type: LOGOUT })
}));

const Sidebar = ({ currentUser, location, onLogout }) => {
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

      {currentUser && (
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={onLogout}>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .sidebar-nav {
          position: fixed;
          left: 0;
          top: 64px;
          width: 25%;
          height: calc(100vh - 64px);
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          box-shadow: 2px 0 16px rgba(0, 0, 0, 0.1);
          z-index: 100;
          overflow-y: auto;
          transition: background-color 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .sidebar-content {
          padding: 1.5rem 0;
          flex: 1;
        }

        .sidebar-footer {
          padding: 1rem 0;
          border-top: 1px solid var(--border-color);
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
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
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

        .logout-btn {
          color: #dc3545;
        }

        .logout-btn:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sidebar));
