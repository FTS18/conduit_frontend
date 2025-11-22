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
    switch(sortBy) {
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

  const handleCommentAdded = () => {
    setReplyTo(null);
    setReplyToCommentId(null);
  };

  const handleReply = (username, commentId) => {
    setReplyTo(username);
    setReplyToCommentId(commentId);
  };

  if (props.currentUser) {
    return (
      <div className="col-xs-12 col-md-8 offset-md-2">
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
            onReply={handleReply} />
        </div>

        <style>{`
          .comments-section {
            margin-top: 2rem;
          }

          .comments-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            gap: 1rem;
          }

          .comments-header h3 {
            margin: 0;
            color: #373a3c;
            font-size: 1.25rem;
          }

          .dark-theme .comments-header h3 {
            color: #e0e0e0;
          }

          .sort-select {
            padding: 0.5rem 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            color: #373a3c;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s;
          }

          .sort-select:focus {
            outline: none;
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.1);
          }

          .dark-theme .sort-select {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }

          .dark-theme .sort-select:focus {
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
          }

          @media (max-width: 768px) {
            .comments-header {
              flex-direction: column;
              align-items: flex-start;
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
      <div className="col-xs-12 col-md-8 offset-md-2">
        <p>
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
          .comments-section {
            margin-top: 2rem;
          }

          .comments-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            gap: 1rem;
          }

          .comments-header h3 {
            margin: 0;
            color: #373a3c;
            font-size: 1.25rem;
          }

          .dark-theme .comments-header h3 {
            color: #e0e0e0;
          }

          .sort-select {
            padding: 0.5rem 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            color: #373a3c;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s;
          }

          .sort-select:focus {
            outline: none;
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.1);
          }

          .dark-theme .sort-select {
            background: #1a1a1a;
            color: #e0e0e0;
            border-color: #333;
          }

          .dark-theme .sort-select:focus {
            border-color: #5cb85c;
            box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
          }

          @media (max-width: 768px) {
            .comments-header {
              flex-direction: column;
              align-items: flex-start;
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
