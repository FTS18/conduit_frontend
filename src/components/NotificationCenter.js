import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MARK_NOTIFICATION_READ } from '../constants/notificationTypes';
import agent from '../agent';

const mapStateToProps = state => ({
  notifications: state.notifications?.notifications || [],
  unreadCount: state.notifications?.unreadCount || 0
});

const mapDispatchToProps = dispatch => ({
  markRead: id => dispatch({ type: MARK_NOTIFICATION_READ, payload: id })
});

class NotificationCenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      filterType: 'all',
      loading: false
    };
  }

  getNotificationMessage = (notif) => {
    switch (notif.type) {
      case 'mention':
        return `${notif.fromUser?.username || 'Someone'} mentioned you in a comment`;
      case 'comment':
        return `${notif.fromUser?.username || 'Someone'} commented on your article`;
      case 'follow':
        return `${notif.fromUser?.username || 'Someone'} started following you`;
      case 'favorite':
        return `${notif.fromUser?.username || 'Someone'} favorited your article`;
      default:
        return 'New notification';
    }
  };

  getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'comment':
        return '💭';
      case 'follow':
        return '👤';
      case 'favorite':
        return '❤️';
      default:
        return '📢';
    }
  };

  groupNotificationsByType = (notifications) => {
    const grouped = {};
    notifications.forEach(notif => {
      if (!grouped[notif.type]) {
        grouped[notif.type] = [];
      }
      grouped[notif.type].push(notif);
    });
    return grouped;
  };

  getFilteredNotifications = () => {
    const { notifications } = this.props;
    const { filterType } = this.state;

    if (filterType === 'all') {
      return notifications;
    }
    return notifications.filter(n => n.type === filterType);
  };

  markAllAsRead = async () => {
    const { notifications } = this.props;
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) return;

    this.setState({ loading: true });
    try {
      await Promise.all(
        unreadNotifications.map(notif => agent.Notifications.markRead(notif.id))
      );
      unreadNotifications.forEach(notif => {
        this.props.markRead(notif.id);
      });
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleNotificationClick = (notif) => {
    if (!notif.read) {
      agent.Notifications.markRead(notif.id).then(() => {
        this.props.markRead(notif.id);
      });
    }
  };

  render() {
    const { unreadCount } = this.props;
    const { isOpen, filterType, loading } = this.state;
    const filteredNotifications = this.getFilteredNotifications();
    const grouped = this.groupNotificationsByType(filteredNotifications);
    const notificationTypes = ['mention', 'comment', 'follow', 'favorite'];

    return (
      <div className="notification-center">
        <button
          className="notification-bell"
          onClick={() => this.setState({ isOpen: !isOpen })}
          title="Notifications"
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button 
                    onClick={this.markAllAsRead} 
                    className="btn-mark-all"
                    disabled={loading}
                  >
                    Mark all as read
                  </button>
                )}
                <button 
                  onClick={() => this.setState({ isOpen: false })}
                  className="btn-close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {filteredNotifications.length > 0 && (
              <div className="notification-filters">
                <button
                  className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => this.setState({ filterType: 'all' })}
                >
                  All
                </button>
                {notificationTypes.map(type => (
                  <button
                    key={type}
                    className={`filter-btn ${filterType === type ? 'active' : ''}`}
                    onClick={() => this.setState({ filterType: type })}
                  >
                    {this.getNotificationIcon(type)} {type}
                  </button>
                ))}
              </div>
            )}

            <div className="notification-list">
              {filteredNotifications.length === 0 ? (
                <p className="empty">No notifications</p>
              ) : (
                Object.entries(grouped).map(([type, notifs]) => (
                  <div key={type} className="notification-group">
                    <div className="group-header">
                      <span className="group-icon">{this.getNotificationIcon(type)}</span>
                      <span className="group-title">{type}</span>
                      <span className="group-count">{notifs.length}</span>
                    </div>
                    {notifs.map(notif => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => this.handleNotificationClick(notif)}
                      >
                        <div className="notification-content">
                          <p>{this.getNotificationMessage(notif)}</p>
                          {notif.comment?.article && (
                            <Link 
                              to={`/article/${notif.comment.article.slug}`}
                              className="notification-link"
                            >
                              {notif.comment.article.title}
                            </Link>
                          )}
                          <small>{new Date(notif.createdAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
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
            font-size: 0.7rem;
            font-weight: bold;
            border: 2px solid var(--bg-body);
          }

          .notification-dropdown {
            position: absolute;
            top: 100%;
            right: 0;
            width: 400px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            max-height: 500px;
            overflow-y: auto;
            margin-top: 0.5rem;
          }

          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            gap: 1rem;
          }

          .notification-header h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--text-main);
            font-weight: 700;
          }

          .header-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .btn-mark-all {
            background: none;
            border: none;
            color: var(--primary);
            cursor: pointer;
            font-size: 0.8rem;
            padding: 0.25rem 0.5rem;
            transition: color 0.2s;
          }

          .btn-mark-all:hover:not(:disabled) {
            color: var(--text-main);
          }

          .btn-mark-all:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: var(--text-light);
            transition: color 0.2s;
            padding: 0;
          }
          
          .btn-close:hover {
            color: var(--text-main);
          }

          .notification-filters {
            display: flex;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            overflow-x: auto;
          }

          .filter-btn {
            padding: 0.4rem 0.8rem;
            border: 1px solid var(--border-color);
            background: var(--bg-hover);
            color: var(--text-secondary);
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
          }

          .filter-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
          }

          .filter-btn.active {
            background: var(--primary);
            color: var(--bg-body);
            border-color: var(--primary);
          }

          .notification-list {
            max-height: 400px;
            overflow-y: auto;
          }

          .notification-group {
            border-bottom: 1px solid var(--border-color);
          }

          .group-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            background: var(--bg-hover);
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
          }

          .group-icon {
            font-size: 1rem;
          }

          .group-title {
            flex: 1;
            text-transform: capitalize;
          }

          .group-count {
            background: var(--primary);
            color: var(--bg-body);
            padding: 0.2rem 0.5rem;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: bold;
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

          .notification-link {
            display: block;
            color: var(--primary);
            text-decoration: none;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
            word-break: break-word;
          }

          .notification-link:hover {
            text-decoration: underline;
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
              width: 320px;
              right: -40px;
            }

            .notification-filters {
              flex-wrap: wrap;
            }

            .notification-item {
              padding: 0.75rem;
            }

            .notification-content p {
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationCenter);
