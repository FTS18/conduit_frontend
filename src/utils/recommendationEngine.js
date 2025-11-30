// Recommendation Engine with Caching and Engagement Scoring
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

class RecommendationCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
  }

  set(key, value) {
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.timestamps.entries())
        .sort(([, a], [, b]) => a - b)[0][0];
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }
    this.cache.set(key, value);
    this.timestamps.set(key, Date.now());
  }

  get(key) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

const cache = new RecommendationCache();

// Calculate engagement score for an article
export const calculateEngagementScore = (article) => {
  const favoritesWeight = 3;
  const bookmarksWeight = 2;
  const commentsWeight = 1;
  
  const favorites = article.favoritesCount || 0;
  const bookmarks = article.bookmarked ? 1 : 0;
  const comments = article.commentsCount || 0;
  
  return (favorites * favoritesWeight) + (bookmarks * bookmarksWeight) + (comments * commentsWeight);
};

// Get tag diversity score (prefer articles with different tags)
export const getTagDiversityScore = (article, seenTags) => {
  const tags = article.tagList || [];
  const newTags = tags.filter(tag => !seenTags.has(tag)).length;
  return newTags / Math.max(tags.length, 1);
};

// Score articles based on multiple factors
export const scoreArticles = (articles, readingHistory = []) => {
  const readSlugs = new Set(readingHistory.map(a => a.slug));
  const seenTags = new Set();

  return articles
    .filter(a => !readSlugs.has(a.slug)) // Exclude already read
    .map(article => {
      const engagement = calculateEngagementScore(article);
      const diversity = getTagDiversityScore(article, seenTags);
      const recency = Math.max(0, 10 - Math.floor((Date.now() - new Date(article.createdAt)) / (1000 * 60 * 60 * 24)));
      
      article.tagList?.forEach(tag => seenTags.add(tag));
      
      return {
        ...article,
        score: (engagement * 0.5) + (diversity * 0.3) + (recency * 0.2)
      };
    })
    .sort((a, b) => b.score - a.score);
};

// Get recommendations with caching
export const getRecommendations = (articles, topTags, readingHistory = [], limit = 6) => {
  const cacheKey = `recs_${topTags.join('_')}_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;

  const scored = scoreArticles(articles, readingHistory);
  const recommendations = scored.slice(0, limit);
  
  cache.set(cacheKey, recommendations);
  return recommendations;
};

// Clear cache when needed
export const clearRecommendationCache = () => cache.clear();

// Batch recommendations by category
export const categorizeRecommendations = (articles) => {
  return {
    trending: articles.filter(a => calculateEngagementScore(a) > 5).slice(0, 3),
    recent: articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3),
    topRated: articles.sort((a, b) => (b.favoritesCount || 0) - (a.favoritesCount || 0)).slice(0, 3)
  };
};
