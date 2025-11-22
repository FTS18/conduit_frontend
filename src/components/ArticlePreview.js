import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { connect } from 'react-redux';
import { ARTICLE_FAVORITED, ARTICLE_UNFAVORITED, APPLY_TAG_FILTER } from '../constants/actionTypes';
import BookmarkButton from './BookmarkButton';
import UserAvatar from './UserAvatar';
import OfflineButton from './OfflineButton';

const mapDispatchToProps = dispatch => ({
  favorite: slug => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Articles.favorite(slug)
  }),
  unfavorite: slug => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Articles.unfavorite(slug)
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
    if (article.favorited) {
      props.unfavorite(article.slug);
    } else {
      props.favorite(article.slug);
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
      }).catch(err => console.log('Share failed:', err));
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
        <p className="article-description">{article.description}</p>
        <div className="article-footer">
          <span className="read-more">Read more...</span>
        </div>
      </Link>

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
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
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
          background: white;
          border: none;
          border-radius: 0;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          border-left: 4px solid #5cb85c;
          position: relative;
        }

        .article-preview:hover {
          box-shadow: 0 4px 12px rgba(92, 184, 92, 0.15);
          transform: translateX(4px);
        }

        .dark-theme .article-preview {
          background: #1a1a1a;
          border-left-color: #5cb85c;
        }

        .dark-theme .article-preview:hover {
          box-shadow: 0 4px 12px rgba(92, 184, 92, 0.25);
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
          border-top: 1px solid #e1e4e8;
        }

        .dark-theme .article-bottom-section {
          border-top-color: #333;
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
          color: #5cb85c;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .author-name:hover {
          color: #6cc76c;
          text-decoration: none !important;
        }

        .dark-theme .author-name {
          color: #5cb85c;
        }

        .article-date {
          color: #999;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .dark-theme .article-date {
          color: #888;
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
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0;
          color: #373a3c;
          line-height: 1.4;
          transition: all 0.2s;
          text-decoration: none;
          cursor: pointer;
        }

        .article-title:hover {
          color: #5cb85c;
          text-decoration: underline;
        }

        .dark-theme .article-title {
          color: #e0e0e0;
        }

        .dark-theme .article-title:hover {
          color: #5cb85c;
          text-decoration: underline;
        }

        .recommended-label {
          color: #7cb342;
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .dark-theme .recommended-label {
          color: #9ccc65;
        }

        .article-description {
          color: #666;
          font-size: 1rem;
          margin: 0 0 1rem 0;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-decoration: none;
        }

        .dark-theme .article-description {
          color: #aaa;
        }

        .article-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .read-more {
          color: #5cb85c;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          text-decoration: none;
        }

        .article-tags {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          flex-wrap: wrap;
        }

        .tags-label {
          color: #666;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .dark-theme .tags-label {
          color: #aaa;
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
          color: #5cb85c;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          background: none;
          border: none;
          padding: 0;
        }

        .tag-link:hover {
          color: #6cc76c;
          text-decoration: underline;
        }

        .dark-theme .tag-link {
          color: #5cb85c;
        }

        .dark-theme .tag-link:hover {
          color: #6cc76c;
        }



        .btn-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.2rem;
          border: none;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 36px;
          text-decoration: none;
        }

        .btn-pill-primary {
          background: #5cb85c;
          color: white;
        }

        .btn-pill-primary:hover {
          background: #6cc76c;
          text-decoration: none;
        }

        .btn-pill-outline {
          background: #f5f5f5;
          color: #5cb85c;
          border: 1.5px solid #5cb85c;
        }

        .btn-pill-outline:hover {
          background: #f0f8f0;
          text-decoration: none;
        }

        .dark-theme .btn-pill-primary {
          background: #5cb85c;
          color: white;
        }

        .dark-theme .btn-pill-primary:hover {
          background: #6cc76c;
        }

        .dark-theme .btn-pill-outline {
          background: #222;
          color: #5cb85c;
          border: 1.5px solid #5cb85c;
        }

        .dark-theme .btn-pill-outline:hover {
          background: rgba(92, 184, 92, 0.1);
        }

        @media (max-width: 768px) {
          .article-preview {
            padding: 1.25rem;
            margin: 0 0.75rem 1rem 0.75rem;
            border-left: none;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            background: white;
            border: 1px solid #f0f0f0;
          }

          .dark-theme .article-preview {
            background: #1a1a1a;
            border-color: #333;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .article-preview:hover {
            box-shadow: 0 6px 16px rgba(92, 184, 92, 0.15);
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
            font-size: 1.2rem;
            margin-bottom: 0;
            line-height: 1.3;
            font-weight: 700;
          }

          .recommended-label {
            font-size: 0.75rem;
          }

          .share-btn-top {
            display: none;
          }

          .article-description {
            font-size: 0.95rem;
            margin-bottom: 1rem;
            line-height: 1.6;
            -webkit-line-clamp: 3;
            color: #555;
          }

          .dark-theme .article-description {
            color: #bbb;
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
            font-size: 0.85rem;
          }

          .tag-list {
            gap: 0.75rem;
          }

          .tag-hash {
            font-size: 0.75rem;
            padding: 0.2rem 0.4rem;
          }



          .article-bottom-section {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .article-actions-bottom {
            display: none;
          }

          .article-actions-mobile {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e1e4e8;
          }

          .dark-theme .article-actions-mobile {
            border-top-color: #333;
          }

          .article-actions-mobile button {
            flex: 1;
            padding: 0.75rem 1rem !important;
            font-size: 0.85rem;
            min-height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 12px !important;
            font-weight: 600;
          }

          .article-actions-mobile .btn-pill-primary {
            background: linear-gradient(135deg, #5cb85c, #4a9d4a) !important;
          }

          .article-actions-mobile .btn-pill-outline {
            background: rgba(92, 184, 92, 0.1) !important;
            border: 2px solid #5cb85c !important;
          }
        }
      `}</style>
    </div>
  );
}

export default connect(() => ({}), mapDispatchToProps)(ArticlePreview);
