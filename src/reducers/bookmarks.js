import {
  BOOKMARKS_PAGE_LOADED,
  BOOKMARKS_PAGE_UNLOADED,
  ARTICLE_BOOKMARKED,
  ARTICLE_UNBOOKMARKED
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case BOOKMARKS_PAGE_LOADED:
      return {
        ...state,
        articles: action.payload.articles,
        articlesCount: action.payload.articlesCount
      };
    case BOOKMARKS_PAGE_UNLOADED:
      return {};
    case ARTICLE_BOOKMARKED:
      // Don't add to reading list here, let user refresh to see new bookmarks
      return state;
    case ARTICLE_UNBOOKMARKED:
      if (!state.articles) {
        return state;
      }
      // Remove unbookmarked article from reading list immediately
      const filteredArticles = state.articles.filter(article => 
        article.slug !== action.payload.article.slug
      );
      return {
        ...state,
        articles: filteredArticles,
        articlesCount: filteredArticles.length
      };
    default:
      return state;
  }
};