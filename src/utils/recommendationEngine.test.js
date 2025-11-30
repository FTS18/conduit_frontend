// Unit tests for recommendation engine

import {
  calculateEngagementScore,
  getTagDiversityScore,
  scoreArticles,
  getRecommendations,
  categorizeRecommendations
} from './recommendationEngine';

describe('Recommendation Engine', () => {
  const mockArticles = [
    {
      slug: 'article-1',
      title: 'Article 1',
      tagList: ['react', 'javascript'],
      favoritesCount: 10,
      bookmarked: true,
      commentsCount: 5,
      createdAt: new Date().toISOString()
    },
    {
      slug: 'article-2',
      title: 'Article 2',
      tagList: ['vue', 'javascript'],
      favoritesCount: 5,
      bookmarked: false,
      commentsCount: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      slug: 'article-3',
      title: 'Article 3',
      tagList: ['angular', 'typescript'],
      favoritesCount: 15,
      bookmarked: false,
      commentsCount: 8,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  describe('calculateEngagementScore', () => {
    it('should calculate engagement score correctly', () => {
      const score = calculateEngagementScore(mockArticles[0]);
      expect(score).toBe(10 * 3 + 1 * 2 + 5 * 1); // 37
    });

    it('should handle missing counts', () => {
      const article = { tagList: [] };
      const score = calculateEngagementScore(article);
      expect(score).toBe(0);
    });
  });

  describe('getTagDiversityScore', () => {
    it('should calculate diversity score', () => {
      const seenTags = new Set(['react']);
      const score = getTagDiversityScore(mockArticles[0], seenTags);
      expect(score).toBe(0.5); // 1 new tag out of 2
    });

    it('should return 1 for all new tags', () => {
      const seenTags = new Set();
      const score = getTagDiversityScore(mockArticles[0], seenTags);
      expect(score).toBe(1);
    });
  });

  describe('scoreArticles', () => {
    it('should score and sort articles', () => {
      const scored = scoreArticles(mockArticles);
      expect(scored.length).toBe(3);
      expect(scored[0].score).toBeGreaterThan(scored[1].score);
    });

    it('should exclude already read articles', () => {
      const readingHistory = [{ slug: 'article-1' }];
      const scored = scoreArticles(mockArticles, readingHistory);
      expect(scored.length).toBe(2);
      expect(scored.every(a => a.slug !== 'article-1')).toBe(true);
    });
  });

  describe('getRecommendations', () => {
    it('should return limited recommendations', () => {
      const recs = getRecommendations(mockArticles, ['react'], [], 2);
      expect(recs.length).toBeLessThanOrEqual(2);
    });

    it('should cache recommendations', () => {
      const recs1 = getRecommendations(mockArticles, ['react'], [], 2);
      const recs2 = getRecommendations(mockArticles, ['react'], [], 2);
      expect(recs1).toBe(recs2); // Same reference (cached)
    });
  });

  describe('categorizeRecommendations', () => {
    it('should categorize articles by type', () => {
      const categorized = categorizeRecommendations(mockArticles);
      expect(categorized).toHaveProperty('trending');
      expect(categorized).toHaveProperty('recent');
      expect(categorized).toHaveProperty('topRated');
    });

    it('should have correct category sizes', () => {
      const categorized = categorizeRecommendations(mockArticles);
      expect(categorized.trending.length).toBeLessThanOrEqual(3);
      expect(categorized.recent.length).toBeLessThanOrEqual(3);
      expect(categorized.topRated.length).toBeLessThanOrEqual(3);
    });
  });
});
