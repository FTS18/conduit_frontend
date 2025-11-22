const HISTORY_KEY = 'reading_history';
const MAX_HISTORY = 50;

export const addToHistory = (article) => {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const filtered = history.filter(a => a.slug !== article.slug);
  const updated = [{ slug: article.slug, tags: article.tagList, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const getReadingHistory = () => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
};

export const getTopTags = () => {
  const history = getReadingHistory();
  const tagCount = {};
  history.forEach(item => {
    item.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);
};
