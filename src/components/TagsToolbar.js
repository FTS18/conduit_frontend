import React from 'react';
import { connect } from 'react-redux';
import agent from '../agent';
import { APPLY_TAG_FILTER } from '../constants/actionTypes';

const mapStateToProps = state => ({
  tags: state.home.tags,
  currentTag: state.articleList.tag
});

const mapDispatchToProps = dispatch => ({
  onClickTag: (tag, pager, payload) =>
    dispatch({ type: APPLY_TAG_FILTER, tag, pager, payload })
});

const TagsToolbar = ({ tags, currentTag, onClickTag }) => {
  const handleTagClick = (tag) => {
    const payload = agent.Articles.byTag(tag, 0);
    onClickTag(tag, null, payload);
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="tags-toolbar">
      <div className="tags-scroll">
        <button
          className={`tag-btn ${!currentTag ? 'active' : ''}`}
          onClick={() => onClickTag(null, null, agent.Articles.all())}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className={`tag-btn ${currentTag === tag ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      
      <style jsx>{`
        .tags-toolbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-top: 1px solid var(--border-color);
          z-index: 1000;
          width: 100%;
          height: fit-content;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .tags-scroll {
          display: flex;
          align-items: center;
          height: 40px;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .tags-scroll::-webkit-scrollbar {
          display: none;
        }
        
        .tag-btn {
          flex-shrink: 0;
          padding: 0.25rem 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: calc(0.9rem * var(--font-scale));
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          outline: none;
          border-bottom: 3px solid transparent;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .tag-btn:hover {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        
        .tag-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          font-weight: 600;
        }
        
        @media (min-width: 769px) {
          .tags-toolbar {
            bottom: 0 !important;
            top: auto !important;
            left: 25% !important;
            right: 25% !important;
            width: 50% !important;
          }
        }
        
        @media (max-width: 768px) {
          .tags-toolbar {
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            bottom: 60px !important;
          }
          
          .tag-btn {
            padding: 0.5rem 0.8rem;
            font-size: calc(0.85rem * var(--font-scale));
          }
        }
      `}</style>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(TagsToolbar);
