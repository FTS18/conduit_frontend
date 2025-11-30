import ArticleActions from './ArticleActions';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import UserAvatar from '../UserAvatar';
import { Link } from 'react-router-dom';
import React from 'react';

const ArticleMeta = props => {
  const article = props.article;
  return (
    <div className="article-meta">
      <Link to={`/@${article.author.username}`}>
        <UserAvatar username={article.author.username} image={article.author.image} size="md" />
      </Link>

      <div className="info">
        <Link to={`/@${article.author.username}`} className="author">
          {(article.author.username || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Link>
        <span className="date">
          {distanceInWordsToNow(new Date(article.createdAt), { addSuffix: true })}
        </span>
      </div>

      <ArticleActions canModify={props.canModify} article={article} />
    </div>
  );
};

export default ArticleMeta;
