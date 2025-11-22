import React, { useState, useEffect } from 'react';
import MentionInput from './MentionInput';
import agent from '../agent';
import { connect } from 'react-redux';
import { ADD_COMMENT } from '../constants/actionTypes';

const CommentForm = ({ slug, onCommentAdded, currentUser, replyTo, onReplyCancel, replyToCommentId, dispatch }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (replyTo) {
      setCommentText(`@${replyTo} `);
    }
  }, [replyTo]);

  const handleSubmit = async (text) => {
    if (!text.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const mentions = text.match(/@(\w+)/g) || [];
      const mentionedUsers = mentions.map(m => m.substring(1));

      const comment = {
        body: text,
        mentions: mentionedUsers,
        ...(replyToCommentId && { parentCommentId: replyToCommentId })
      };

      const result = await agent.Comments.create(slug, comment);
      setCommentText('');
      
      dispatch({
        type: ADD_COMMENT,
        payload: result
      });
      
      onCommentAdded(result);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <p style={{ color: '#999' }}>Sign in to post comments</p>;
  }

  return (
    <div className="comment-form">
      {replyTo && (
        <div className="reply-info">
          Replying to <strong>@{replyTo}</strong>
          <button className="cancel-reply" onClick={onReplyCancel}>×</button>
        </div>
      )}
      <MentionInput
        value={commentText}
        onChange={setCommentText}
        onSubmit={handleSubmit}
        placeholder="Write a comment... (use @username to mention)"
        buttonText={isSubmitting ? 'Posting...' : 'Post Comment'}
      />
      <style>{`
        .comment-form {
          margin: 1.5rem 0;
          padding: 1rem;
          background: white;
          border-radius: 4px;
          border: 1px solid #e1e4e8;
        }

        .dark-theme .comment-form {
          background: #1a1a1a;
          border-color: #333;
        }

        .reply-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: #f0f8ff;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #373a3c;
        }

        .dark-theme .reply-info {
          background: #1a3a4a;
          color: #e0e0e0;
        }

        .cancel-reply {
          margin-left: auto;
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
          transition: color 0.2s;
        }

        .cancel-reply:hover {
          color: #373a3c;
        }

        .dark-theme .cancel-reply:hover {
          color: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(null, mapDispatchToProps)(CommentForm);
