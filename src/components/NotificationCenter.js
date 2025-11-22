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
        }

        .badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 350px;
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          max-height: 400px;
          overflow-y: auto;
        }

        .dark-theme .notification-dropdown {
          background: #1a1a1a;
          border-color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #e1e4e8;
        }

        .dark-theme .notification-header {
          border-bottom-color: #333;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #373a3c;
        }

        .dark-theme .notification-header h3 {
          color: #e0e0e0;
        }

        .notification-header button {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #666;
        }

        .notification-list {
          max-height: 350px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dark-theme .notification-item {
          border-bottom-color: #222;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .dark-theme .notification-item:hover {
          background: #222;
        }

        .notification-item.unread {
          background: #f0f8f0;
          font-weight: 600;
        }

        .dark-theme .notification-item.unread {
          background: rgba(92, 184, 92, 0.1);
        }

        .notification-content p {
          margin: 0 0 0.5rem 0;
          color: #373a3c;
          font-size: 0.9rem;
        }

        .dark-theme .notification-content p {
          color: #e0e0e0;
        }

        .notification-content small {
          color: #999;
          font-size: 0.8rem;
        }

        .dark-theme .notification-content small {
          color: #888;
        }

        .empty {
          padding: 2rem 1rem;
          text-align: center;
          color: #999;
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
