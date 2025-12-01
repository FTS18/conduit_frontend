import agent from '../agent';

export const sendNotification = async (userId, type, data) => {
  try {
    await agent.Notifications.send(userId, type, data);
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
};

export const notifyFollow = (userId, username) => {
  sendNotification(userId, 'follow', { follower: username });
};

export const notifyFavorite = (userId, articleTitle, username) => {
  sendNotification(userId, 'favorite', { article: articleTitle, user: username });
};

export const notifyBookmark = (userId, articleTitle, username) => {
  sendNotification(userId, 'bookmark', { article: articleTitle, user: username });
};

export const notifyComment = (userId, articleTitle, username) => {
  sendNotification(userId, 'comment', { article: articleTitle, user: username });
};

export const notifyUpvote = (userId, username) => {
  sendNotification(userId, 'upvote', { user: username });
};

export const notifyMention = (userId, username, articleTitle) => {
  sendNotification(userId, 'mention', { user: username, article: articleTitle });
};
