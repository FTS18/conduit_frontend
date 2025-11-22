import React, { useState } from 'react';
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
              <div className="author-name">{comment.author.username}</div>
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
                    <path d="M7 14l5-5 5 5"/>
                  </svg>
                  {comment.upvotes || 0}
                </button>
                <button
                  className={`vote-btn downvote ${comment.userVote === -1 ? 'active' : ''}`}
                  onClick={() => handleVote(-1)}
                  disabled={isVoting}
                  title="Downvote"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 10l-5 5-5-5"/>
                  </svg>
                  {comment.downvotes || 0}
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
          background: white;
          border: 1px solid #e1e4e8;
          border-radius: 4px;
          padding: 1rem;
          margin-bottom: 0.5rem;
        }

        .dark-theme .comment {
          background: #1a1a1a;
          border-color: #333;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }

        .comment-author {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .author-name {
          font-weight: 600;
          color: #373a3c;
          font-size: 0.95rem;
        }

        .dark-theme .author-name {
          color: #e0e0e0;
        }

        .comment-date {
          font-size: 0.8rem;
          color: #999;
        }

        .comment-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .vote-btn, .reply-btn, .delete-btn {
          padding: 0.4rem 0.8rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .dark-theme .vote-btn,
        .dark-theme .reply-btn,
        .dark-theme .delete-btn {
          background: #2a2a2a;
          border-color: #444;
          color: #e0e0e0;
        }

        .vote-btn:hover {
          border-color: #5cb85c;
          color: #5cb85c;
        }

        .vote-btn.active.upvote {
          background: #5cb85c;
          color: white;
          border-color: #5cb85c;
        }

        .vote-btn.active.downvote {
          background: #e74c3c;
          color: white;
          border-color: #e74c3c;
        }

        .vote-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reply-btn:hover {
          border-color: #0275d8;
          color: #0275d8;
        }

        .delete-btn:hover {
          border-color: #e74c3c;
          color: #e74c3c;
        }

        .comment-body {
          color: #373a3c;
          line-height: 1.5;
          word-wrap: break-word;
        }

        .dark-theme .comment-body {
          color: #e0e0e0;
        }

        .replies-section {
          margin-left: 3rem;
          margin-top: 1rem;
          border-left: 3px solid #e1e4e8;
          padding-left: 1.5rem;
          position: relative;
        }

        .replies-section::before {
          content: '';
          position: absolute;
          left: -3px;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, #5cb85c, transparent);
        }

        .dark-theme .replies-section {
          border-left-color: #333;
        }

        .show-replies-btn {
          background: none;
          border: none;
          color: #5cb85c;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
          margin-bottom: 0.75rem;
          transition: color 0.2s;
        }

        .show-replies-btn:hover {
          color: #6cc76c;
        }

        .replies-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (max-width: 768px) {
          .comment-header {
            flex-direction: column;
          }

          .comment-actions {
            justify-content: flex-start;
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
