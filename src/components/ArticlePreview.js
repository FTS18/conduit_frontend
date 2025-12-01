import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import { ARTICLE_FAVORITED, ARTICLE_UNFAVORITED, APPLY_TAG_FILTER } from '../constants/actionTypes';
import BookmarkButton from './BookmarkButton';
import UserAvatar from './UserAvatar';
import OfflineButton from './OfflineButton';

const mapDispatchToProps = dispatch => ({
  favorite: (slug, optimistic) => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Articles.favorite(slug),
    optimistic: optimistic
  }),
  unfavorite: (slug, optimistic) => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Articles.unfavorite(slug),
    optimistic: optimistic
  }),
  onTagClick: (tag, pager, payload) =>
    dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload })
});

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const ArticlePreview = props => {
  const article = props.article;
  const favoriteButtonClass = article.favorited ?
    'btn-pill btn-pill-primary' :
    'btn-pill btn-pill-outline';

  const handleClick = ev => {
    ev.preventDefault();
    const newFavorited = !article.favorited;
    const optimisticPayload = {
      type: newFavorited ? ARTICLE_FAVORITED : ARTICLE_UNFAVORITED,
      payload: {
        article: {
          ...article,
          favorited: newFavorited,
          favoritesCount: article.favoritesCount + (newFavorited ? 1 : -1)
        }
      }
    };
    if (newFavorited) {
      props.favorite(article.slug, optimisticPayload);
    } else {
      props.unfavorite(article.slug, optimisticPayload);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/#/article/${article.slug}`;
    navigator.clipboard.writeText(url);

    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: url
      }).catch(err => {
        // Share failed
      });
    }
  };

  const handleTagClick = (ev, tag) => {
    ev.preventDefault();
    props.onTagClick(tag, agent.Articles.byTag, agent.Articles.byTag(tag));
  };

  return (
    <div className="article-preview">
      <Link to={`/article/${article.slug}`} className="article-content-link">
        <div className="article-header">
          <div className="article-title-wrapper">
            <h2 className="article-title">{article.title}</h2>
            {article.isRecommended && (
              <span className="recommended-label">(Recommended)</span>
            )}
          </div>
          <button className="btn-pill btn-pill-outline share-btn-top" onClick={handleShare} title="Share">
            <ShareIcon />
          </button>
        </div>
        {article.description && (
          <p className="article-description">{article.description}</p>
        )}
        <div className="article-footer">
          <span className="read-more">Read more...</span>
        </div>
      </Link>

      {article.tagList && article.tagList.length > 0 && (
        <div className="article-tags">
          <span className="tags-label">Tags:</span>
          <ul className="tag-list">
            {article.tagList.map(tag => (
              <li className="tag-hash" key={tag}>
                <button className="tag-link" onClick={(ev) => handleTagClick(ev, tag)}>{tag}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="article-bottom-section">
        <div className="article-author-section">
          <Link to={`/@${encodeURIComponent(article.author.username)}`} className="author-avatar-link">
            <UserAvatar username={article.author.username} image={article.author.image} size="md" />
          </Link>
          <div className="author-info">
            <Link className="author-name" to={`/@${encodeURIComponent(article.author.username)}`}>
              {article.author.username}
            </Link>
            <span className="article-date">
              {new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        <div className="article-actions-bottom">
          <button className={favoriteButtonClass} onClick={handleClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={article.favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {article.favoritesCount}
          </button>
          <BookmarkButton article={article} />
          <OfflineButton article={article} />
        </div>
      </div>

      <div className="article-actions-mobile">
        <button className={favoriteButtonClass} onClick={handleClick}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={article.favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {article.favoritesCount}
        </button>
        <BookmarkButton article={article} />
        <button className="btn-pill btn-pill-outline" onClick={handleShare} title="Share">
          <ShareIcon />
        </button>
      </div>

      <style>{`
        .article-preview {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .article-preview:hover {
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
          border-color: var(--primary);
        }

        .article-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .article-title-wrapper {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          flex: 1;
        }

        .share-btn-top {
          flex-shrink: 0;
        }

        .article-bottom-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .article-author-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .author-avatar-link {
          flex-shrink: 0;
          display: flex;
          text-decoration: none;
        }

        .author-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .author-name {
          color: var(--primary);
          text-decoration: none !important;
          font-weight: 600;
          font-size: calc(0.95rem * var(--font-scale));
          transition: color 0.2s;
        }

        .author-name:hover {
          color: var(--primary-hover);
          text-decoration: none !important;
        }

        .article-date {
          color: var(--text-secondary);
          font-size: calc(0.85rem * var(--font-scale));
          margin-top: 0.25rem;
        }

        .article-actions-bottom {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
          align-items: center;
        }

        .article-actions-mobile {
          display: none;
        }

        .article-content-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .article-title {
          font-size: calc(1.5rem * var(--font-scale));
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: var(--text-main);
          line-height: 1.3;
          text-decoration: none !important;
        }

        .article-title:hover {
          color: var(--primary);
          text-decoration: none !important;
        }

        .recommended-label {
          color: var(--primary);
          font-size: calc(0.85rem * var(--font-scale));
          font-weight: 600;
          white-space: nowrap;
        }

        .article-description {
          color: var(--text-secondary);
          font-size: calc(0.9rem * var(--font-scale));
          margin: 0 0 1rem 0;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
        }

        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .read-more {
          display: none;
        }

        .article-tags {
          display: none;
        }

        .tags-label {
          color: var(--text-secondary);
          font-size: calc(0.9rem * var(--font-scale));
          font-weight: 600;
        }

        .tag-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .tag-hash {
          display: inline-block;
          padding: 0.25rem 0.5rem;
        }

        .tag-link {
          color: var(--primary);
          font-size: calc(0.85rem * var(--font-scale));
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          background: none;
          border: none;
          padding: 0;
        }

        .tag-link:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        .btn-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.2rem;
          border: none;
          border-radius: 20px;
          font-size: calc(0.9rem * var(--font-scale));
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 36px;
          text-decoration: none;
        }

        .btn-pill-primary {
          background: var(--primary);
          color: white;
        }

        .btn-pill-primary:hover {
          background: var(--primary-hover);
          text-decoration: none;
        }

        .btn-pill-outline {
          background: var(--bg-hover);
          color: var(--primary);
          border: 1.5px solid var(--primary);
        }

        .btn-pill-outline:hover {
          background: rgba(0, 102, 204, 0.1);
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .article-preview {
            padding: 0.75rem !important;
            margin: 0.25rem 0 !important;
            border-radius: 12px !important;
            background: var(--bg-card) !important;
            border: 1px solid var(--border-color) !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }

          .article-preview:hover {
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
            transform: translateY(-2px);
          }

          .article-header {
            flex-direction: column;
            align-items: flex-start;
            margin-bottom: 0.75rem;
            gap: 0.5rem;
          }

          .article-title-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
            width: 100%;
          }

          .article-title {
            font-size: calc(1.1rem * var(--font-scale));
            margin-bottom: 0.5rem;
            line-height: 1.2;
            font-weight: 700;
          }

          .recommended-label {
            font-size: calc(0.75rem * var(--font-scale));
          }

          .share-btn-top {
            display: none;
          }

          .article-description {
            font-size: calc(0.85rem * var(--font-scale));
            margin-bottom: 0.5rem;
            line-height: 1.4;
            -webkit-line-clamp: 2;
            color: var(--text-secondary);
          }

          .article-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .article-tags {
            margin-top: 0.75rem;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .tags-label {
            font-size: calc(0.85rem * var(--font-scale));
          }

          .tag-list {
            gap: 0.75rem;
          }

          .tag-hash {
            font-size: calc(0.75rem * var(--font-scale));
            padding: 0.2rem 0.4rem;
          }

          .article-bottom-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .article-actions-bottom {
            display: none;
          }

          .article-actions-mobile {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.25rem;
            padding-top: 1.25rem;
            border-top: 1px solid var(--border-color);
          }

          .article-actions-mobile button {
            flex: 1;
            padding: 1rem 1.25rem !important;
            min-height: 48px;
            font-size: calc(0.85rem * var(--font-scale));
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 12px !important;
            font-weight: 600;
          }

          .article-actions-mobile .btn-pill-primary {
            background: var(--primary) !important;
          }

          .article-actions-mobile .btn-pill-outline {
            background: var(--bg-hover) !important;
            border: 2px solid var(--primary) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default connect(() => ({}), mapDispatchToProps)(ArticlePreview);
