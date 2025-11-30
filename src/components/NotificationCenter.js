import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MARK_NOTIFICATION_READ } from '../constants/notificationTypes';
import agent from '../agent';

const mapStateToProps = state => ({
  notifications: state.notifications.notifications,
  unreadCount: state.notifications.unreadCount
});

const mapDispatchToProps = dispatch => ({
  markRead: id => dispatch({ type: MARK_NOTIFICATION_READ, payload: id })
});

const NotificationCenter = ({ notifications, unreadCount, markRead }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const getNotificationMessage = (notif) => {
    switch (notif.type) {
      case 'mention':
        return `${notif.actor.username} mentioned you in a comment`;
      case 'comment':
        return `${notif.actor.username} commented on your article`;
      case 'follow':
        return `${notif.actor.username} started following you`;
      case 'favorite':
        return `${notif.actor.username} favorited your article`;
      default:
        return 'New notification';
    }
  };

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="empty">No notifications</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className="notification-content">
                    <p>{getNotificationMessage(notif)}</p>
                    <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .notification-center {
          position: relative;
        }

        .notification-bell {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          position: relative;
          padding: 0.5rem;
          color: var(--text-main);
          transition: opacity 0.2s;
        }
        
        .notification-bell:hover {
          opacity: 0.7;
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--primary);
          color: var(--bg-body);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          border: 1px solid var(--bg-body);
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 350px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-md);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .notification-header h3 {
          margin: 0;
          font-size: 1rem;
          color: var(--text-main);
          font-weight: 700;
        }

        .notification-header button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--text-light);
          transition: color 0.2s;
        }
        
        .notification-header button:hover {
          color: var(--text-main);
        }

        .notification-list {
          max-height: 350px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }

        .notification-item:hover {
          background: var(--bg-hover);
        }

        .notification-item.unread {
          background: var(--secondary);
          font-weight: 600;
        }

        .notification-content p {
          margin: 0 0 0.5rem 0;
          color: var(--text-main);
          font-size: 0.9rem;
        }

        .notification-content small {
          color: var(--text-light);
          font-size: 0.8rem;
        }

        .empty {
          padding: 2rem 1rem;
          text-align: center;
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .notification-dropdown {
            width: 300px;
            right: -50px;
          }
        }
      `}</style>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NotificationCenter);
