import {
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_COMMENTS_PAGE_LOADED,
  FOLLOW_USER,
  UNFOLLOW_USER
} from '../constants/actionTypes';

export default (state = {}, action) => {
  switch (action.type) {
    case PROFILE_PAGE_LOADED:
    case PROFILE_COMMENTS_PAGE_LOADED:
      return {
        ...(action.payload[0] && action.payload[0].profile ? action.payload[0].profile : {}),
        totalArticlesCount: action.payload[2] || 0
      };
    case PROFILE_PAGE_UNLOADED:
      return {};
    case FOLLOW_USER:
    case UNFOLLOW_USER:
      return {
        ...state,
        ...(action.payload && action.payload.profile ? action.payload.profile : {}),
        // Ensure totalArticlesCount is preserved if not in payload
        totalArticlesCount: state.totalArticlesCount,
        // Fallback: if payload doesn't update following status correctly or is missing
        following: action.type === FOLLOW_USER,
        followersCount: action.payload.profile ? action.payload.profile.followersCount : (
          action.type === FOLLOW_USER ? (state.followersCount || 0) + 1 : (state.followersCount || 0) - 1
        )
      };
    default:
      return state;
  }
};
