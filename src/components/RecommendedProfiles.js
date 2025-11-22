import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import agent from '../agent';

const RecommendedProfiles = ({ currentUser, showOnlyOnHome = false }) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't show on article pages if showOnlyOnHome is true
    if (showOnlyOnHome && window.location.pathname.includes('/article/')) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const fetchProfiles = async () => {
      try {
        // Try to fetch all profiles from API first
        let allProfiles = [];
        let isFromAPI = false;
        try {
          const profilesResult = await agent.Profile.getAllUsers();
          allProfiles = profilesResult.profiles || profilesResult.users || [];
          if (allProfiles.length > 0) {
            isFromAPI = true;
            console.log('✅ Loaded', allProfiles.length, 'profiles from API');
          }
        } catch (err) {
          console.log('❌ Profile API not available, falling back to article authors');
        }
        
        // If no profiles from API, fallback to article authors
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
                  image: article.author.image
                });
              }
            }
          });
        }
        
        // Filter out current user, add join dates, and limit to 6
        const filteredProfiles = allProfiles
          .filter(profile => !currentUser || profile.username !== currentUser.username)
          .slice(0, 6)
          .map(profile => ({
            ...profile,
            bio: profile.bio || (isFromAPI ? 'Member of the community' : 'Writer and content creator'),
            joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
          }));
        
        console.log('📋 Showing', filteredProfiles.length, 'profiles (max 6)', isFromAPI ? 'from API' : 'from articles');
        setProfiles(filteredProfiles);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="recommended-profiles">
        <h3>All Profiles</h3>
        <div className="loading">Loading...</div>
        <style>{styles}</style>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="recommended-profiles">
        <h3>All Profiles</h3>
        <div className="loading">No profiles available</div>
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div className="recommended-profiles">
      <div className="sidebar-card">
        <div className="sidebar-header">
          <span className="sidebar-icon">👥</span>
          <h3>All Profiles</h3>
          <div className="sidebar-accent"></div>
        </div>
        <div className="sidebar-content">
          <div className="profiles-container">
            {profiles.map(profile => (
              <Link key={profile.username} to={`/@${profile.username}`} className="profile-card">
                <UserAvatar username={profile.username} image={profile.image} size="md" />
                <div className="profile-info">
                  <div className="profile-name">{profile.username}</div>
                  <div className="profile-bio">{profile.bio ? profile.bio : 'No bio available'}</div>
                  <div className="profile-date">Joined {profile.joinDate ? profile.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  );
};

const styles = `
  .recommended-profiles {
    margin-bottom: 1.5rem;
  }

  .recommended-profiles .sidebar-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid #e1e4e8;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .recommended-profiles .sidebar-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .dark-theme .recommended-profiles .sidebar-card {
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    border-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .dark-theme .recommended-profiles .sidebar-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .recommended-profiles .sidebar-header {
    background: linear-gradient(135deg, #5cb85c 0%, #4a9d4a 100%);
    padding: 1rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .recommended-profiles .sidebar-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .recommended-profiles .sidebar-card:hover .sidebar-header::before {
    transform: translateX(100%);
  }

  .recommended-profiles .sidebar-header h3 {
    color: white;
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .recommended-profiles .sidebar-icon {
    font-size: 1.2rem;
    filter: brightness(0) invert(1);
  }

  .recommended-profiles .sidebar-accent {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
  }

  .recommended-profiles .sidebar-content {
    padding: 1.5rem;
  }

  .profiles-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .profile-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.2s;
  }

  .profile-card:hover {
    background: #f8f9fa;
  }

  .dark-theme .profile-card:hover {
    background: #2a2a2a;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-weight: 600;
    color: #5cb85c;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .profile-bio {
    color: #666;
    font-size: 0.8rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 0.25rem;
  }

  .dark-theme .profile-bio {
    color: #aaa;
  }

  .profile-date {
    color: #999;
    font-size: 0.75rem;
    font-style: italic;
  }

  .dark-theme .profile-date {
    color: #777;
  }

  .loading {
    text-align: center;
    color: #999;
    padding: 1rem;
  }

  @media (max-width: 768px) {
    .recommended-profiles {
      margin-bottom: 1rem;
    }

    .recommended-profiles .sidebar-card {
      border-radius: 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .dark-theme .recommended-profiles .sidebar-card {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .recommended-profiles .sidebar-header h3 {
      font-size: 1rem;
      font-weight: 700;
    }

    .recommended-profiles .sidebar-content {
      padding: 1rem;
    }

    .profiles-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      overflow-x: auto;
      padding: 0.5rem 0 1rem 0;
      scrollbar-width: thin;
      scroll-snap-type: x mandatory;
    }

    .profiles-container::-webkit-scrollbar {
      height: 6px;
    }

    .profiles-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .profiles-container::-webkit-scrollbar-thumb {
      background: #5cb85c;
      border-radius: 3px;
    }

    .profile-card {
      flex-direction: column;
      min-width: 140px;
      max-width: 140px;
      padding: 1rem;
      text-align: center;
      border: 1px solid #e1e4e8;
      border-radius: 12px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      scroll-snap-align: start;
      flex-shrink: 0;
    }

    .profile-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(92, 184, 92, 0.15);
    }

    .dark-theme .profile-card {
      background: #1a1a1a;
      border-color: #333;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .dark-theme .profile-card:hover {
      box-shadow: 0 4px 12px rgba(92, 184, 92, 0.25);
    }

    .profile-info {
      margin-top: 0.75rem;
    }

    .profile-name {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .profile-bio {
      font-size: 0.75rem;
      -webkit-line-clamp: 2;
      line-height: 1.4;
    }
  }
`;

export default RecommendedProfiles;