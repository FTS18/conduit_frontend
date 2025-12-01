/**
 * Offline Article Draft Manager
 * Saves articles to localStorage so they're not lost on page refresh
 */

const DRAFT_KEY = 'article_drafts';
const DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Save article draft to localStorage
 */
export const saveDraft = (article) => {
  const drafts = getDrafts();
  
  const draft = {
    id: article.id || `draft_${Date.now()}_${Math.random()}`,
    title: article.title || '',
    description: article.description || '',
    body: article.body || '',
    tagList: article.tagList || [],
    createdAt: article.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  drafts[draft.id] = draft;
  
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    console.info('[DRAFT] Article draft saved:', draft.id);
  } catch (e) {
    console.error('[DRAFT] Failed to save draft:', e);
  }

  return draft;
};

/**
 * Get all article drafts
 */
export const getDrafts = () => {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (!stored) return {};

    const drafts = JSON.parse(stored);
    const now = Date.now();

    // Remove expired drafts (older than 7 days)
    Object.keys(drafts).forEach(key => {
      if (now - drafts[key].updatedAt > DRAFT_EXPIRY) {
        delete drafts[key];
      }
    });

    // Save cleaned up drafts
    if (Object.keys(drafts).length !== Object.keys(JSON.parse(stored)).length) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    }

    return drafts;
  } catch (e) {
    console.error('[DRAFT] Failed to read drafts:', e);
    return {};
  }
};

/**
 * Get specific draft
 */
export const getDraft = (id) => {
  const drafts = getDrafts();
  return drafts[id] || null;
};

/**
 * Delete draft
 */
export const deleteDraft = (id) => {
  const drafts = getDrafts();
  delete drafts[id];

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    console.info('[DRAFT] Draft deleted:', id);
  } catch (e) {
    console.error('[DRAFT] Failed to delete draft:', e);
  }
};

/**
 * Clear all drafts
 */
export const clearAllDrafts = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
    console.info('[DRAFT] All drafts cleared');
  } catch (e) {
    console.error('[DRAFT] Failed to clear drafts:', e);
  }
};

/**
 * Convert draft to article payload
 */
export const draftToArticle = (draft) => ({
  title: draft.title,
  description: draft.description,
  body: draft.body,
  tagList: draft.tagList,
});

/**
 * Auto-save draft on interval (every 30 seconds)
 */
export const setupAutoSave = (getCurrentArticle, interval = 30000) => {
  const intervalId = setInterval(() => {
    const article = getCurrentArticle();
    if (article.title || article.body || article.description) {
      saveDraft(article);
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};
