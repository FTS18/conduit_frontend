import { Link } from 'react-router-dom';
import React from 'react';
import agent from '../../agent';
import { connect } from 'react-redux';
import { 
  DELETE_ARTICLE, 
  FOLLOW_USER, 
  UNFOLLOW_USER,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED
} from '../../constants/actionTypes';

const mapStateToProps = state => ({
  currentUser: state.common.currentUser
});

const mapDispatchToProps = dispatch => ({
  onClickDelete: payload =>
    dispatch({ type: DELETE_ARTICLE, payload }),
  onFollow: username => dispatch({
    type: FOLLOW_USER,
    payload: agent.Profile.follow(username)
  }),
  onUnfollow: username => dispatch({
    type: UNFOLLOW_USER,
    payload: agent.Profile.unfollow(username)
  }),
  onFavorite: slug => dispatch({
    type: ARTICLE_FAVORITED,
    payload: agent.Articles.favorite(slug)
  }),
  onUnfavorite: slug => dispatch({
    type: ARTICLE_UNFAVORITED,
    payload: agent.Articles.unfavorite(slug)
  }),
  onBookmark: slug => dispatch({
    type: ARTICLE_BOOKMARKED,
    payload: agent.Articles.bookmark(slug)
  }),
  onUnbookmark: slug => dispatch({
    type: ARTICLE_UNBOOKMARKED,
    payload: agent.Articles.unbookmark(slug)
  })
});

const ArticleActions = props => {
  const article = props.article;
  const currentUser = props.currentUser;
  
  const del = () => {
    props.onClickDelete(agent.Articles.del(article.slug))
  };
  
  const handleFollow = ev => {
    ev.preventDefault();
    if (article.author.following) {
      props.onUnfollow(article.author.username);
    } else {
      props.onFollow(article.author.username);
    }
  };
  
  const handleFavorite = ev => {
    ev.preventDefault();
    if (article.favorited) {
      props.onUnfavorite(article.slug);
    } else {
      props.onFavorite(article.slug);
    }
  };
  
  const handleBookmark = ev => {
    ev.preventDefault();
    if (article.bookmarked) {
      props.onUnbookmark(article.slug);
    } else {
      props.onBookmark(article.slug);
    }
  };
  
  if (props.canModify) {
    return (
      <span>
        <Link
          to={`/editor/${article.slug}`}
          className="btn btn-outline-secondary btn-sm">
          <i className="ion-edit"></i> Edit Article
        </Link>
        <button className="btn btn-outline-danger btn-sm" onClick={del}>
          <i className="ion-trash-a"></i> Delete Article
        </button>
      </span>
    );
  }

  if (!currentUser) {
    return <span></span>;
  }

  return (
    <span>
      <button 
        className={`btn btn-sm ${article.author.following ? 'btn-secondary' : 'btn-outline-secondary'}`}
        onClick={handleFollow}>
        <i className="ion-plus-round"></i>
        &nbsp;{article.author.following ? 'Unfollow' : 'Follow'} {article.author.username}
      </button>
      &nbsp;&nbsp;
      <button 
        className={`btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={handleFavorite}>
        <i className="ion-heart"></i>
        &nbsp;{article.favorited ? 'Unfavorite' : 'Favorite'} Article ({article.favoritesCount})
      </button>
      &nbsp;&nbsp;
      <button 
        className={`btn btn-sm ${article.bookmarked ? 'btn-success' : 'btn-outline-success'}`}
        onClick={handleBookmark}>
        <i className="ion-bookmark"></i>
        &nbsp;{article.bookmarked ? 'Unbookmark' : 'Bookmark'} Article
      </button>
    </span>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ArticleActions);
