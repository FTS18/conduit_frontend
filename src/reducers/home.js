import { 
  HOME_PAGE_LOADED, 
  HOME_PAGE_UNLOADED,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case HOME_PAGE_LOADED:
      return {
        ...state,
        tags: action.payload && action.payload[0] ? action.payload[0].tags : []
      };
    case HOME_PAGE_UNLOADED:
      return {};
    case ARTICLE_FAVORITED:
    case ARTICLE_UNFAVORITED:
      if (!state.articles) {
        return state;
      }
      return {
        ...state,
        articles: state.articles.map(article => {
          if (article.slug === action.payload.article.slug) {
            return {
              ...article,
              favorited: action.payload.article.favorited,
              favoritesCount: action.payload.article.favoritesCount
            };
          }
          return article;
        })
      };
    case ARTICLE_BOOKMARKED:
    case ARTICLE_UNBOOKMARKED:
      if (!state.articles) {
        return state;
      }
      return {
        ...state,
        articles: state.articles.map(article => {
          if (article.slug === action.payload.article.slug) {
            return {
              ...article,
              bookmarked: action.payload.article.bookmarked
            };
          }
          return article;
        })
      };
    default:
      return state;
  }
};
