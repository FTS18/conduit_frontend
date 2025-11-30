import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import agent from '../agent';
import { connect } from 'react-redux';
import { FOLLOW_USER, UNFOLLOW_USER } from '../constants/actionTypes';

const mapStateToProps = state => ({
  currentUser: state.common.currentUser,
});

const mapDispatchToProps = dispatch => ({
  onFollow: username => dispatch({
    type: FOLLOW_USER,
    payload: agent.Profile.follow(username)
  }),
  onUnfollow: username => dispatch({
    type: UNFOLLOW_USER,
    payload: agent.Profile.unfollow(username)
  })
});

const FollowersModal = ({ username, isOpen, onClose, currentUser, onFollow, onUnfollow }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      agent.Profile.getFollowers(username)
        .then(res => {
          setFollowers(res.followers || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username]);

  const handleFollow = (e, followerUsername) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow(followerUsername);
    setFollowers(prev => prev.map(f =>
      f.username === followerUsername ? { ...f, following: true } : f
    ));
  };

  const handleUnfollow = (e, followerUsername) => {
    e.preventDefault();
    e.stopPropagation();
    onUnfollow(followerUsername);
    setFollowers(prev => prev.map(f =>
      f.username === followerUsername ? { ...f, following: false } : f
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Followers</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : followers.length === 0 ? (
            <div className="empty">No followers yet</div>
          ) : (
            followers.map(follower => (
              <Link key={follower.username} to={`/@${follower.username}`} className="user-item">
                <UserAvatar username={follower.username} image={follower.image} size="sm" />
                <div className="user-info">
                  <div className="username">{follower.username}</div>
                  <div className="bio">{follower.bio || 'Member'}</div>
                </div>
                {currentUser && currentUser.username !== follower.username && (
                  <button
                    className={`follow-btn ${follower.following ? 'following' : ''}`}
                    onClick={(e) => follower.following ? handleUnfollow(e, follower.username) : handleFollow(e, follower.username)}
                  >
                    {follower.following ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </Link>
            ))
          )}
        </div>
        <style>{styles}</style>
      </div>
    </div>
  );
};

const styles = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--bg-card);
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-main);
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-close:hover {
    color: var(--text-main);
  }

  .modal-body {
    overflow-y: auto;
    flex: 1;
  }

  .user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    text-decoration: none;
    transition: background 0.2s;
  }

  .user-item:hover {
    background: var(--bg-hover);
  }

  .user-info {
    flex: 1;
    min-width: 0;
  }

  .username {
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.95rem;
  }

  .bio {
    font-size: 0.85rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .follow-btn {
    padding: 0.4rem 0.8rem;
    background: transparent;
    border: 1px solid var(--primary);
    border-radius: 20px;
    color: var(--primary);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .follow-btn:hover {
    background: var(--primary);
    color: var(--bg-body);
  }

  .follow-btn.following {
    background: var(--bg-hover);
    color: var(--text-secondary);
    border-color: var(--border-color);
  }

  .loading, .empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
  }
`;

export default connect(mapStateToProps, mapDispatchToProps)(FollowersModal);
