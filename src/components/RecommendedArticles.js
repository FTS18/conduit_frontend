import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { getTopTags, getReadingHistory } from '../utils/readingHistory';
import { getRecommendations } from '../utils/recommendationEngine';

class RecommendedArticles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      topTags: [],
      error: null
    };
  }

  componentDidMount() {
    this.loadRecommendations();
  }

  loadRecommendations = () => {
    const topTags = getTopTags();
    if (topTags.length === 0) {
      this.setState({ loading: false });
      return;
    }

    this.setState({ topTags, loading: true });

    Promise.all(topTags.map(tag => agent.Articles.byTag(tag)))
      .then(results => {
        const articles = [];
        const seen = new Set();
        results.forEach(result => {
          (result.articles || []).forEach(article => {
            if (!seen.has(article.slug)) {
              seen.add(article.slug);
              articles.push(article);
            }
          });
        });
        
        const readingHistory = getReadingHistory();
        const isMobile = window.innerWidth <= 768;
        const limit = isMobile ? 3 : 6;
        
        const recommendations = getRecommendations(articles, topTags, readingHistory, limit);
        this.setState({ articles: recommendations, loading: false, error: null });
      })
      .catch(err => {
        console.error('Failed to load recommendations:', err);
        this.setState({ loading: false, error: 'Failed to load recommendations' });
      });
  }

  render() {
    const { articles, loading, topTags, error } = this.state;

    if (error) {
      return (
        <div className="recommended-section error">
          <p className="error-message">{error}</p>
        </div>
      );
    }

    if (loading || articles.length === 0) {
      return null;
    }

    return (
      <div className="recommended-section">
        <div className="recommended-header">
          <h3>Recommended For You</h3>
          <p className="recommended-reason">Based on your reading history in: {topTags.join(', ')}</p>
        </div>
        <div className="recommended-list">
          {articles.map(article => (
            <Link key={article.slug} to={`/article/${article.slug}`} className="recommended-item">
              <h4>{article.title}</h4>
              <p>{article.description}</p>
              <div className="recommended-tags">
                {article.tagList.slice(0, 2).map(tag => (
                  <span key={tag} className="tag-badge">#{tag}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <style>{`
          .recommended-section {
            background: var(--bg-card);
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 0;
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border-color);
          }

          .recommended-section.error {
            background: var(--bg-hover);
            border-color: var(--primary);
          }

          .error-message {
            color: var(--primary);
            font-size: 0.9rem;
            margin: 0;
          }

          .recommended-header {
            margin-bottom: 1.5rem;
          }

          .recommended-section h3 {
            color: var(--text-main);
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .recommended-reason {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin: 0;
            font-style: italic;
          }

          .recommended-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }

          .recommended-item {
            padding: 1rem;
            background: var(--bg-hover);
            border-left: 3px solid var(--primary);
            border-radius: 0;
            text-decoration: none;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
            border: 1px solid transparent;
            border-left-width: 3px;
          }

          .recommended-item:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
            background: var(--bg-card);
            border-color: var(--border-color);
            border-left-color: var(--primary);
          }

          .recommended-item h4 {
            color: var(--text-main);
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .recommended-item p {
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .recommended-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .tag-badge {
            display: inline-block;
            padding: 0.3rem 0.6rem;
            background: var(--primary);
            color: var(--bg-body);
            font-size: 0.75rem;
            border-radius: 12px;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .recommended-section {
              padding: 1.25rem;
              margin-bottom: 1.5rem;
            }

            .recommended-list {
              grid-template-columns: 1fr;
            }

            .recommended-item {
              padding: 0.75rem;
            }

            .recommended-item h4 {
              font-size: 0.9rem;
            }

            .recommended-item p {
              font-size: 0.8rem;
            }

            .recommended-reason {
              font-size: 0.8rem;
            }

            .recommended-section.error {
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default RecommendedArticles;
