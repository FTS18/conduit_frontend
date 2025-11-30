import ArticleMeta from './ArticleMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import marked from 'marked';
import { Link } from 'react-router-dom';
import '../../styles/layout.css';
import {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
  DELETE_ARTICLE,
  FOLLOW_USER,
  UNFOLLOW_USER,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED
} from '../../constants/actionTypes';
import { addToHistory } from '../../utils/readingHistory';
import UserAvatar from '../UserAvatar';

const mapStateToProps = state => ((({
  ...state.article,
  currentUser: state.common.currentUser
})));

const mapDispatchToProps = dispatch => ({
  onLoad: payload =>
    dispatch({ type: ARTICLE_PAGE_LOADED, payload }),
  onUnload: () =>
    dispatch({ type: ARTICLE_PAGE_UNLOADED }),
  onClickDelete: payload =>
    dispatch({ type: DELETE_ARTICLE, payload }),
  onFollow: username => dispatch({
    type: FOLLOW_USER,
    payload: agent.Profile.follow(username)
  }),
  onUnfollow: username => dispatch({
    type: UNFOLLOW_USER,
    payload: agent.Profile.unfollow(username)
  }),
  onFavorite: slug => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Articles.favorite(slug)
  }),
  onUnfavorite: slug => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Articles.unfavorite(slug)
  }),
  onBookmark: slug => dispatch({
    type: ARTICLE_BOOKMARKED,
    payload: agent.Articles.bookmark(slug)
  }),
  onUnbookmark: slug => dispatch({
    type: ARTICLE_UNBOOKMARKED,
    payload: agent.Articles.unbookmark(slug)
  })
});

class Article extends React.Component {
  componentWillMount() {
    const payload = Promise.all([
      agent.Articles.get(this.props.match.params.id),
      agent.Comments.forArticle(this.props.match.params.id)
    ]);
    this.props.onLoad(payload);
    payload.then(() => {
      setTimeout(() => {
        if (this.props.article) {
          addToHistory(this.props.article);
        }
      }, 100);
    });
  }

  componentWillUnmount() {
    this.props.onUnload();
  }

  handleFollow = () => {
    const { article } = this.props;
    if (article.author.following) {
      this.props.onUnfollow(article.author.username);
    } else {
      this.props.onFollow(article.author.username);
    }
  }

  handleFavorite = () => {
    const { article } = this.props;
    if (article.favorited) {
      this.props.onUnfavorite(article.slug);
    } else {
      this.props.onFavorite(article.slug);
    }
  }

  handleBookmark = () => {
    const { article } = this.props;
    if (article.bookmarked) {
      this.props.onUnbookmark(article.slug);
    } else {
      this.props.onBookmark(article.slug);
    }
  }

  handleDelete = () => {
    const { article } = this.props;
    this.props.onClickDelete(agent.Articles.del(article.slug));
  }

  render() {
    if (!this.props.article) {
      return (
        <div className="article-page">
          <div className="article-preview skeleton-item">
            <div className="skeleton-line" style={{ height: '24px', marginBottom: '1rem' }}></div>
            <div className="skeleton-line" style={{ height: '16px', marginBottom: '1rem', width: '60%' }}></div>
            <div className="skeleton-line" style={{ marginBottom: '0.5rem' }}></div>
            <div className="skeleton-line" style={{ marginBottom: '0.5rem', width: '80%' }}></div>
          </div>
        </div>
      );
    }

    const markup = { __html: marked(this.props.article.body, { sanitize: true }) };
    const canModify = this.props.currentUser &&
      this.props.currentUser.username === this.props.article.author.username;

    return (
      <div className="article-content">
        <div className="content-section">
        <div className="article-preview">
          <h1 className="article-title">{this.props.article.title}</h1>



          <div className="article-body" dangerouslySetInnerHTML={markup}></div>

          <div className="article-tags">
            {this.props.article.tagList.map(tag => (
              <span className="tag-default" key={tag}>{tag}</span>
            ))}
          </div>

          <div className="article-footer-meta">
            <div className="article-author-section">
              <UserAvatar username={this.props.article.author.username} image={this.props.article.author.image} size="sm" />
              <div className="author-details">
                <div className="author-name">
                  {(this.props.article.author.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="article-date">
                  {new Date(this.props.article.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="article-actions">
              {canModify ? (
                <React.Fragment>
                  <Link
                    to={`/editor/${this.props.article.slug}`}
                    className="action-btn edit-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Article
                  </Link>
                  <button className="action-btn delete-btn" onClick={this.handleDelete}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete Article
                  </button>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <button
                    className={`action-btn favorite-btn ${this.props.article.favorited ? 'active' : ''}`}
                    onClick={this.handleFavorite}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={this.props.article.favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="btn-icon">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {this.props.article.favorited ? 'Unfavorite' : 'Favorite'}
                    <span className="counter">({this.props.article.favoritesCount})</span>
                  </button>
                  <button
                    className={`action-btn bookmark-btn ${this.props.article.bookmarked ? 'active' : ''}`}
                    onClick={this.handleBookmark}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={this.props.article.bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="btn-icon">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {this.props.article.bookmarked ? 'Unbookmark' : 'Bookmark'}
                  </button>
                  <button
                    className={`action-btn follow-btn ${this.props.article.author.following ? 'active' : ''}`}
                    onClick={this.handleFollow}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                      {this.props.article.author.following ? (
                        <React.Fragment>
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </React.Fragment>
                      ) : (
                        <React.Fragment>
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </React.Fragment>
                      )}
                    </svg>
                    {this.props.article.author.following ? 'Unfollow' : 'Follow'}
                  </button>
                </React.Fragment>
              )}
            </div>
          </div>
        </div>

        <CommentContainer
          comments={this.props.comments || []}
          errors={this.props.commentErrors}
          slug={this.props.match.params.id}
          currentUser={this.props.currentUser} />

        <style>{`
          .article-page {
            background: var(--bg-body);
            min-height: 100vh;
            padding: 0;
            margin: 0;
          }

          .article-preview {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 2rem;
            margin: 0 0 1.5rem 0;
            transition: all 0.2s ease;
            width: 100%;
            box-sizing: border-box;
          }

          .article-preview:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-color: var(--border-hover);
          }

          .article-title {
            font-size: calc(1.8rem * var(--font-scale));
            font-weight: 800;
            margin: 0 0 1.5rem 0;
            line-height: 1.3;
            color: var(--text-main);
            letter-spacing: -0.5px;
          }

          .article-footer-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-color);
            flex-wrap: wrap;
            gap: 1.5rem;
          }

          .article-author-section {
            display: flex;
            gap: 0.75rem;
            align-items: center;
          }

          .author-details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .author-name {
            font-weight: 600;
            color: var(--text-main);
            font-size: calc(0.95rem * var(--font-scale));
          }

          .article-date {
            font-size: calc(0.85rem * var(--font-scale));
            color: var(--text-secondary);
          }

          .article-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
          }

          .action-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.6rem 1.2rem;
            background: var(--bg-hover);
            color: var(--text-main);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-weight: 600;
            font-size: calc(0.9rem * var(--font-scale));
            cursor: pointer;
            transition: all 0.2s;
            min-height: 40px;
          }
          
          .btn-icon {
            flex-shrink: 0;
          }

          .action-btn:hover {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
          }

          .action-btn.active {
            background: var(--bg-hover);
            border-color: var(--primary);
            color: var(--primary);
          }

          .action-btn.favorite-btn:hover,
          .action-btn.favorite-btn.active {
            color: #ff4444;
            border-color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
          }
          
          .action-btn.favorite-btn.active svg {
            fill: #ff4444;
          }

          .action-btn.bookmark-btn:hover,
          .action-btn.bookmark-btn.active {
            color: #ffa500;
            border-color: #ffa500;
            background: rgba(255, 165, 0, 0.1);
          }

          .action-btn.bookmark-btn.active svg {
            fill: #ffa500;
          }
          
          .action-btn.delete-btn:hover {
            color: #ff4444;
            border-color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
          }
          
          .counter {
            margin-left: 0.25rem;
            font-size: 0.85em;
            opacity: 0.8;
          }

          .article-body {
            font-size: calc(1rem * var(--font-scale));
            line-height: 1.7;
            color: var(--text-main);
            margin-bottom: 1.5rem;
          }

          .article-body h1,
          .article-body h2,
          .article-body h3,
          .article-body h4,
          .article-body h5,
          .article-body h6 {
            margin: 1.5rem 0 0.75rem 0;
            font-weight: 700;
            color: var(--text-main);
          }

          .article-body h1 { font-size: calc(1.5rem * var(--font-scale)); }
          .article-body h2 { font-size: calc(1.35rem * var(--font-scale)); }
          .article-body h3 { font-size: calc(1.2rem * var(--font-scale)); }

          .article-body p {
            margin-bottom: 1rem;
          }

          .article-body img {
            max-width: 100%;
            height: auto;
            margin: 1.5rem 0;
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }

          .article-body blockquote {
            margin: 1.5rem 0;
            padding: 1rem 1.5rem;
            border-left: 3px solid var(--primary);
            background: var(--bg-hover);
            font-style: italic;
            border-radius: 4px;
          }

          .article-body ul,
          .article-body ol {
            padding-left: 2rem;
            margin-bottom: 1rem;
          }

          .article-body li {
            margin-bottom: 0.5rem;
            line-height: 1.6;
          }

          .article-body code {
            background: var(--bg-hover);
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: var(--primary);
          }

          .article-body pre {
            background: var(--bg-hover);
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 1rem;
            border: 1px solid var(--border-color);
          }

          .article-body pre code {
            background: none;
            padding: 0;
            color: inherit;
          }

          .article-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .tag-default {
            background-color: var(--secondary);
            color: var(--text-secondary);
            border: 1px solid transparent;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: calc(0.85rem * var(--font-scale));
            font-weight: 500;
            transition: all 0.2s ease;
            display: inline-block;
          }

          .tag-default:hover {
            background-color: var(--bg-hover);
            border-color: var(--primary);
            color: var(--primary);
          }

          .skeleton-item {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .skeleton-line {
            height: 16px;
            background: linear-gradient(90deg, var(--bg-hover) 25%, var(--bg-card) 50%, var(--bg-hover) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
            margin-bottom: 0.75rem;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @media (max-width: 768px) {
            .article-page {
              padding: 0.5rem;
            }

            .article-preview {
              padding: 1.25rem;
              border-radius: 12px;
              margin-bottom: 1rem;
            }

            .article-title {
              font-size: calc(1.4rem * var(--font-scale));
              margin-bottom: 1rem;
            }

            .article-author-section {
              margin-bottom: 1rem;
              padding-bottom: 1rem;
            }

            .article-actions {
              margin-bottom: 1rem;
              gap: 0.4rem;
            }

            .action-btn {
              padding: 0.65rem 0.75rem;
              font-size: calc(0.85rem * var(--font-scale));
            }

            .article-body {
              font-size: calc(0.95rem * var(--font-scale));
              line-height: 1.65;
              margin-bottom: 1rem;
            }

            .article-body h1 { font-size: calc(1.25rem * var(--font-scale)); }
            .article-body h2 { font-size: calc(1.15rem * var(--font-scale)); }
            .article-body h3 { font-size: calc(1.05rem * var(--font-scale)); }

            .article-body ul,
            .article-body ol {
              padding-left: 1.5rem;
            }

            .article-body pre {
              padding: 0.75rem;
              font-size: 0.85rem;
            }

            .article-tags {
              margin-bottom: 1rem;
            }

            .tag-default {
              padding: 3px 10px;
              font-size: calc(0.8rem * var(--font-scale));
            }
          }
        `}</style>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Article);
