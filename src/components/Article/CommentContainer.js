import CommentForm from '../CommentForm';
import CommentList from './CommentList';
import { Link } from 'react-router-dom';
import React from 'react';

const CommentContainer = props => {
  const [sortBy, setSortBy] = React.useState('newest');
  const [replyTo, setReplyTo] = React.useState(null);
  const [replyToCommentId, setReplyToCommentId] = React.useState(null);

  const sortComments = (comments) => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'upvoted':
        return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      case 'downvoted':
        return sorted.sort((a, b) => (b.downvotes || 0) - (a.downvotes || 0));
      case 'net':
        return sorted.sort((a, b) => {
          const netA = (a.upvotes || 0) - (a.downvotes || 0);
          const netB = (b.upvotes || 0) - (b.downvotes || 0);
          return netB - netA;
        });
      case 'newest':
      default:
        return sorted.reverse();
    }
  };

  const sortedComments = sortComments(props.comments);

  const handleCommentAdded = (newComment) => {
    setReplyTo(null);
    setReplyToCommentId(null);
    // Force refresh to show new comment
    window.location.reload();
  };

  const handleReply = (username, commentId) => {
    setReplyTo(username);
    setReplyToCommentId(commentId);
  };

  if (props.currentUser) {
    return (
      <div className="comment-container-wrapper">
        <div>
          <list-errors errors={props.errors}></list-errors>
          <CommentForm
            slug={props.slug}
            onCommentAdded={handleCommentAdded}
            currentUser={props.currentUser}
            replyTo={replyTo}
            replyToCommentId={replyToCommentId}
            onReplyCancel={() => {
              setReplyTo(null);
              setReplyToCommentId(null);
            }}
          />
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({props.comments.length})</h3>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="upvoted">Most Upvoted</option>
              <option value="downvoted">Most Downvoted</option>
              <option value="net">Best (Net Votes)</option>
            </select>
          </div>

          <CommentList
            comments={sortedComments}
            slug={props.slug}
            currentUser={props.currentUser}
            onReply={handleReply}
            onCommentUpdate={() => window.location.reload()} />
        </div>

        <style>{`
          .comment-container-wrapper {
            width: 100%;
            max-width: 100%;
            margin-top: 2rem;
          }

          .comments-section {
            margin-top: 2.5rem;
          }

          .comments-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            gap: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          .comments-header h3 {
            margin: 0;
            color: var(--text-main);
            font-size: 1.5rem;
            font-weight: 700;
          }

          .sort-select {
            padding: 0.6rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-card);
            color: var(--text-main);
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 160px;
          }

          .sort-select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .sort-select:hover {
            border-color: var(--primary);
          }

          @media (max-width: 768px) {
            .comments-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .sort-select {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  } else {
    return (
      <div className="comment-container-wrapper">
        <p className="auth-prompt">
          <Link to="/login">Sign in</Link>
          &nbsp;or&nbsp;
          <Link to="/register">sign up</Link>
          &nbsp;to add comments on this article.
        </p>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({props.comments.length})</h3>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="upvoted">Most Upvoted</option>
              <option value="downvoted">Most Downvoted</option>
              <option value="net">Best (Net Votes)</option>
            </select>
          </div>

          <CommentList
            comments={sortedComments}
            slug={props.slug}
            currentUser={props.currentUser} />
        </div>

        <style>{`
          .comment-container-wrapper {
            width: 100%;
            max-width: 100%;
            margin-top: 2rem;
          }

          .auth-prompt {
            text-align: center;
            margin-bottom: 2rem;
            color: var(--text-secondary);
            font-size: 1.1rem;
          }

          .auth-prompt a {
            color: var(--primary);
            font-weight: 600;
            text-decoration: none;
          }

          .auth-prompt a:hover {
            text-decoration: underline;
          }

          .comments-section {
            margin-top: 2.5rem;
          }

          .comments-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            gap: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          .comments-header h3 {
            margin: 0;
            color: var(--text-main);
            font-size: 1.5rem;
            font-weight: 700;
          }

          .sort-select {
            padding: 0.6rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-card);
            color: var(--text-main);
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 160px;
          }

          .sort-select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
          }

          .sort-select:hover {
            border-color: var(--primary);
          }

          @media (max-width: 768px) {
            .comments-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .sort-select {
              width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }
};

export default CommentContainer;
