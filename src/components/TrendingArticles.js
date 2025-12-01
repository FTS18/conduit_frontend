import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';

class TrendingArticles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      timeframe: 'week'
    };
  }

  componentDidMount() {
    this.loadTrending();
  }

  loadTrending = () => {
    this.setState({ loading: true });
    agent.Articles.trending(this.state.timeframe).then(res => {
      this.setState({ articles: res.articles.slice(0, 5), loading: false });
    });
  };

  handleTimeframeChange = (timeframe) => {
    this.setState({ timeframe }, this.loadTrending);
  };

  render() {
    const { articles, loading, timeframe } = this.state;

    return (
      <div className="trending-section">
        <div className="trending-header">
          <h3>🔥 Trending</h3>
          <div className="timeframe-buttons">
            {['day', 'week', 'month'].map(tf => (
              <button
                key={tf}
                className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => this.handleTimeframeChange(tf)}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="trending-list">
          {loading ? (
            <p>Loading...</p>
          ) : articles.length === 0 ? (
            <p>No trending articles</p>
          ) : (
            articles.map((article, idx) => (
              <Link key={article.slug} to={`/article/${article.slug}`} className="trending-item">
                <span className="rank">#{idx + 1}</span>
                <div className="trending-content">
                  <h4>{article.title}</h4>
                  <p>{article.favoritesCount} ❤️</p>
                </div>
              </Link>
            ))
          )}
        </div>

        <style>{`
          .trending-section {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .trending-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }

          .trending-header h3 {
            margin: 0;
            color: var(--text-main);
            font-size: 1.1rem;
            font-weight: 700;
          }

          .timeframe-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .timeframe-btn {
            padding: 0.4rem 0.8rem;
            background: var(--bg-body);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-secondary);
          }

          .timeframe-btn:hover {
            background: var(--bg-hover);
            color: var(--text-main);
          }

          .timeframe-btn.active {
            background: var(--primary);
            color: var(--bg-body);
            border-color: var(--primary);
          }

          .trending-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .trending-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: var(--bg-hover);
            border-radius: 4px;
            text-decoration: none;
            transition: all 0.2s;
            border: 1px solid transparent;
          }

          .trending-item:hover {
            background: var(--bg-card);
            border-color: var(--border-color);
            transform: translateX(4px);
            box-shadow: var(--shadow-sm);
          }

          .rank {
            font-weight: bold;
            color: var(--primary);
            font-size: 1.1rem;
            min-width: 30px;
          }

          .trending-content h4 {
            margin: 0 0 0.25rem 0;
            color: var(--text-main);
            font-size: 0.9rem;
            line-height: 1.3;
            font-weight: 600;
          }

          .trending-content p {
            margin: 0;
            color: var(--text-light);
            font-size: 0.8rem;
          }

          @media (max-width: 768px) {
            .trending-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default TrendingArticles;
