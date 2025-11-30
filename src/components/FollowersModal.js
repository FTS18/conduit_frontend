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
  const [lastUsername, setLastUsername] = useState(null);

  useEffect(() => {
    if (isOpen && username && username !== lastUsername) {
      setLoading(true);
      agent.Profile.getFollowers(username)
        .then(res => {
          setFollowers(res.followers || []);
          setLastUsername(username);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username, lastUsername]);

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
    setFollowers(prev => prev.filter(f => f.username !== followerUsername));
  };

  if (!isOpen) return null;

  return (
    <div className="followers-modal-overlay" onClick={onClose}>
      <div className="followers-modal-content" onClick={e => e.stopPropagation()}>
        <div className="followers-modal-header">
          <h3>Followers</h3>
          <button className="followers-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="followers-modal-body">
          {loading ? (
            <div className="followers-loading">Loading...</div>
          ) : followers.length === 0 ? (
            <div className="followers-empty">No followers yet</div>
          ) : (
            followers.map(follower => (
              <div key={follower.username} className="followers-user-item">
                <Link to={`/@${follower.username}`} className="followers-user-link" onClick={(e) => e.stopPropagation()}>
                  <UserAvatar username={follower.username} image={follower.image} size="sm" />
                  <div className="followers-user-info">
                    <div className="followers-username">{follower.username}</div>
                    <div className="followers-bio">{follower.bio || 'Member'}</div>
                  </div>
                </Link>
                {currentUser && currentUser.username !== follower.username && (
                  <button
                    className={`followers-follow-btn ${follower.following ? 'following' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      follower.following ? handleUnfollow(e, follower.username) : handleFollow(e, follower.username);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {follower.following ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <style>{styles}</style>
      </div>
    </div>
  );
};

const styles = `
  .followers-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: followersModalFadeIn 0.2s ease-out;
  }

  @keyframes followersModalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .followers-modal-content {
    background: var(--bg-card);
    border-radius: 16px;
    width: 90%;
    max-width: 480px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    animation: followersModalSlideUp 0.3s ease-out;
  }

  @keyframes followersModalSlideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .followers-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .followers-modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: 0.3px;
  }

  .followers-modal-close {
    background: none;
    border: none;
    font-size: 1.3rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0.25rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .followers-modal-close:hover {
    background: var(--bg-hover);
    color: var(--text-main);
  }

  .followers-modal-body {
    overflow-y: auto;
    flex: 1;
    padding: 0.5rem 0;
  }

  .followers-modal-body::-webkit-scrollbar {
    width: 6px;
  }

  .followers-modal-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .followers-modal-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .followers-modal-body::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  .followers-user-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 1rem;
    margin: 0 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .followers-user-item:hover {
    background: var(--bg-hover);
  }

  .followers-user-link {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex: 1;
    min-width: 0;
    text-decoration: none;
  }

  .followers-user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .followers-username {
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.9rem;
    letter-spacing: 0.2px;
  }

  .followers-bio {
    font-size: 0.8rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .followers-follow-btn {
    padding: 0.45rem 1rem;
    background: transparent;
    border: 1.5px solid var(--primary);
    border-radius: 22px;
    color: var(--primary);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
    flex-shrink: 0;
    z-index: 10;
  }

  .followers-follow-btn:hover {
    background: var(--primary);
    color: var(--bg-body);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .followers-follow-btn.following {
    background: transparent;
    color: var(--text-secondary);
    border-color: var(--border-color);
  }

  .followers-follow-btn.following:hover {
    background: var(--bg-hover);
    border-color: var(--text-secondary);
    color: var(--text-main);
  }

  .followers-loading, .followers-empty {
    text-align: center;
    padding: 3rem 1.5rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`;

export default connect(mapStateToProps, mapDispatchToProps)(FollowersModal);
