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

const RecommendedProfiles = (props) => {
  const { currentUser, showOnlyOnHome = false } = props;
  const [displayedProfiles, setDisplayedProfiles] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(4);

  useEffect(() => {
    if (showOnlyOnHome && window.location.pathname.includes('/article/')) {
      setDisplayedProfiles([]);
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        const result = await agent.Profile.getAllUsers();
        let profiles = (result && result.users) || [];

        profiles = profiles.filter(p => !currentUser || p.username !== currentUser.username);

        if (currentUser) {
          const followingRes = await agent.Profile.getFollowing(currentUser.username);
          const followingUsernames = new Set((followingRes && followingRes.following || []).map(u => u.username));
          profiles = profiles.map(p => ({
            ...p,
            following: followingUsernames.has(p.username)
          }));
        }

        profiles.sort((a, b) => (a.following ? 1 : 0) - (b.following ? 1 : 0));
        setAllProfiles(profiles);
        setDisplayedProfiles(profiles.slice(0, 4));
        setDisplayCount(4);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setAllProfiles([]);
        setDisplayedProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser, showOnlyOnHome]);

  const handleFollowClick = (e, profile) => {
    e.preventDefault();
    e.stopPropagation();

    if (profile.following) {
      props.onUnfollow(profile.username);
    } else {
      props.onFollow(profile.username);
    }

    const updateAndSort = (prev) => {
      const newProfiles = prev.map(p =>
        p.username === profile.username ? { ...p, following: !p.following } : p
      );
      newProfiles.sort((a, b) => (a.following ? 1 : 0) - (b.following ? 1 : 0));
      return newProfiles;
    };

    setAllProfiles(updateAndSort);
    setDisplayedProfiles(prev => {
      const updated = updateAndSort([...prev]);
      return updated.slice(0, displayCount);
    });
  };

  const handleLoadMore = () => {
    const newCount = displayCount + 4;
    setDisplayCount(newCount);
    setDisplayedProfiles(allProfiles.slice(0, newCount));
  };

  if (loading) {
    return (
      <div className="recommended-profiles">
        <div className="profiles-header">
          <h3>Who to follow</h3>
        </div>
        <div className="loading">Loading...</div>
        <style>{styles}</style>
      </div>
    );
  }

  if (allProfiles.length === 0) {
    return (
      <div className="recommended-profiles">
        <div className="profiles-header">
          <h3>Who to follow</h3>
        </div>
        <div className="loading">No profiles available</div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="recommended-profiles">
      <div className="profiles-header">
        <h3>Who to follow</h3>
      </div>
      <div className="profiles-list">
        {displayedProfiles.map(profile => (
          <div key={profile.username} className="profile-item">
            <Link to={`/@${profile.username}`} className="profile-link" onClick={(e) => {
              if (e.target.closest('.follow-btn')) {
                e.preventDefault();
              }
            }}>
              <UserAvatar username={profile.username} image={profile.image} size="sm" />
              <div className="profile-details">
                <div className="profile-username">
                  {(profile.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="profile-bio">{profile.bio || 'Member of the community'}</div>
              </div>
            </Link>
            <button
              className={`follow-btn ${profile.following ? 'following' : ''}`}
              onClick={(e) => handleFollowClick(e, profile)}
            >
              {profile.following ? 'Unfollow' : 'Follow'}
            </button>
          </div>
        ))}
        {displayCount < allProfiles.length && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>

      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .recommended-profiles {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .profiles-header h3 {
    margin: 0 0 1rem 0;
    font-size: calc(1rem * var(--font-scale));
    font-weight: 700;
    color: var(--text-main);
    font-family: 'Rajdhani', sans-serif;
  }

  .profiles-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 100px;
  }

  .profile-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .profile-item:hover {
    background: var(--bg-hover);
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
  }

  .profile-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
    text-decoration: none;
  }

  .profile-details {
    flex: 1;
    min-width: 0;
  }

  .profile-username {
    font-weight: 600;
    color: var(--text-main);
    font-size: calc(0.9rem * var(--font-scale));
    margin-bottom: 0.1rem;
    font-family: 'Rajdhani', sans-serif;
  }

  .profile-bio {
    color: var(--text-secondary);
    font-size: calc(0.8rem * var(--font-scale));
    line-height: 1.2;
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
    font-size: calc(0.8rem * var(--font-scale));
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Rajdhani', sans-serif;
    white-space: nowrap;
    z-index: 10;
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

  .follow-btn.following:hover {
    background: var(--border-color);
    color: var(--text-main);
  }

  .load-more-btn {
    display: block;
    width: 100%;
    text-align: center;
    color: var(--primary);
    background: transparent;
    border: 1px solid var(--primary);
    border-radius: 8px;
    padding: 0.6rem;
    font-size: calc(0.9rem * var(--font-scale));
    font-weight: 500;
    margin-top: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Rajdhani', sans-serif;
  }

  .load-more-btn:hover {
    background: var(--primary);
    color: var(--bg-body);
  }

  .loading {
    text-align: center;
    color: var(--text-light);
    padding: 1rem;
    font-size: calc(0.95rem * var(--font-scale));
  }

  @media (max-width: 768px) {
    .recommended-profiles {
      margin-bottom: 1rem;
      padding: 0.75rem;
    }

    .profiles-header h3 {
      font-size: calc(0.9rem * var(--font-scale));
    }

    .profile-item {
      gap: 0.5rem;
    }

    .profile-username {
      font-size: calc(0.85rem * var(--font-scale));
    }

    .profile-bio {
      font-size: calc(0.75rem * var(--font-scale));
    }

    .follow-btn {
      padding: 0.3rem 0.6rem;
      font-size: calc(0.75rem * var(--font-scale));
    }

    .load-more-btn {
      padding: 0.5rem;
      font-size: calc(0.85rem * var(--font-scale));
    }
  }

  @media (max-width: 480px) {
    .profiles-list {
      flex-direction: row;
      overflow-x: auto;
      gap: 1rem;
      scroll-behavior: smooth;
      scrollbar-width: none;
    }

    .profiles-list::-webkit-scrollbar {
      display: none;
    }

    .profile-item {
      flex: 0 0 calc(50% - 0.5rem);
      flex-direction: column;
      text-align: center;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }

    .profile-link {
      flex-direction: column;
      gap: 0.5rem;
    }

    .profile-details {
      width: 100%;
    }

    .profile-bio {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }

    .load-more-btn {
      flex: 0 0 calc(50% - 0.5rem);
      margin: 0;
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-hover);
      color: var(--primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 120px;
      width: auto;
    }
  }
`;

export default connect(mapStateToProps, mapDispatchToProps)(RecommendedProfiles);
