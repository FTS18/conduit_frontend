import React from 'react';
import { Link } from 'react-router-dom';
import agent from '../agent';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      results: [],
      isOpen: false,
      loading: false
    };
  }

  handleSearch = (e) => {
    const query = e.target.value;
    this.setState({ query, loading: true });

    if (query.length < 2) {
      this.setState({ results: [], isOpen: false, loading: false });
      return;
    }

    agent.Articles.search(query).then(res => {
      this.setState({
        results: res.articles.slice(0, 5),
        isOpen: true,
        loading: false
      });
    });
  };

  render() {
    const { query, results, isOpen, loading } = this.state;

    return (
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={this.handleSearch}
          className="search-input"
        />

        {isOpen && (
          <div className="search-results">
            {loading && <p className="loading">Searching...</p>}
            {results.length === 0 && !loading && <p className="empty">No results found</p>}
            {results.map(article => (
              <Link
                key={article.slug}
                to={`/article/${article.slug}`}
                className="search-result-item"
                onClick={() => this.setState({ isOpen: false, query: '' })}
              >
                <h4>{article.title}</h4>
                <p>{article.description}</p>
              </Link>
            ))}
          </div>
        )}

        <style>{`
          .search-bar {
            position: relative;
            flex: 1;
            max-width: 300px;
          }

          .search-input {
            width: 100%;
            padding: 0.5rem 1rem;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            font-size: 0.9rem;
            background: var(--bg-card);
            color: var(--text-main);
            transition: all 0.2s;
          }

          .search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 2px var(--shadow-sm);
          }

          .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 100;
            margin-top: -1px;
            box-shadow: var(--shadow-md);
          }

          .search-result-item {
            display: block;
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            text-decoration: none;
            color: var(--text-main);
            transition: background 0.2s;
          }

          .search-result-item:hover {
            background: var(--bg-hover);
          }

          .search-result-item h4 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: var(--text-main);
            font-weight: 700;
          }

          .search-result-item p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--text-secondary);
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .loading, .empty {
            padding: 1rem;
            text-align: center;
            color: var(--text-light);
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .search-bar {
              max-width: 100%;
              width: 100%;
              flex: 1;
            }

            .search-input {
              width: 100%;
            }

            .search-results {
              position: fixed;
              top: 56px;
              left: 0;
              right: 0;
              width: 100vw;
              border-radius: 0;
              max-height: calc(100vh - 116px);
              margin-top: 0;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default SearchBar;
