import {
  LOAD_NOTIFICATIONS,
  ADD_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  CLEAR_NOTIFICATIONS
} from '../constants/notificationTypes';

const initialState = {
  notifications: [],
  unreadCount: 0
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case CLEAR_NOTIFICATIONS:
      return initialState;
    default:
      return state;
  }
};
