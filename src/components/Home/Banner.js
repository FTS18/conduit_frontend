import React, { useState, useRef, useEffect } from 'react';
import agent from '../../agent';
import UserAvatar from '../UserAvatar';

const Banner = ({ appName, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [authorResults, setAuthorResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef(null);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const allResults = [
    ...authorResults.map(a => ({ type: 'author', data: a })),
    ...searchResults.map(a => ({ type: 'article', data: a }))
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length > 0) {
      debounceTimer.current = setTimeout(async () => {
        try {
          const results = await agent.Articles.search(query);
          const articles = results.articles || [];
          
          const uniqueAuthors = [];
          const seenAuthors = new Set();
          articles.forEach(article => {
            if (!seenAuthors.has(article.author.username)) {
              seenAuthors.add(article.author.username);
              uniqueAuthors.push(article.author);
            }
          });
          
          setSearchResults(articles);
          setAuthorResults(uniqueAuthors.slice(0, 3));
          setShowResults(true);
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
          setAuthorResults([]);
        }
      }, 300);
    } else {
      setShowResults(false);
      setSearchResults([]);
      setAuthorResults([]);
    }
  };

  const handleKeyDown = (e) => {
    if (!showResults || allResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const result = allResults[selectedIndex];
          if (result.type === 'author') {
            window.location.hash = `#/@${result.data.username}`;
          } else {
            window.location.hash = `#/article/${result.data.slug}`;
          }
          handleResultClick();
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
      default:
        break;
    }
  };

  const handleResultClick = () => {
    setSearchQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="banner">
      <div className="container">
        <h1 className="logo-font">
          {appName.toLowerCase()}
        </h1>
        <p>A place to share your knowledge.</p>
        
        <div className="banner-search-container">
          <div className="search-input-wrapper" ref={wrapperRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search articles here..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="banner-search-input"
            />
            {showResults && (searchResults.length > 0 || authorResults.length > 0) && (
              <div className="search-results-dropdown">
                {authorResults.length > 0 && (
                  <React.Fragment>
                    <div className="search-section-title">Authors</div>
                    {authorResults.map((author, idx) => (
                      <div
                        key={author.username}
                        className={`search-author-item ${selectedIndex === idx ? 'selected' : ''}`}
                        onClick={() => {
                          window.location.hash = `#/@${author.username}`;
                          handleResultClick();
                        }}
                      >
                        <UserAvatar username={author.username} image={author.image} size="sm" />
                        <div className="author-info">
                          <div className="author-name">{author.username}</div>
                          {author.bio && <div className="author-bio">{author.bio}</div>}
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 0 && <div className="search-divider"></div>}
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
                        <div className="result-title">{article.title}</div>
                        <div className="result-author">by {article.author.username}</div>
                      </div>
                    ))}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .banner {
          background: linear-gradient(135deg, #5cb85c 0%, #4a9d4a 100%);
          padding: 3rem 0;
          margin-bottom: 2rem;
          color: white;
          text-align: center;
        }

        .dark-theme .banner {
          background: linear-gradient(135deg, #4a9d4a 0%, #3a7d3a 100%);
        }

        .banner h1 {
          font-size: 3.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .banner p {
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .banner-search-container {
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input-wrapper {
          position: relative;
        }

        .banner-search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          background: white;
          color: #333;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s;
        }

        .banner-search-input:focus {
          outline: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .banner-search-input::placeholder {
          color: #999;
        }

        .search-results-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1e4e8;
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          text-align: left;
        }

        .search-section-title {
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e4e8;
        }

        .search-divider {
          height: 1px;
          background: #e1e4e8;
          margin: 0;
        }

        .search-author-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .search-author-item:hover,
        .search-author-item.selected {
          background: #f0f0f0;
        }

        .author-info {
          flex: 1;
          min-width: 0;
        }

        .author-name {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .author-bio {
          font-size: 0.8rem;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-result-item {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover,
        .search-result-item.selected {
          background: #f0f0f0;
        }

        .result-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-author {
          font-size: 0.85rem;
          color: #999;
        }

        @media (max-width: 768px) {
          .banner {
            padding: 2rem 0;
            margin-bottom: 1.5rem;
          }

          .banner h1 {
            font-size: 2.5rem;
          }

          .banner p {
            font-size: 1.1rem;
          }

          .banner-search-container {
            max-width: 100%;
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;
