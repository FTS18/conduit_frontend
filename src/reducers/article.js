import {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
  ADD_COMMENT,
  DELETE_COMMENT,
  FOLLOW_USER,
  UNFOLLOW_USER,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED,
  COMMENT_UPVOTED,
  COMMENT_DOWNVOTED
} from '../constants/actionTypes';

export default (state = { comments: [] }, action) => {
  switch (action.type) {
    case ARTICLE_PAGE_LOADED:
      return {
        ...state,
        article: action.payload[0].article,
        comments: (action.payload[1] && action.payload[1].comments) || action.payload[1] || []
      };
    case ARTICLE_PAGE_UNLOADED:
      return {};
    case ADD_COMMENT:
      return {
        ...state,
        commentErrors: action.error ? action.payload.errors : null,
        comments: action.error ?
          null :
          (state.comments || []).concat([action.payload.comment])
      };
    case DELETE_COMMENT:
      const commentId = action.commentId
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== commentId)
      };
    case FOLLOW_USER:
    case UNFOLLOW_USER:
      if (!state.article || !state.article.author) {
        return state;
      }
      return {
        ...state,
        article: {
          ...state.article,
          author: {
            ...state.article.author,
            following: action.payload.profile.following
          }
        }
      };
    case ARTICLE_FAVORITED:
    case ARTICLE_UNFAVORITED:
      if (!state.article) {
        return state;
      }
      return {
        ...state,
        article: {
          ...state.article,
          favorited: action.payload.article.favorited,
          favoritesCount: action.payload.article.favoritesCount
        }
      };
    case ARTICLE_BOOKMARKED:
    case ARTICLE_UNBOOKMARKED:
      if (!state.article) {
        return state;
      }
      return {
        ...state,
        article: {
          ...state.article,
          bookmarked: action.payload.article.bookmarked
        }
      };
    case COMMENT_UPVOTED:
    case COMMENT_DOWNVOTED:
      if (!state.comments) {
        return state;
      }
      const vote = action.payload.vote;
      const newVote = vote ? vote.value : 0;
      return {
        ...state,
        comments: state.comments.map(comment => {
          if (comment.id === action.commentId) {
            const oldVote = comment.userVote || 0;
            const upvoteDelta = (newVote === 1 ? 1 : 0) - (oldVote === 1 ? 1 : 0);
            const downvoteDelta = (newVote === -1 ? 1 : 0) - (oldVote === -1 ? 1 : 0);
            return {
              ...comment,
              upvotes: Math.max(0, (comment.upvotes || 0) + upvoteDelta),
              downvotes: Math.max(0, (comment.downvotes || 0) + downvoteDelta),
              userVote: newVote
            };
          }
          return comment;
        })
      };
    default:
      return state;
  }
};
