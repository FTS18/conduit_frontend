// Optimized utilities index for tree-shaking
// Only import what you need - this helps bundlers remove unused code

// Auth utilities
export { validateEmail, validatePassword, validateUsername, validatePasswordStrength } from './authValidation';
export { generateCSRFToken, validateCSRFToken, checkRateLimit, getDeviceFingerprint, sanitizeInput } from './authSecurity';
export { parseAuthError, getRecoverySuggestion, logAuthError, getRecentAuthErrors } from './robustAuthErrors';
export { handleGoogleOAuthLogin, handleOAuthCallback, verifyOAuthSession } from './oauthHelper';

// Session management
export { robustAuthManager } from './robustAuthManager';

// Account operations
export { linkAccounts, mergeAccounts, transferContent, validateMergeReady } from './accountLinking';
export { getAccountsForMerge, verifyOwnership, performMerge } from './accountMerging';

// Content utilities
export { addToHistory, getReadingHistory, getTopTags } from './readingHistory';
export { calculateEngagementScore, getTagDiversityScore, scoreArticles, getRecommendations, categorizeRecommendations, clearRecommendationCache } from './recommendationEngine';

// Performance utilities - use as needed
export { memoize, debounce, throttle, lazyLoadImages, measurePerformance, measureAsyncPerformance, chunkArray, findFirst, deduplicate, PaginationCache } from './performanceOptimization';

// Notifications
export { notificationHelper } from './notificationHelper';

// Error handling
export { errorHandler } from './errorHandler';

// Session management (alternative)
export { sessionManager } from './sessionManager';

// Haptics
export { triggerHaptic, haptics } from './haptics';
