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

const FollowingModal = ({ username, isOpen, onClose, currentUser, onFollow, onUnfollow }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUsername, setLastUsername] = useState(null);

  useEffect(() => {
    if (isOpen && username && username !== lastUsername) {
      setLoading(true);
      agent.Profile.getFollowing(username)
        .then(res => {
          setFollowing(res.following || []);
          setLastUsername(username);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, username, lastUsername]);

  const handleFollow = (e, followingUsername) => {
    e.preventDefault();
    e.stopPropagation();
    onFollow(followingUsername);
    setFollowing(prev => prev.map(f =>
      f.username === followingUsername ? { ...f, following: true } : f
    ));
  };

  const handleUnfollow = (e, followingUsername) => {
    e.preventDefault();
    e.stopPropagation();
    onUnfollow(followingUsername);
    setFollowing(prev => prev.filter(f => f.username !== followingUsername));
  };

  if (!isOpen) return null;

  return (
    <div className="following-modal-overlay" onClick={onClose}>
      <div className="following-modal-content" onClick={e => e.stopPropagation()}>
        <div className="following-modal-header">
          <h3>Following</h3>
          <button className="following-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="following-modal-body">
          {loading ? (
            <div className="following-loading">Loading...</div>
          ) : following.length === 0 ? (
            <div className="following-empty">Not following anyone yet</div>
          ) : (
            following.map(user => (
              <div key={user.username} className="following-user-item">
                <Link to={`/@${user.username}`} className="following-user-link">
                  <UserAvatar username={user.username} image={user.image} size="sm" />
                  <div className="following-user-info">
                    <div className="following-username">{user.username}</div>
                    <div className="following-bio">{user.bio || 'Member'}</div>
                  </div>
                </Link>
                {currentUser && currentUser.username !== user.username && (
                  <button
                    className={`following-follow-btn ${user.following ? 'following' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      user.following ? handleUnfollow(e, user.username) : handleFollow(e, user.username);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {user.following ? 'Unfollow' : 'Follow'}
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
  .following-modal-overlay {
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
    animation: followingModalFadeIn 0.2s ease-out;
  }

  @keyframes followingModalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .following-modal-content {
    background: var(--bg-card);
    border-radius: 16px;
    width: 90%;
    max-width: 480px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    animation: followingModalSlideUp 0.3s ease-out;
  }

  @keyframes followingModalSlideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .following-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  .following-modal-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-main);
    letter-spacing: 0.3px;
  }

  .following-modal-close {
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

  .following-modal-close:hover {
    background: var(--bg-hover);
    color: var(--text-main);
  }

  .following-modal-body {
    overflow-y: auto;
    flex: 1;
    padding: 0.5rem 0;
  }

  .following-modal-body::-webkit-scrollbar {
    width: 6px;
  }

  .following-modal-body::-webkit-scrollbar-track {
    background: transparent;
  }

  .following-modal-body::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  .following-modal-body::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  .following-user-item {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 0.75rem 1rem;
    margin: 0 0.5rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .following-user-item:hover {
    background: var(--bg-hover);
  }

  .following-user-link {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    flex: 1;
    min-width: 0;
    text-decoration: none;
    pointer-events: auto;
  }

  .following-user-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .following-username {
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.9rem;
    letter-spacing: 0.2px;
  }

  .following-bio {
    font-size: 0.8rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .following-follow-btn {
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
    pointer-events: auto !important;
    z-index: 10 !important;
  }

  .following-follow-btn:hover {
    background: var(--primary);
    color: var(--bg-body);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .following-follow-btn.following {
    background: transparent;
    color: var(--text-secondary);
    border-color: var(--border-color);
  }

  .following-follow-btn.following:hover {
    background: var(--bg-hover);
    border-color: var(--text-secondary);
    color: var(--text-main);
  }

  .following-loading, .following-empty {
    text-align: center;
    padding: 3rem 1.5rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
  }
`;

export default connect(mapStateToProps, mapDispatchToProps)(FollowingModal);
