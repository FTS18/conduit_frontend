import {
  PROFILE_COMMENTS_PAGE_LOADED,
  PROFILE_COMMENTS_PAGE_UNLOADED
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case PROFILE_COMMENTS_PAGE_LOADED:
      return {
        ...state,
        comments: (action.payload[1] && action.payload[1].comments) || []
      };
    case PROFILE_COMMENTS_PAGE_UNLOADED:
      return {};
    default:
      return state;
  }
};