import React, { useState, useEffect, useRef } from 'react';
import agent from '../agent';

const NotificationBell = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      try {
        const result = await agent.Notifications.getAll();
        const notifs = result.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await agent.Notifications.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications</div>
          ) : (
            <div className="notification-list">
              {notifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    if (!notif.read) handleMarkRead(notif.id);
                    const slug = notif.comment && notif.comment.article ? notif.comment.article.slug : null;
                    if (slug) {
                      window.location.pathname = `/article/${slug}`;
                      setShowDropdown(false);
                    }
                  }}
                >
                  <div className="notification-content">
                    <div className="notification-text">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .notification-bell {
          position: relative;
        }

        .bell-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #373a3c;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: color 0.2s;
        }

        .dark-theme .bell-button {
          color: #e0e0e0;
        }

        .bell-button:hover {
          color: #5cb85c;
        }

        .unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .notification-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 4px;
          width: 300px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          margin-top: 0.5rem;
        }

        .dark-theme .notification-dropdown {
          background: #1a1a1a;
          border-color: #333;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .notification-header {
          padding: 0.75rem 1rem;
          font-weight: 600;
          border-bottom: 1px solid #e1e4e8;
          color: #333;
        }

        .dark-theme .notification-header {
          border-bottom-color: #333;
          color: #e0e0e0;
        }

        .notification-empty {
          padding: 1rem;
          text-align: center;
          color: #999;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dark-theme .notification-item {
          border-bottom-color: #333;
        }

        .notification-item:hover {
          background: #f8f9fa;
        }

        .dark-theme .notification-item:hover {
          background: #2a2a2a;
        }

        .notification-item.unread {
          background: #f0f8ff;
        }

        .dark-theme .notification-item.unread {
          background: #1a3a4a;
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .notification-text {
          font-size: 0.9rem;
          color: #333;
        }

        .dark-theme .notification-text {
          color: #e0e0e0;
        }

        .notification-time {
          font-size: 0.8rem;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
