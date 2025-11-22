import Comment from './Comment';
import React from 'react';

const CommentList = props => {
  if (!props.comments || props.comments.length === 0) {
    return (
      <div className="no-comments">
        <div className="no-comments-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p>No comments yet. Be the first to comment!</p>
        <style>{`
          .no-comments {
            text-align: center;
            padding: 2rem 1rem;
            color: #999;
          }
          .no-comments-icon {
            margin-bottom: 1rem;
            opacity: 0.5;
          }
          .dark-theme .no-comments {
            color: #666;
          }
        `}</style>
      </div>
    );
  }
  
  // Filter out replies to show only top-level comments
  const topLevelComments = props.comments.filter(comment => !comment.parentId);
  
  return (
    <div className="comments-container">
      {
        topLevelComments.map(comment => {
          return (
            <Comment
              comment={comment}
              currentUser={props.currentUser}
              slug={props.slug}
              onReply={(username) => props.onReply && props.onReply(username, comment.id)}
              key={comment.id} />
          );
        })
      }
      <style>{`
        .comments-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CommentList;
