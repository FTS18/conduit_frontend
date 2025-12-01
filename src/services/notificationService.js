const API_ROOT = process.env.REACT_APP_API_URL || 'https://conduitbackend-production.up.railway.app/api';

export const sendNotification = async (userId, type, data) => {
  try {
    const token = window.localStorage.getItem('jwt');
    const response = await fetch(`${API_ROOT}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ userId, type, data })
    });
    return response.json();
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
