import ArticlePreview from './ArticlePreview';
import ListPagination from './ListPagination';
import SkeletonLoader from './SkeletonLoader';
import React from 'react';

const ArticleList = props => {
  if (!props.articles) {
    return <SkeletonLoader />;
  }

  if (props.articles.length === 0) {
    return (
      <div className="article-preview">
        No articles are here... yet.
      </div>
    );
  }

  return (
    <div style={{ marginLeft: '-1.5rem', marginTop: '1.5rem', marginRight: '-1.5rem' }}>
      {
        props.articles.map(article => {
          return (
            <div key={article.slug} style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
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
