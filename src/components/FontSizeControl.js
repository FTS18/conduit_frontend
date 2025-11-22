import React, { useState, useEffect } from 'react';

const FontSizeControl = () => {
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    setFontSize(savedFontSize);
    applyFontSize(savedFontSize);
  }, []);

  const applyFontSize = (size) => {
    document.documentElement.setAttribute('data-font-size', size);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    applyFontSize(size);
  };

  return (
    <div className="font-size-control">
      <div className="font-size-label">Text Size:</div>
      <div className="font-size-buttons">
        <button 
          className={`font-btn ${fontSize === 'small' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('small')}
          title="Small text"
        >
          A
        </button>
        <button 
          className={`font-btn ${fontSize === 'medium' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('medium')}
          title="Medium text"
        >
          A
        </button>
        <button 
          className={`font-btn ${fontSize === 'large' ? 'active' : ''}`}
          onClick={() => handleFontSizeChange('large')}
          title="Large text"
        >
          A
        </button>
      </div>
      
      <style>{`
        .font-size-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
        }

        .font-size-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .dark-theme .font-size-label {
          color: #aaa;
        }

        .font-size-buttons {
          display: flex;
          gap: 0.25rem;
        }

        .font-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.2s;
        }

        .font-btn:nth-child(1) { font-size: 12px; }
        .font-btn:nth-child(2) { font-size: 14px; }
        .font-btn:nth-child(3) { font-size: 16px; }

        .dark-theme .font-btn {
          background: #2a2a2a;
          border-color: #444;
          color: #e0e0e0;
        }

        .font-btn:hover {
          border-color: #5cb85c;
          color: #5cb85c;
        }

        .font-btn.active {
          background: #5cb85c;
          color: white;
          border-color: #5cb85c;
        }

        /* Font size CSS variables */
        [data-font-size="small"] {
          --base-font-size: 0.875rem;
          --article-font-size: 0.95rem;
          --title-font-size: 1.25rem;
        }

        [data-font-size="medium"] {
          --base-font-size: 1rem;
          --article-font-size: 1.1rem;
          --title-font-size: 1.4rem;
        }

        [data-font-size="large"] {
          --base-font-size: 1.125rem;
          --article-font-size: 1.25rem;
          --title-font-size: 1.6rem;
        }

        /* Apply font sizes to content */
        [data-font-size] .article-preview .article-title {
          font-size: var(--title-font-size) !important;
        }

        [data-font-size] .article-preview .article-description {
          font-size: var(--article-font-size) !important;
        }

        [data-font-size] .comment-body {
          font-size: var(--article-font-size) !important;
        }

        [data-font-size] body {
          font-size: var(--base-font-size) !important;
        }
      `}</style>
    </div>
  );
};

export default FontSizeControl;