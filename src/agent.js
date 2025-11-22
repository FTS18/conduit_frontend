import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import { getTopTags } from './utils/readingHistory';

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const encode = encodeURIComponent;
const responseBody = res => res.body;

let token = null;
const tokenPlugin = req => {
  const storedToken = window.localStorage.getItem('jwt');
  const actualToken = token || storedToken;
  if (actualToken) {
    req.set('authorization', `Token ${actualToken}`);
  }
}

const requests = {
  del: url =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: url =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url, body) =>
    superagent.put(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody),
  post: (url, body) =>
    superagent.post(`${API_ROOT}${url}`, body).use(tokenPlugin).then(responseBody)
};

const Auth = {
  current: () =>
    requests.get('/user'),
  login: (email, password) =>
    requests.post('/users/login', { user: { email, password } }),
  register: (username, email, password) =>
    requests.post('/users', { user: { username, email, password } }),
  save: user =>
    requests.put('/user', { user })
};

const Tags = {
  getAll: () => requests.get('/tags')
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = article => Object.assign({}, article, { slug: undefined })
const Articles = {
  all: page =>
    requests.get(`/articles?${limit(10, page)}`),
  feed: page =>
    requests.get(`/articles/feed?${limit(10, page)}`),
  combinedFeed: page => {
    return Promise.all([
      requests.get(`/articles/feed?${limit(10, page)}`),
      Promise.resolve().then(() => {
        const topTags = getTopTags();
        if (topTags.length === 0) return { articles: [] };
        return Promise.all(topTags.map(tag => requests.get(`/articles?tag=${encode(tag)}&${limit(10, 0)}`))).then(results => {
          const articles = [];
          const seen = new Set();
          results.forEach(result => {
            result.articles.forEach(article => {
              if (!seen.has(article.slug)) {
                seen.add(article.slug);
                articles.push({ ...article, isRecommended: true });
              }
            });
          });
          return { articles: articles.slice(0, 6) };
        });
      })
    ]).then(([feedResult, recommendedResult]) => {
      const seen = new Set();
      const combined = [];
      
      recommendedResult.articles.forEach(article => {
        seen.add(article.slug);
        combined.push(article);
      });
      
      feedResult.articles.forEach(article => {
        if (!seen.has(article.slug)) {
          combined.push(article);
        }
      });
      
      return { articles: combined.slice(0, 10), articlesCount: combined.length };
    });
  },
  byAuthor: (author, page) =>
    requests.get(`/articles?author=${encode(author)}&${limit(5, page)}`),
  byTag: (tag, page) =>
    requests.get(`/articles?tag=${encode(tag)}&${limit(10, page)}`),
  search: (query) =>
    requests.get(`/articles?search=${encode(query)}&${limit(10, 0)}`),
  trending: (timeframe = 'week') =>
    requests.get(`/articles/trending?timeframe=${timeframe}&${limit(10, 0)}`),
  del: slug =>
    requests.del(`/articles/${slug}`),
  favorite: slug =>
    requests.post(`/articles/${slug}/favorite`),
  favoritedBy: (author, page) =>
    requests.get(`/articles?favorited=${encode(author)}&${limit(5, page)}`),
  get: slug =>
    requests.get(`/articles/${slug}`),
  unfavorite: slug =>
    requests.del(`/articles/${slug}/favorite`),
  update: article =>
    requests.put(`/articles/${article.slug}`, { article: omitSlug(article) }),
  create: article =>
    requests.post('/articles', { article }),
  bookmark: slug =>
    requests.post(`/articles/${slug}/bookmark`),
  unbookmark: slug =>
    requests.del(`/articles/${slug}/bookmark`)
};

const Bookmarks = {
  getAll: () => requests.get('/bookmarks')
};

const Comments = {
  create: (slug, comment) =>
    requests.post(`/articles/${slug}/comments`, { comment }),
  delete: (slug, commentId) =>
    requests.del(`/articles/${slug}/comments/${commentId}`),
  update: (slug, commentId, body) =>
    requests.put(`/articles/${slug}/comments/${commentId}`, { comment: { body } }),
  forArticle: slug =>
    requests.get(`/articles/${slug}/comments`),
  upvote: (commentId) =>
    requests.post(`/comments/${commentId}/vote`, { value: 1 }),
  downvote: (commentId) =>
    requests.post(`/comments/${commentId}/vote`, { value: -1 })
};

const Profile = {
  follow: username =>
    requests.post(`/profiles/${username}/follow`),
  get: username =>
    requests.get(`/profiles/${username}`),
  unfollow: username =>
    requests.del(`/profiles/${username}/follow`),
  block: username =>
    requests.post(`/profiles/${username}/block`),
  unblock: username =>
    requests.del(`/profiles/${username}/block`),
  getAllUsers: () =>
    requests.get('/profiles'),
  getComments: username => {
    // Workaround: Get recent articles and fetch comments from all of them
    return requests.get(`/articles?limit=50`)
      .then(articlesResponse => {
        if (!articlesResponse.articles || articlesResponse.articles.length === 0) {
          return { comments: [] };
        }
        
        // Get comments from all recent articles and filter by username
        const commentPromises = articlesResponse.articles.map(article => 
          requests.get(`/articles/${article.slug}/comments`)
            .then(commentsResponse => 
              (commentsResponse.comments || []).filter(comment => 
                comment.author.username === username
              ).map(comment => ({
                ...comment,
                article: {
                  slug: article.slug,
                  title: article.title
                }
              }))
            )
            .catch(() => [])
        );
        
        return Promise.all(commentPromises)
          .then(commentArrays => {
            const allComments = commentArrays.flat()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { comments: allComments };
          });
      })
      .catch(() => ({ comments: [] }));
  }
};

const Notifications = {
  getAll: () =>
    requests.get('/notifications'),
  markRead: (id) =>
    requests.put(`/notifications/${id}/read`, {})
};

const Moderation = {
  report: (data) =>
    requests.post('/moderation/report', data)
};

export default {
  Articles,
  Auth,
  Bookmarks,
  Comments,
  Profile,
  Tags,
  Notifications,
  Moderation,
  setToken: _token => { token = _token; }
};
