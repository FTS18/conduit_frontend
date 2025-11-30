import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import agent from '../agent';

import { connect } from 'react-redux';
import { FOLLOW_USER, UNFOLLOW_USER } from '../constants/actionTypes';

const mapStateToProps = state => ({
  currentUser: state.common.currentUser,
  articleAuthor: state.article.article ? state.article.article.author : null,
  viewedProfile: state.profile
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
  const { currentUser, showOnlyOnHome = false, articleAuthor, viewedProfile } = props;
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showOnlyOnHome && window.location.pathname.includes('/article/')) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        let allProfiles = [];
        let isFromAPI = false;
        try {
          const profilesResult = await agent.Profile.getAllUsers();
          allProfiles = profilesResult.profiles || profilesResult.users || [];
          if (allProfiles.length > 0) {
            isFromAPI = true;
          }
        } catch (err) {
          console.log('❌ Profile API not available, falling back to article authors');
        }

        if (allProfiles.length === 0) {
          const articlesResult = await agent.Articles.all();
          const articles = articlesResult.articles || [];

          const seenUsernames = new Set();
          articles.forEach(article => {
            if (article.author && !seenUsernames.has(article.author.username)) {
              if (!currentUser || article.author.username !== currentUser.username) {
                seenUsernames.add(article.author.username);
                allProfiles.push({
                  username: article.author.username,
                  bio: article.author.bio || 'Writer and content creator',
                  image: article.author.image,
                  following: article.author.following // Preserve following status
                });
              }
            }
          });
        }

        const filteredProfiles = allProfiles
          .filter(profile => !currentUser || profile.username !== currentUser.username)
          .slice(0, 6)
          .map(profile => ({
            ...profile,
            bio: profile.bio || (isFromAPI ? 'Member of the community' : 'Writer and content creator'),
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          }));

        setProfiles(filteredProfiles);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser, showOnlyOnHome]); // Added showOnlyOnHome to dependency array

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

  if (profiles.length === 0) {
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
        {profiles.slice(0, 4).map(profile => {
          // Determine effective following status from global state if available
          let isFollowing = profile.following;

          if (articleAuthor && articleAuthor.username === profile.username) {
            isFollowing = articleAuthor.following;
          } else if (viewedProfile && viewedProfile.username === profile.username) {
            isFollowing = viewedProfile.following;
          }

          const handleClick = (e) => {
            e.preventDefault();
            if (isFollowing) {
              props.onUnfollow(profile.username);
              // Optimistically update local state
              setProfiles(prev => prev.map(p =>
                p.username === profile.username ? { ...p, following: false } : p
              ));
            } else {
              props.onFollow(profile.username);
              // Optimistically update local state
              setProfiles(prev => prev.map(p =>
                p.username === profile.username ? { ...p, following: true } : p
              ));
            }
          };

          return (
            <Link key={profile.username} to={`/@${profile.username}`} className="profile-item">
              <UserAvatar username={profile.username} image={profile.image} size="sm" />
              <div className="profile-details">
                <div className="profile-username">
                  {(profile.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="profile-bio">{profile.bio || 'Writer'}</div>
              </div>
              <button
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleClick}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            </Link>
          );
        })}
      </div>
      <Link to="/explore" className="see-more">See more suggestions</Link>
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
  }

  .profile-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .profile-item:hover {
    background: var(--bg-hover);
    text-decoration: none;
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
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

  .see-more {
    display: block;
    text-align: center;
    color: var(--primary);
    text-decoration: none;
    font-size: calc(0.9rem * var(--font-scale));
    font-weight: 500;
    margin-top: 0.75rem;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
    font-family: 'Rajdhani', sans-serif;
  }

  .see-more:hover {
    background: var(--bg-hover);
    text-decoration: none;
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
  }
`;

export default connect(mapStateToProps, mapDispatchToProps)(RecommendedProfiles);
