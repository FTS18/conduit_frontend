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
      const profileData = action.payload[0];
      const profile = profileData && profileData.profile ? profileData.profile : profileData;
      return {
        ...profile,
        totalArticlesCount: action.payload[2] || 0,
        isOwnProfile: profileData && profileData.isOwnProfile
      };
    case PROFILE_PAGE_UNLOADED:
      return {};
    case FOLLOW_USER:
      if (state.isOwnProfile) {
        return {
          ...state,
          followingCount: (state.followingCount || 0) + 1
        };
      }
      return {
        ...state,
        following: true,
        followersCount: (state.followersCount || 0) + 1
      };
    case UNFOLLOW_USER:
      if (state.isOwnProfile) {
        return {
          ...state,
          followingCount: Math.max(0, (state.followingCount || 0) - 1)
        };
      }
      return {
        ...state,
        following: false,
        followersCount: Math.max(0, (state.followersCount || 0) - 1)
      };
    default:
      return state;
  }
};
