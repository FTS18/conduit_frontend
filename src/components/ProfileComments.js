import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import agent from '../agent';
import {
  PROFILE_COMMENTS_PAGE_LOADED,
  PROFILE_COMMENTS_PAGE_UNLOADED
} from '../constants/actionTypes';
import UserAvatar from './UserAvatar';

const mapStateToProps = state => ({
  ...state.profileComments,
  currentUser: state.common.currentUser,
  profile: state.profile
});

const mapDispatchToProps = dispatch => ({
  onLoad: (username) => dispatch({
    type: PROFILE_COMMENTS_PAGE_LOADED,
    payload: Promise.all([
      agent.Profile.get(username),
      agent.Profile.getComments(username)
    ])
  }),
  onUnload: () => dispatch({ type: PROFILE_COMMENTS_PAGE_UNLOADED })
});

class ProfileComments extends React.Component {
  componentWillMount() {
    this.props.onLoad(this.props.match.params.username);
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  handleDeleteComment = (comment) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      agent.Comments.delete(comment.article.slug, comment.id)
        .then(() => {
          // Reload comments after deletion
          this.props.onLoad(this.props.match.params.username);
        })
        .catch(err => {
          console.error('Error deleting comment:', err);
          alert('Failed to delete comment');
        });
    }
  };

  renderTabs() {
    const profile = this.props.profile;
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <Link
            className="nav-link"
            to={`/@${encodeURIComponent(profile.username)}`}>
            My Articles
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className="nav-link"
            to={`/@${encodeURIComponent(profile.username)}/favorites`}>
            Favorited Articles
          </Link>
        </li>

        <li className="nav-item">
          <Link
            className="nav-link active"
            to={`/@${encodeURIComponent(profile.username)}/comments`}>
            Comments
          </Link>
        </li>
      </ul>
    );
  }

  render() {
    const profile = this.props.profile;
    const comments = this.props.comments || [];

    if (!profile) {
      return null;
    }

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

              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <div className="no-comments-icon">💬</div>
                    <h4>No comments yet</h4>
                    <p>Start engaging with articles to see your comments here!</p>
                  </div>
                ) : (
                  <div>
                    <div className="comments-header">
                      <h4>{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h4>
                    </div>
                    {comments.map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <Link to={`/article/${comment.article.slug}`} className="article-link">
                            <h5>{comment.article.title}</h5>
                          </Link>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="comment-body">
                          "{comment.body}"
                        </div>
                        <div className="comment-stats">
                          <span className="vote-count">
                            <span className="upvotes">↑ {comment.upvotes || 0}</span>
                            <span className="downvotes">↓ {comment.downvotes || 0}</span>
                          </span>
                          <button 
                            className="delete-comment-btn"
                            onClick={() => this.handleDeleteComment(comment)}
                            title="Delete comment"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

          .comments-list {
            margin-top: 1.5rem;
          }

          .comment-item {
            background: white;
            border: 1px solid #e1e4e8;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }

          .dark-theme .comment-item {
            background: #1a1a1a;
            border-color: #333;
          }

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
          }

          .article-link {
            text-decoration: none;
            flex: 1;
          }

          .article-link h5 {
            margin: 0;
            color: #5cb85c;
            font-size: 1.1rem;
            font-weight: 600;
          }

          .article-link:hover h5 {
            color: #6cc76c;
            text-decoration: underline;
          }

          .comment-date {
            color: #999;
            font-size: 0.85rem;
            white-space: nowrap;
          }

          .comment-body {
            color: #373a3c;
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .dark-theme .comment-body {
            color: #e0e0e0;
          }

          .comment-stats {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .vote-count {
            display: flex;
            gap: 1rem;
            font-size: 0.9rem;
          }

          .upvotes {
            color: #28a745;
            font-weight: 600;
          }

          .downvotes {
            color: #dc3545;
            font-weight: 600;
          }

          .net-votes {
            color: #666;
            font-weight: 600;
          }

          .dark-theme .net-votes {
            color: #aaa;
          }

          .delete-comment-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.4rem 0.8rem;
            border-radius: 4px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: background 0.2s;
          }

          .delete-comment-btn:hover {
            background: #c82333;
          }

          .no-comments {
            text-align: center;
            padding: 4rem 2rem;
            color: #666;
          }

          .no-comments-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.6;
          }

          .no-comments h4 {
            margin: 0 0 1rem 0;
            color: #373a3c;
            font-size: 1.5rem;
          }

          .no-comments p {
            margin: 0;
            font-size: 1.1rem;
          }

          .dark-theme .no-comments {
            color: #aaa;
          }

          .dark-theme .no-comments h4 {
            color: #e0e0e0;
          }

          .comments-header {
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e1e4e8;
          }

          .comments-header h4 {
            margin: 0;
            color: #373a3c;
            font-size: 1.3rem;
          }

          .dark-theme .comments-header {
            border-bottom-color: #333;
          }

          .dark-theme .comments-header h4 {
            color: #e0e0e0;
          }

          @media (max-width: 768px) {
            .comment-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .comment-date {
              margin-top: 0.5rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileComments);