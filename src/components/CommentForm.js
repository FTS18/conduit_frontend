import React, { useState, useEffect } from 'react';
import MentionInput from './MentionInput';
import agent from '../agent';
import { connect } from 'react-redux';
import { ADD_COMMENT } from '../constants/actionTypes';

const CommentForm = ({ slug, onCommentAdded, currentUser, replyTo, onReplyCancel, replyToCommentId, dispatch, isInline = false }) => {
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

      if (!isInline) {
        dispatch({
          type: ADD_COMMENT,
          payload: result
        });
      }

      onCommentAdded(result.comment || result);
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <p style={{ color: 'var(--text-light)' }}>Sign in to post comments</p>;
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
          margin: ${isInline ? '0.75rem 0' : '1.5rem 0'};
          padding: ${isInline ? '0.75rem' : '1rem'};
          background: var(--bg-card);
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .reply-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: var(--bg-hover);
          border-radius: 4px;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .cancel-reply {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0;
          transition: color 0.2s;
        }

        .cancel-reply:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
};

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default connect(null, mapDispatchToProps)(CommentForm);
