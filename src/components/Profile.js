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
      <Link
        to="/settings"
        className="btn btn-sm btn-outline-secondary action-btn">
        <i className="ion-gear-a"></i> Edit Profile Settings
      </Link>
    );
  }
  return null;
};

const FollowUserButton = props => {
  if (props.isUser) {
    return null;
  }

  let classes = 'btn btn-sm action-btn';
  if (props.user.following) {
    classes += ' btn-secondary';
  } else {
    classes += ' btn-outline-secondary';
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
      className={classes}
      onClick={handleClick}>
      <i className="ion-plus-round"></i>
      &nbsp;
      {props.user.following ? 'Unfollow' : 'Follow'} {props.user.username}
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
    this.props.onLoad(Promise.all([
      agent.Profile.get(this.props.match.params.username),
      agent.Articles.byAuthor(this.props.match.params.username)
    ]));
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  renderTabs() {
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <Link
            className="nav-link active"
            to={`/@${encodeURIComponent(this.props.profile.username)}`}>
            My Articles
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className="nav-link"
            to={`/@${encodeURIComponent(this.props.profile.username)}/favorites`}>
            Favorited Articles
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className="nav-link"
            to={`/@${encodeURIComponent(this.props.profile.username)}/comments`}>
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

        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">

                <div className="profile-avatar">
                  <UserAvatar username={profile.username} image={profile.image} size="lg" />
                </div>
                <h4>{profile.username}</h4>
                <p>{profile.bio}</p>

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
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">

            <div className="col-xs-12 col-md-10 offset-md-1">

              <div className="articles-toggle">
                {this.renderTabs()}
              </div>

              <ArticleList
                pager={this.props.pager}
                articles={this.props.articles}
                articlesCount={this.props.articlesCount}
                state={this.props.currentPage} />
            </div>

          </div>
        </div>

        <style>{`
          .profile-page {
            background: #f8f9fa;
            min-height: 100vh;
          }

          .dark-theme .profile-page {
            background: #0d0d0d;
          }

          .user-info {
            background: white;
            padding: 2rem 0;
            border-bottom: 1px solid #e1e4e8;
          }

          .dark-theme .user-info {
            background: #1a1a1a;
            border-bottom-color: #333;
          }

          .profile-avatar {
            display: flex;
            justify-content: center;
            margin-bottom: 1.5rem;
          }

          .user-info h4 {
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #373a3c;
          }

          .dark-theme .user-info h4 {
            color: #e0e0e0;
          }

          .user-info p {
            text-align: center;
            color: #666;
            margin-bottom: 1.5rem;
          }

          .dark-theme .user-info p {
            color: #aaa;
          }

          .profile-actions {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .profile-actions .action-btn {
            min-height: 44px;
            padding: 0.75rem 1.5rem;
            font-size: 0.95rem;
          }

          @media (max-width: 768px) {
            .user-info {
              padding: 1.5rem 0;
            }

            .profile-avatar {
              margin-bottom: 1rem;
            }

            .user-info h4 {
              font-size: 1.25rem;
            }

            .profile-actions {
              gap: 0.5rem;
            }

            .profile-actions .action-btn {
              flex: 1;
              min-width: 120px;
              padding: 0.65rem 1rem;
              font-size: 0.85rem;
            }

            .articles-toggle {
              margin-bottom: 1.5rem;
            }

            .col-md-10 {
              width: 100% !important;
              margin-left: 0 !important;
              padding: 0 1rem;
            }
          }
        `}</style>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
export { Profile, mapStateToProps };
