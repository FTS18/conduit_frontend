import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';
import { getTopTags } from '../utils/readingHistory';

class RecommendedArticles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      topTags: []
    };
  }

  componentWillMount() {
    const topTags = getTopTags();
    if (topTags.length === 0) {
      this.setState({ loading: false });
      return;
    }

    this.setState({ topTags });

    Promise.all(topTags.map(tag => agent.Articles.byTag(tag))).then(results => {
      const articles = [];
      const seen = new Set();
      results.forEach(result => {
        result.articles.forEach(article => {
          if (!seen.has(article.slug)) {
            seen.add(article.slug);
            articles.push(article);
          }
        });
      });
      const isMobile = window.innerWidth <= 768;
      const limit = isMobile ? 3 : 6;
      this.setState({ articles: articles.slice(0, limit), loading: false });
    });
  }

  render() {
    const { articles, loading, topTags } = this.state;

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
            background: white;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-radius: 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .dark-theme .recommended-section {
            background: #1a1a1a;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }

          .recommended-header {
            margin-bottom: 1.5rem;
          }

          .recommended-section h3 {
            color: #373a3c;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .dark-theme .recommended-section h3 {
            color: #e0e0e0;
          }

          .recommended-reason {
            color: #666;
            font-size: 0.85rem;
            margin: 0;
            font-style: italic;
          }

          .dark-theme .recommended-reason {
            color: #aaa;
          }

          .recommended-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }

          .recommended-item {
            padding: 1rem;
            background: #f8f9fa;
            border-left: 3px solid #5cb85c;
            border-radius: 0;
            text-decoration: none;
            transition: all 0.2s;
            display: flex;
            flex-direction: column;
          }

          .dark-theme .recommended-item {
            background: #222;
          }

          .recommended-item:hover {
            box-shadow: 0 2px 6px rgba(92, 184, 92, 0.2);
            transform: translateY(-2px);
          }

          .recommended-item h4 {
            color: #373a3c;
            font-size: 0.95rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            line-height: 1.3;
          }

          .dark-theme .recommended-item h4 {
            color: #e0e0e0;
          }

          .recommended-item p {
            color: #666;
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
            flex-grow: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .dark-theme .recommended-item p {
            color: #aaa;
          }

          .recommended-tags {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .tag-badge {
            display: inline-block;
            padding: 0.3rem 0.6rem;
            background: #5cb85c;
            color: white;
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
          }
        `}</style>
      </div>
    );
  }
}

export default RecommendedArticles;
