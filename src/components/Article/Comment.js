import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import UserAvatar from '../UserAvatar';
import agent from '../../agent';
import { COMMENT_UPVOTED, COMMENT_DOWNVOTED } from '../../constants/actionTypes';

const Comment = ({ comment, currentUser, slug, onReply, onUpvote, onDownvote }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value) => {
    if (!currentUser || isVoting) return;
    setIsVoting(true);
    try {
      if (value === 1) {
        onUpvote(comment.id);
      } else {
        onDownvote(comment.id);
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setIsVoting(false);
    }
  };

  const canDelete = currentUser && currentUser.username === comment.author.username;

  return (
    <div className="comment-wrapper">
      <div className="comment">
        <div className="comment-header">
          <div className="comment-author">
            <UserAvatar username={comment.author.username} image={comment.author.image} size="sm" />
            <div className="author-info">
              <Link to={`/@${comment.author.username}`} className="author-name">
                {comment.author.username}
              </Link>
              <div className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="comment-actions">
            {currentUser && (
              <React.Fragment>
                <button
                  className={`vote-btn upvote ${comment.userVote === 1 ? 'active' : ''}`}
                  onClick={() => handleVote(1)}
                  disabled={isVoting}
                  title="Upvote"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 14l5-5 5 5" />
                  </svg>
                  <span>{comment.upvotes || 0}</span>
                </button>
                <button
                  className={`vote-btn downvote ${comment.userVote === -1 ? 'active' : ''}`}
                  onClick={() => handleVote(-1)}
                  disabled={isVoting}
                  title="Downvote"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 10l-5 5-5-5" />
                  </svg>
                  <span>{comment.downvotes || 0}</span>
                </button>
              </React.Fragment>
            )}
            {currentUser && (
              <button className="reply-btn" onClick={() => onReply(comment.author.username)}>
                Reply
              </button>
            )}
            {canDelete && (
              <button className="delete-btn" onClick={() => {
                if (window.confirm('Delete this comment?')) {
                  agent.Comments.delete(slug, comment.id);
                }
              }}>
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="comment-body">{comment.body}</div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          <button className="show-replies-btn" onClick={() => setShowReplies(!showReplies)}>
            {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && (
            <div className="replies-list">
              {comment.replies.map(reply => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  slug={slug}
                  onReply={onReply}
                  onUpvote={onUpvote}
                  onDownvote={onDownvote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .comment-wrapper {
          margin-bottom: 1.5rem;
        }

        .comment {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .comment:hover {
          border-color: var(--border-hover);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .comment-author {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          flex: 1;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .author-name {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.95rem;
          text-decoration: none;
        }
        
        .author-name:hover {
          color: var(--primary);
          text-decoration: underline;
        }

        .comment-date {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .comment-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .vote-btn, .reply-btn, .delete-btn {
          padding: 0.5rem 0.8rem;
          border: 1px solid var(--border-color);
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .vote-btn:hover, .reply-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(0, 102, 204, 0.05);
        }

        .vote-btn.active.upvote {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .vote-btn.active.downvote {
          background: #ff4444;
          color: white;
          border-color: #ff4444;
        }

        .delete-btn:hover {
          border-color: #ff4444;
          color: #ff4444;
          background: rgba(255, 68, 68, 0.05);
        }

        .comment-body {
          color: var(--text-main);
          line-height: 1.6;
          word-wrap: break-word;
          font-size: 0.95rem;
        }

        .replies-section {
          margin-left: 2.5rem;
          margin-top: 1rem;
          border-left: 3px solid var(--border-color);
          padding-left: 1.5rem;
          position: relative;
        }

        .show-replies-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
          margin-bottom: 0.75rem;
          transition: color 0.2s;
          font-weight: 500;
        }

        .show-replies-btn:hover {
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .comment {
            padding: 1rem;
            border-radius: 6px;
          }

          .comment-header {
            flex-direction: column;
            gap: 0.75rem;
          }

          .comment-actions {
            justify-content: flex-start;
            width: 100%;
          }

          .vote-btn, .reply-btn, .delete-btn {
            padding: 0.4rem 0.7rem;
            font-size: 0.8rem;
          }

          .replies-section {
            margin-left: 1rem;
            padding-left: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  onUpvote: commentId => dispatch({
    type: COMMENT_UPVOTED,
    commentId,
    payload: agent.Comments.upvote(commentId)
  }),
  onDownvote: commentId => dispatch({
    type: COMMENT_DOWNVOTED,
    commentId,
    payload: agent.Comments.downvote(commentId)
  })
});

export default connect(() => ({}), mapDispatchToProps)(Comment);
