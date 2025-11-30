import React, { useState, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import agent from '../agent';

const EnhancedSearch = ({ history }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Load recent searches
    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent);
    }, []);

    // Fetch suggestions
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const [articles, users] = await Promise.all([
                    agent.Articles.search(query).catch(() => ({ articles: [] })),
                    agent.Profile.searchUsers(query).catch(() => ({ profiles: [] }))
                ]);

                const articleSuggestions = (articles.articles || []).slice(0, 3).map(a => ({
                    type: 'article',
                    title: a.title,
                    slug: a.slug,
                    author: a.author.username
                }));

                const userSuggestions = (users.profiles || []).slice(0, 3).map(u => ({
                    type: 'user',
                    username: u.username,
                    bio: u.bio
                }));

                setSuggestions([...articleSuggestions, ...userSuggestions]);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSelectSuggestion(suggestions[selectedIndex]);
            } else if (query) {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSearch = () => {
        if (!query.trim()) return;

        // Save to recent searches
        const recent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(recent));
        setRecentSearches(recent);

        // Navigate to search results
        history.push(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleSelectSuggestion = (suggestion) => {
        if (suggestion.type === 'article') {
            history.push(`/article/${suggestion.slug}`);
        } else if (suggestion.type === 'user') {
            history.push(`/@${suggestion.username}`);
        }
        setIsOpen(false);
        setQuery('');
    };

    const handleRecentSearch = (search) => {
        setQuery(search);
        history.push(`/search?q=${encodeURIComponent(search)}`);
        setIsOpen(false);
    };

    const clearRecentSearches = () => {
        localStorage.removeItem('recentSearches');
        setRecentSearches([]);
    };

    return (
        <div ref={searchRef} className="enhanced-search">
            <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search articles, authors... (Ctrl+K)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                        }}
                        className="clear-btn"
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}

                <kbd className="search-kbd">⌘K</kbd>
            </div>

            {isOpen && (
                <div className="search-dropdown">
                    {isLoading && (
                        <div className="search-loading">
                            <div className="spinner" />
                            <span>Searching...</span>
                        </div>
                    )}

                    {!isLoading && query.length < 2 && recentSearches.length > 0 && (
                        <div className="search-section">
                            <div className="section-header">
                                <span>Recent Searches</span>
                                <button onClick={clearRecentSearches} className="clear-recent-btn">
                                    Clear
                                </button>
                            </div>
                            {recentSearches.map((search, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleRecentSearch(search)}
                                    className="search-item recent-item"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    <span>{search}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && suggestions.length > 0 && (
                        <div className="search-section">
                            {suggestions.map((suggestion, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className={`search-item ${selectedIndex === i ? 'selected' : ''}`}
                                >
                                    {suggestion.type === 'article' ? (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <div className="suggestion-content">
                                                <div className="suggestion-title">{suggestion.title}</div>
                                                <div className="suggestion-meta">by @{suggestion.author}</div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                            <div className="suggestion-content">
                                                <div className="suggestion-title">@{suggestion.username}</div>
                                                {suggestion.bio && <div className="suggestion-meta">{suggestion.bio}</div>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && query.length >= 2 && suggestions.length === 0 && (
                        <div className="search-empty">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
        .enhanced-search {
          position: relative;
          width: 100%;
          max-width: 600px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 10px 80px 10px 44px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
          background: #fff;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-btn {
          position: absolute;
          right: 60px;
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        }

        .search-kbd {
          position: absolute;
          right: 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          font-family: monospace;
          color: #6b7280;
          pointer-events: none;
        }

        .search-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-height: 400px;
          overflow-y: auto;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .search-loading {
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #6b7280;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .search-section {
          padding: 8px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .clear-recent-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 12px;
          cursor: pointer;
          padding: 0;
        }

        .search-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .search-item:hover,
        .search-item.selected {
          background: #f9fafb;
        }

        .search-item svg {
          flex-shrink: 0;
          color: #9ca3af;
        }

        .suggestion-content {
          flex: 1;
          min-width: 0;
        }

        .suggestion-title {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .suggestion-meta {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .search-empty {
          padding: 48px 24px;
          text-align: center;
          color: #9ca3af;
        }

        .search-empty svg {
          margin: 0 auto 16px;
        }

        .search-empty p {
          margin: 0;
          font-size: 14px;
        }

        /* Dark theme */
        .dark-theme .search-input {
          background: #1f2937;
          border-color: #374151;
          color: #f9fafb;
        }

        .dark-theme .search-input:focus {
          border-color: #3b82f6;
        }

        .dark-theme .search-kbd {
          background: #374151;
          border-color: #4b5563;
          color: #9ca3af;
        }

        .dark-theme .search-dropdown {
          background: #1f2937;
          border-color: #374151;
        }

        .dark-theme .search-item:hover,
        .dark-theme .search-item.selected {
          background: #374151;
        }

        .dark-theme .suggestion-title {
          color: #f9fafb;
        }

        @media (max-width: 768px) {
          .search-kbd {
            display: none;
          }

          .clear-btn {
            right: 12px;
          }
        }
      `}</style>
        </div>
    );
};

export default withRouter(EnhancedSearch);
