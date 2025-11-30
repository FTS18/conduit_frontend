import React, { useState, useEffect } from 'react';
import { saveArticleOffline, removeArticleOffline, isArticleSavedOffline } from './OfflineReader';

const OfflineButton = ({ article }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (article) {
      setIsSaved(isArticleSavedOffline(article.slug));
    }
  }, [article]);

  const handleToggleOffline = () => {
    if (!article) return;

    if (isSaved) {
      removeArticleOffline(article.slug);
      setIsSaved(false);
    } else {
      saveArticleOffline(article);
      setIsSaved(true);
    }
  };

  return (
    <button
      className={`offline-btn ${isSaved ? 'saved' : ''}`}
      onClick={handleToggleOffline}
      title={isSaved ? 'Remove from offline reading' : 'Save for offline reading'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {isSaved ? 'Saved' : 'Save'}

      <style>{`
        .offline-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          background: var(--bg-hover);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .offline-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .offline-btn.saved {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .offline-btn.saved:hover {
          background: var(--primary-hover);
        }
      `}</style>
    </button>
  );
};

export default OfflineButton;
