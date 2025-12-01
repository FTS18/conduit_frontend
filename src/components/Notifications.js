import React from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import { connect } from 'react-redux';
import agent from '../agent';
import {
  NOTIFICATIONS_PAGE_LOADED,
  NOTIFICATIONS_PAGE_UNLOADED
} from '../constants/actionTypes';

const mapStateToProps = state => ({
  currentUser: state.common.currentUser,
  notifications: state.common.notifications || []
});

const mapDispatchToProps = dispatch => ({
  onLoad: () => dispatch({
    type: NOTIFICATIONS_PAGE_LOADED,
    payload: agent.Notifications.getAll()
  }),
  onUnload: () => dispatch({ type: NOTIFICATIONS_PAGE_UNLOADED })
});

class Notifications extends React.Component {
  componentDidMount() {
    this.props.onLoad();
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  getNotificationIcon = (type) => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'follow':
        return '👤';
      case 'favorite':
        return '❤️';
      case 'comment':
        return '💭';
      default:
        return '📢';
    }
  };

  getNotificationMessage = (notif) => {
    const formatName = (name) => (name || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const actorName = formatName(notif.actor.username);

    switch (notif.type) {
      case 'mention':
        return `${actorName} mentioned you in a comment`;
      case 'follow':
        return `${actorName} started following you`;
      case 'favorite':
        return `${actorName} favorited your article`;
      case 'comment':
        return `${actorName} commented on your article`;
      default:
        return notif.message;
    }
  };

  render() {
    const { notifications } = this.props;

    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <h1>Notifications</h1>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif, idx) => (
                <div key={idx} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                  <div className="notification-icon">
                    {this.getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <Link to={`/@${notif.actor.username}`} className="actor-name">
                        {(notif.actor.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Link>
                      <span className="notification-time">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="notification-message">
                      {this.getNotificationMessage(notif)}
                    </p>
                    {notif.article && (
                      <Link to={`/article/${notif.article.slug}`} className="article-link">
                        {notif.article.title}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          .notifications-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 2rem 1rem;
          }

          .notifications-container {
            width: 100%;
            max-width: none;
          }

          .notifications-container h1 {
            color: var(--primary);
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
            letter-spacing: -0.5px;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--text-secondary);
            background: var(--bg-card);
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }

          .notifications-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .notification-item {
            display: flex;
            gap: 1rem;
            padding: 1.25rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-card);
            transition: all 0.2s;
          }

          .notification-item.unread {
            background: rgba(0, 102, 204, 0.05);
            border-color: var(--primary);
          }

          .notification-item:hover {
            box-shadow: 0 2px 8px rgba(0, 102, 204, 0.15);
          }

          .notification-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .notification-content {
            flex: 1;
            min-width: 0;
          }

          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            gap: 1rem;
          }

          .actor-name {
            font-weight: 600;
            color: var(--primary);
            text-decoration: none;
          }

          .actor-name:hover {
            text-decoration: underline;
          }

          .notification-time {
            font-size: 0.85rem;
            color: var(--text-secondary);
            white-space: nowrap;
          }

          .notification-message {
            margin: 0.5rem 0;
            color: var(--text-main);
            font-size: 0.95rem;
          }

          .article-link {
            display: inline-block;
            margin-top: 0.5rem;
            padding: 0.4rem 0.8rem;
            background: var(--bg-hover);
            border-radius: 4px;
            color: var(--primary);
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.2s;
          }

          .article-link:hover {
            background: var(--primary);
            color: white;
          }

          @media (max-width: 768px) {
            .notifications-page {
              padding: 1rem 0.5rem;
            }

            .notifications-container h1 {
              font-size: 1.5rem;
              margin-bottom: 1.5rem;
            }

            .notification-item {
              padding: 0.75rem;
              gap: 0.75rem;
            }

            .notification-icon {
              width: 32px;
              height: 32px;
              font-size: 1.25rem;
            }

            .notification-message {
              font-size: 0.9rem;
            }

            .notification-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.25rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);
