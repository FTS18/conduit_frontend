import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const OfflineReader = () => {
  const [offlineArticles, setOfflineArticles] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline articles from localStorage
    const saved = localStorage.getItem('offlineArticles');
    if (saved) {
      setOfflineArticles(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveForOffline = (article) => {
    const offlineArticle = {
      ...article,
      savedAt: new Date().toISOString(),
      id: article.slug
    };
    
    const updated = [...offlineArticles, offlineArticle];
    setOfflineArticles(updated);
    localStorage.setItem('offlineArticles', JSON.stringify(updated));
  };

  const removeFromOffline = (slug) => {
    const updated = offlineArticles.filter(article => article.slug !== slug);
    setOfflineArticles(updated);
    localStorage.setItem('offlineArticles', JSON.stringify(updated));
  };

  const isArticleSaved = (slug) => {
    return offlineArticles.some(article => article.slug === slug);
  };

  if (!isOnline && offlineArticles.length === 0) {
    return (
      <div className="offline-reader">
        <div className="offline-message">
          <div className="offline-icon">📱</div>
          <h3>You're offline</h3>
          <p>No articles saved for offline reading. Save articles when online to read them later.</p>
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="offline-reader">
        <div className="offline-header">
          <div className="offline-status">
            <span className="offline-dot"></span>
            Offline Mode - {offlineArticles.length} articles available
          </div>
        </div>
        
        <div className="offline-articles">
          {offlineArticles.map(article => (
            <div key={article.slug} className="offline-article">
              <div className="article-header">
                <h3 className="article-title">{article.title}</h3>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromOffline(article.slug)}
                  title="Remove from offline"
                >
                  ✕
                </button>
              </div>
              <p className="article-description">{article.description}</p>
              <div className="article-meta">
                <div className="author-info">
                  <UserAvatar 
                    username={article.author.username} 
                    image={article.author.image} 
                    size="sm" 
                  />
                  <span className="author-name">{article.author.username}</span>
                </div>
                <span className="saved-date">
                  Saved {new Date(article.savedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="article-body">
                <div className="article-content">
                  {article.body || 'Article content will be available when online.'}
                </div>
              </div>
            </div>
          ))}
        </div>
        <style>{styles}</style>
      </div>
    );
  }

  return null;
};

// Export functions for use in other components
export const saveArticleOffline = (article) => {
  const saved = JSON.parse(localStorage.getItem('offlineArticles') || '[]');
  const offlineArticle = {
    ...article,
    savedAt: new Date().toISOString(),
    id: article.slug
  };
  
  const updated = [...saved.filter(a => a.slug !== article.slug), offlineArticle];
  localStorage.setItem('offlineArticles', JSON.stringify(updated));
};

export const removeArticleOffline = (slug) => {
  const saved = JSON.parse(localStorage.getItem('offlineArticles') || '[]');
  const updated = saved.filter(article => article.slug !== slug);
  localStorage.setItem('offlineArticles', JSON.stringify(updated));
};

export const isArticleSavedOffline = (slug) => {
  const saved = JSON.parse(localStorage.getItem('offlineArticles') || '[]');
  return saved.some(article => article.slug === slug);
};

const styles = `
  .offline-reader {
    padding: 1rem;
  }

  .offline-message {
    text-align: center;
    padding: 3rem 1rem;
    color: #666;
  }

  .offline-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .offline-message h3 {
    margin: 0 0 1rem 0;
    color: #373a3c;
  }

  .dark-theme .offline-message h3 {
    color: #e0e0e0;
  }

  .offline-header {
    margin-bottom: 1.5rem;
  }

  .offline-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    color: #856404;
    font-weight: 500;
  }

  .dark-theme .offline-status {
    background: #2d2a1f;
    border-color: #4a4017;
    color: #d4c069;
  }

  .offline-dot {
    width: 8px;
    height: 8px;
    background: #ffc107;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .offline-articles {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .offline-article {
    background: white;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .dark-theme .offline-article {
    background: #1a1a1a;
    border-color: #333;
  }

  .article-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .article-title {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #373a3c;
    line-height: 1.4;
  }

  .dark-theme .article-title {
    color: #e0e0e0;
  }

  .remove-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .remove-btn:hover {
    background: #f8f9fa;
    color: #e74c3c;
  }

  .dark-theme .remove-btn:hover {
    background: #2a2a2a;
  }

  .article-description {
    color: #666;
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }

  .dark-theme .article-description {
    color: #aaa;
  }

  .article-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e1e4e8;
  }

  .dark-theme .article-meta {
    border-bottom-color: #333;
  }

  .author-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .author-name {
    font-weight: 600;
    color: #5cb85c;
    font-size: 0.9rem;
  }

  .saved-date {
    color: #999;
    font-size: 0.85rem;
  }

  .article-content {
    color: #373a3c;
    line-height: 1.7;
    font-size: 1.1rem;
  }

  .dark-theme .article-content {
    color: #e0e0e0;
  }

  @media (max-width: 768px) {
    .offline-reader {
      padding: 0.5rem;
    }

    .offline-article {
      padding: 1rem;
    }

    .article-title {
      font-size: 1.1rem;
    }

    .article-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
`;

export default OfflineReader;