import article from './reducers/article';
import articleList from './reducers/articleList';
import auth from './reducers/auth';
import bookmarks from './reducers/bookmarks';
import { combineReducers } from 'redux';
import common from './reducers/common';
import editor from './reducers/editor';
import home from './reducers/home';
import profile from './reducers/profile';
import profileComments from './reducers/profileComments';
import settings from './reducers/settings';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  article,
  articleList,
  auth,
  bookmarks,
  common,
  editor,
  home,
  profile,
  profileComments,
  settings,
  router: routerReducer
});
