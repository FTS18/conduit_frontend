import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';
import SkeletonLoader from './SkeletonLoader';
import RecommendedProfiles from './RecommendedProfiles';
import React from 'react';

const ArticleList = props => {
  if (!props.articles) {
    return (
      <div style={{ marginTop: '2rem' }}>
        <SkeletonLoader />
      </div>
    );
  }

  if (props.articles.length === 0) {
    return (
      <div className="article-preview">
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: 'var(--text-light)',
          fontSize: '1.1rem'
        }}>
          <span role="img" aria-label="newspaper">
            📰
          </span>{' '}
          No articles are here... yet.
        </div>
      </div>
    );
  }

  return (
    <div className="article-list-container">
      <style>{`
        .article-list-container {
          margin: 0;
          padding-top: 1.5rem;
          width: 100%;
          box-sizing: border-box;
        }
        
        .article-list-item {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }
        
        .who-to-follow-section {
          display: none;
        }
        
        @media (max-width: 480px) {
          .article-list-container {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .article-list-item {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .who-to-follow-section {
            display: block;
            margin: 0;
            padding: 0;
          }
          
          .who-to-follow-section .recommended-profiles {
            border-radius: 0;
            margin: 0;
            padding: 1rem;
            border: none;
            border-top: 1px solid var(--border-color);
          }
          
          .who-to-follow-section .profiles-list {
            display: flex;
            flex-direction: row;
            overflow-x: auto;
            gap: 1rem;
            scroll-behavior: smooth;
            scrollbar-width: none;
          }
          
          .who-to-follow-section .profiles-list::-webkit-scrollbar {
            display: none;
          }
          
          .who-to-follow-section .profile-item {
            flex: 0 0 calc(50% - 0.5rem);
            flex-direction: column;
            text-align: center;
            padding: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 12px;
          }
          
          .who-to-follow-section .profile-link {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .who-to-follow-section .profile-details {
            width: 100%;
          }
          
          .who-to-follow-section .profile-bio {
            white-space: normal;
            overflow: visible;
            text-overflow: clip;
          }
          
          .who-to-follow-section .load-more-btn {
            flex: 0 0 calc(50% - 0.5rem);
            margin: 0;
            padding: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            background: var(--bg-hover);
            color: var(--primary);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 120px;
            width: auto;
          }
        }
      `}</style>
      {
        props.articles.map(article => {
          return (
            <div key={article.slug} className="article-list-item">
              <ArticlePreview article={article} />
            </div>
          );
        })
      }

      <ListPagination
        pager={props.pager}
        articlesCount={props.articlesCount}
        currentPage={props.currentPage} />
      
      <div className="who-to-follow-section">
        <RecommendedProfiles />
      </div>
    </div>
  );
};

export default ArticleList;
