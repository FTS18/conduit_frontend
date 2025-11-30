import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';
import SkeletonLoader from './SkeletonLoader';
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
    </div>
  );
};

export default ArticleList;
