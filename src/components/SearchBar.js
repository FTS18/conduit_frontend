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
            border: 1px solid #e1e4e8;
            border-radius: 20px;
            font-size: 0.9rem;
            background: white;
            color: #373a3c;
          }

          .dark-theme .search-input {
            background: #222;
            border-color: #333;
            color: #e0e0e0;
          }

          .search-input:focus {
            outline: none;
            border-color: #5cb85c;
            box-shadow: 0 0 0 2px rgba(92, 184, 92, 0.1);
          }

          .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e1e4e8;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 100;
            margin-top: -1px;
          }

          .dark-theme .search-results {
            background: #1a1a1a;
            border-color: #333;
          }

          .search-result-item {
            display: block;
            padding: 1rem;
            border-bottom: 1px solid #f0f0f0;
            text-decoration: none;
            color: inherit;
            transition: background 0.2s;
          }

          .dark-theme .search-result-item {
            border-bottom-color: #222;
          }

          .search-result-item:hover {
            background: #f8f9fa;
          }

          .dark-theme .search-result-item:hover {
            background: #222;
          }

          .search-result-item h4 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: #5cb85c;
          }

          .search-result-item p {
            margin: 0;
            font-size: 0.8rem;
            color: #666;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .dark-theme .search-result-item p {
            color: #aaa;
          }

          .loading, .empty {
            padding: 1rem;
            text-align: center;
            color: #999;
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .search-bar {
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default SearchBar;
