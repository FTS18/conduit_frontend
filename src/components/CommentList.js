import React from 'react';
import UserAvatar from './UserAvatar';

const CommentList = props => {
  const handleArticleClick = (e, slug) => {
    e.preventDefault();
    window.location.hash = `#/article/${slug}`;
    setTimeout(() => {
      const commentsSection = document.querySelector('.comments');
      if (commentsSection) {
        commentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  if (!props.comments) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: 'var(--text-light)',
          fontSize: '1.1rem'
        }}>
          Loading comments...
        </div>
      </div>
    );
  }

  if (props.comments.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        color: 'var(--text-light)',
        fontSize: '1.1rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginTop: '1.5rem'
      }}>
        <span role="img" aria-label="speech">💬</span> No comments yet.
      </div>
    );
  }

  return (
    <div className="comment-list-container">
      <style>{`
        .comment-list-container {
          margin-top: 1.5rem;
        }

        .comment-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
          display: block;
          color: inherit;
        }

        .comment-item:hover {
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .comment-author {
          flex: 1;
        }

        .comment-author-name {
          font-weight: 600;
          color: var(--text-main);
          font-size: 0.95rem;
          margin: 0;
        }

        .comment-meta {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0.25rem 0 0 0;
        }

        .comment-article {
          font-size: 0.85rem;
          color: var(--primary);
          margin-top: 0.25rem;
          display: inline-block;
        }

        .comment-body {
          color: var(--text-main);
          line-height: 1.6;
          margin: 0.75rem 0 0 0;
          word-break: break-word;
          font-size: 0.95rem;
        }

        @media (max-width: 480px) {
          .comment-item {
            padding: 1rem;
            margin-bottom: 0.75rem;
          }

          .comment-header {
            gap: 0.5rem;
          }

          .comment-author-name {
            font-size: 0.9rem;
          }

          .comment-body {
            font-size: 0.9rem;
          }
        }
      `}</style>
      {props.comments.map(comment => (
        comment.article && comment.article.slug ? (
          <a 
            key={comment.id}
            href={`/#/article/${comment.article.slug}`}
            className="comment-item"
            onClick={(e) => handleArticleClick(e, comment.article.slug)}
          >
            <div className="comment-header">
              <UserAvatar 
                username={comment.author.username} 
                image={comment.author.image} 
                size="sm" 
              />
              <div className="comment-author">
                <p className="comment-author-name">{comment.author.username}</p>
                <p className="comment-meta">
                  {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                </p>
                <div className="comment-article">
                  On: {comment.article.title}
                </div>
              </div>
            </div>
            <p className="comment-body">{comment.body}</p>
          </a>
        ) : (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <UserAvatar 
                username={comment.author.username} 
                image={comment.author.image} 
                size="sm" 
              />
              <div className="comment-author">
                <p className="comment-author-name">{comment.author.username}</p>
                <p className="comment-meta">
                  {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <p className="comment-body">{comment.body}</p>
          </div>
        )
      ))}
    </div>
  );
};

export default CommentList;
