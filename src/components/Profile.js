import ArticleList from './ArticleList';
import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import {
  FOLLOW_USER,
  UNFOLLOW_USER,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED
} from '../constants/actionTypes';
import UserAvatar from './UserAvatar';

const EditProfileSettings = props => {
  if (props.isUser) {
    return (
      <Link to="/settings" className="profile-btn">
        Edit Profile
      </Link>
    );
  }
  return null;
};

const FollowUserButton = props => {
  if (props.isUser) {
    return null;
  }

  const handleClick = ev => {
    ev.preventDefault();
    if (props.user.following) {
      props.unfollow(props.user.username)
    } else {
      props.follow(props.user.username)
    }
  };

  return (
    <button
      className={`profile-btn ${props.user.following ? 'following' : ''}`}
      onClick={handleClick}>
      {props.user.following ? 'Unfollow' : 'Follow'}
    </button>
  );
};

const mapStateToProps = state => ({
  ...state.articleList,
  currentUser: state.common.currentUser,
  profile: state.profile
});

const mapDispatchToProps = dispatch => ({
  onFollow: username => dispatch({
    type: FOLLOW_USER,
    payload: agent.Profile.follow(username)
  }),
  onLoad: payload => dispatch({ type: PROFILE_PAGE_LOADED, payload }),
  onUnfollow: username => dispatch({
    type: UNFOLLOW_USER,
    payload: agent.Profile.unfollow(username)
  }),
  onUnload: () => dispatch({ type: PROFILE_PAGE_UNLOADED })
});

class Profile extends React.Component {
  componentWillMount() {
    this.loadProfile();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.username !== nextProps.match.params.username ||
      this.props.match.params.tab !== nextProps.match.params.tab) {
      this.props.onUnload();
      this.loadProfile(nextProps);
    }
  }

  loadProfile(props = this.props) {
    const tab = props.match.params.tab || 'articles';
    let articlesPromise;

    // Always fetch the total count of articles by this author
    const countPromise = agent.Articles.byAuthor(props.match.params.username)
      .then(res => res.articlesCount);

    if (tab === 'liked') {
      articlesPromise = agent.Articles.favoritedBy(props.match.params.username);
    } else if (tab === 'comments') {
      articlesPromise = agent.Comments.byAuthor(props.match.params.username)
        .then(res => ({
          articles: (res.comments || []).map(c => ({
            slug: c.id,
            title: c.body,
            description: `On: ${c.article && c.article.title ? c.article.title : 'Unknown'}`,
            author: c.author,
            createdAt: c.createdAt,
            favorited: false,
            favoritesCount: 0
          })),
          articlesCount: res.comments ? res.comments.length : 0
        }));
    } else {
      articlesPromise = agent.Articles.byAuthor(props.match.params.username);
    }

    this.props.onLoad(Promise.all([
      agent.Profile.get(props.match.params.username),
      articlesPromise,
      countPromise
    ]));
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  getActiveTab() {
    return this.props.match.params.tab || 'articles';
  }

  renderTabs() {
    const username = this.props.profile.username;
    const activeTab = this.getActiveTab();
    const isUser = this.props.currentUser && this.props.profile.username === this.props.currentUser.username;

    return (
      <ul className="feed-toggle">
        <li className="feed-tab">
          <Link
            className={activeTab === 'articles' ? 'feed-tab-link active' : 'feed-tab-link'}
            to={`/@${encodeURIComponent(username)}`}>
            {isUser ? 'My Articles' : 'Articles'}
          </Link>
        </li>
        <li className="feed-tab">
          <Link
            className={activeTab === 'liked' ? 'feed-tab-link active' : 'feed-tab-link'}
            to={`/@${encodeURIComponent(username)}/liked`}>
            Liked
          </Link>
        </li>
        <li className="feed-tab">
          <Link
            className={activeTab === 'comments' ? 'feed-tab-link active' : 'feed-tab-link'}
            to={`/@${encodeURIComponent(username)}/comments`}>
            Comments
          </Link>
        </li>
      </ul>
    );
  }

  render() {
    const profile = this.props.profile;
    if (!profile) {
      return null;
    }

    const isUser = this.props.currentUser &&
      this.props.profile.username === this.props.currentUser.username;

    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-header">
            <UserAvatar username={profile.username} image={profile.image} size="lg" />
            <div className="profile-info">
              <h2>{(profile.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
              <p>{profile.bio}</p>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">{profile.totalArticlesCount || 0}</div>
              <div className="stat-label">Articles</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.followersCount || 0}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat">
              <div className="stat-value">{profile.followingCount || 0}</div>
              <div className="stat-label">Following</div>
            </div>
          </div>

          <div className="profile-actions">
            <EditProfileSettings isUser={isUser} />
            <FollowUserButton
              isUser={isUser}
              user={profile}
              follow={this.props.onFollow}
              unfollow={this.props.onUnfollow}
            />
          </div>
        </div>

        <div className="profile-articles">
          <div className="articles-toggle">
            {this.renderTabs()}
          </div>

          <ArticleList
            pager={this.props.pager}
            articles={this.props.articles}
            articlesCount={this.props.articlesCount}
            state={this.props.currentPage} />
        </div>

        <style>{`
          .profile-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 1.5rem;
          }

          .profile-card {
            max-width: 700px;
            margin: 0 auto 2rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 2rem;
          }

          .profile-header {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
            align-items: flex-start;
          }

          .profile-info {
            flex: 1;
          }

          .profile-info h2 {
            font-size: 1.6rem;
            font-weight: 800;
            margin: 0 0 0.5rem 0;
            color: var(--text-main);
          }

          .profile-info p {
            color: var(--text-secondary);
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
          }

          .profile-stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 2rem;
            padding: 1.5rem 0;
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
          }

          .stat {
            text-align: center;
            flex: 1;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.85rem;
            color: var(--text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .profile-actions {
            display: flex;
            gap: 0.75rem;
          }

          .profile-btn {
            flex: 1;
            padding: 0.75rem 1.5rem;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: block;
            text-align: center;
          }

          .profile-btn:hover {
            background: var(--primary-hover);
          }

          .profile-btn.following {
            background: var(--bg-hover);
            color: var(--text-main);
            border: 1px solid var(--border-color);
          }

          .profile-btn.following:hover {
            background: var(--border-color);
          }

          .profile-articles {
            max-width: 700px;
            margin: 0 auto;
          }

          .articles-toggle {
            margin-bottom: 1.5rem;
          }

          .feed-toggle {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 0.5rem;
            margin: 0;
            list-style: none;
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .feed-toggle::-webkit-scrollbar {
            display: none;
          }

          .feed-tab {
            flex: 1;
            min-width: 100px;
            margin: 0;
            padding: 0;
            list-style: none;
          }

          .feed-tab-link {
            display: block;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.25s ease;
            text-align: center;
            background: transparent;
            text-decoration: none;
            cursor: pointer;
          }

          .feed-tab-link:hover {
            background: var(--bg-hover);
            color: var(--primary);
          }

          .feed-tab-link.active {
            background: var(--primary);
            color: white;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .profile-page {
              padding: 0.5rem;
            }

            .profile-card {
              padding: 1.25rem;
              margin-bottom: 1.5rem;
              border-radius: 8px;
            }

            .profile-header {
              gap: 1rem;
              margin-bottom: 1.5rem;
            }

            .profile-info h2 {
              font-size: 1.3rem;
            }

            .profile-info p {
              font-size: 0.9rem;
            }

            .profile-stats {
              gap: 1rem;
              margin-bottom: 1.5rem;
              padding: 1rem 0;
            }

            .stat-value {
              font-size: 1.25rem;
            }

            .stat-label {
              font-size: 0.8rem;
            }

            .profile-actions {
              gap: 0.5rem;
            }

            .profile-btn {
              padding: 0.65rem 1rem;
              font-size: 0.85rem;
            }

            .feed-toggle {
              padding: 0.4rem;
              gap: 0.3rem;
            }

            .feed-tab {
              min-width: 80px;
            }

            .feed-tab-link {
              padding: 0.65rem 0.75rem;
              font-size: 0.85rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
export { Profile, mapStateToProps };
