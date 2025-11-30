import React, { useState, useRef, useEffect } from 'react';
import agent from '../agent';
import UserAvatar from './UserAvatar';

const NavbarSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [authorResults, setAuthorResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
    setAuthorResults([]);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedIndex(-1);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length > 0) {
      setIsLoading(true);
      setShowResults(true);

      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await agent.Articles.search(query.toLowerCase());
          const articles = results.articles || [];

          // Also try to find users directly if possible, or rely on article authors
          // Ideally we need a specific user search endpoint
          const uniqueAuthors = [];
          const seenAuthors = new Set();

          // Add authors from found articles
          articles.forEach(article => {
            if (!seenAuthors.has(article.author.username)) {
              seenAuthors.add(article.author.username);
              uniqueAuthors.push(article.author);
            }
          });

          setSearchResults(articles);
          setAuthorResults(uniqueAuthors.slice(0, 3));
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
          setAuthorResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setShowResults(false);
      setSearchResults([]);
      setAuthorResults([]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    const totalResults = authorResults.length + searchResults.slice(0, 5).length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex + 1) % totalResults);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex - 1 + totalResults) % totalResults);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex !== -1) {
        if (selectedIndex < authorResults.length) {
          const author = authorResults[selectedIndex];
          window.location.hash = `#/@${author.username}`;
        } else {
          const article = searchResults.slice(0, 5)[selectedIndex - authorResults.length];
          window.location.hash = `#/article/${article.slug}`;
        }
        handleResultClick();
      }
    }
  };

  return (
    <div className="navbar-search-wrapper" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search articles and people..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="navbar-search-input"
      />
      {showResults && searchQuery.trim().length > 0 && (
        <div className="navbar-search-results">
          {isLoading ? (
            <div className="search-message">Searching...</div>
          ) : (
            <React.Fragment>
              {authorResults.length === 0 && searchResults.length === 0 && (
                <div className="search-message">No results found</div>
              )}

              {authorResults.length > 0 && (
                <React.Fragment>
                  <div className="search-section-title">People</div>
                  {authorResults.map((author, idx) => (
                    <div
                      key={author.username}
                      className={`search-result-item ${selectedIndex === idx ? 'selected' : ''}`}
                      onClick={() => {
                        window.location.hash = `#/@${author.username}`;
                        handleResultClick();
                      }}
                    >
                      <UserAvatar username={author.username} image={author.image} size="sm" />
                      <div className="result-content">
                        <div className="result-name">
                          {(author.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {author.bio && <div className="result-bio">{author.bio}</div>}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )}

              {searchResults.length > 0 && (
                <React.Fragment>
                  <div className="search-section-title">Articles</div>
                  {searchResults.slice(0, 5).map((article, idx) => (
                    <div
                      key={article.slug}
                      className={`search-result-item ${selectedIndex === authorResults.length + idx ? 'selected' : ''}`}
                      onClick={() => {
                        window.location.hash = `#/article/${article.slug}`;
                        handleResultClick();
                      }}
                    >
                      <div className="result-content">
                        <div className="result-title">{article.title}</div>
                        <div className="result-author">by {article.author.username}</div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
      )}

      <style>{`
        .navbar-search-wrapper {
          position: relative;
          flex: 1;
          max-width: 600px;
          margin: 0 2rem;
        }

        .navbar-search-input {
          width: 100%;
          padding: 0.6rem 1.2rem;
          border: 1px solid var(--border-color);
          border-radius: 9999px;
          background: var(--bg-hover);
          color: var(--text-main);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .navbar-search-input:focus {
          background: var(--bg-body);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
        }

        .navbar-search-input::placeholder {
          color: var(--text-light);
        }

        .navbar-search-results {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          max-height: 500px;
          overflow-y: auto;
          z-index: 1000;
          padding: 0.5rem 0;
        }

        .search-message {
          padding: 1.5rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .search-section-title {
          padding: 0.75rem 1rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: var(--bg-hover);
          border-bottom: 1px solid var(--border-color);
        }

        .search-result-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: var(--bg-hover);
        }

        .result-content {
          flex: 1;
          min-width: 0;
        }

        .result-name {
          color: var(--text-main);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }

        .result-title {
          color: var(--text-main);
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-bio,
        .result-author {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 768px) {
          .navbar-search-wrapper {
            max-width: 200px;
            margin: 0 1rem;
          }

          .navbar-search-results {
            max-height: 400px;
          }
        }
      `}</style>
    </div>
  );
};

export default NavbarSearch;
