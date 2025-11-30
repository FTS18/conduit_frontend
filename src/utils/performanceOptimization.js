// Performance optimization utilities

// Simple memoization decorator
export const memoize = (fn, options = {}) => {
  const cache = new Map();
  const { maxSize = 100, ttl = 5 * 60 * 1000 } = options;
  const timestamps = new Map();

  return (...args) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const timestamp = timestamps.get(key);

    // Check if cached value is still valid
    if (cached && timestamp && Date.now() - timestamp < ttl) {
      return cached;
    }

    // Remove expired entry
    if (cached && timestamp && Date.now() - timestamp >= ttl) {
      cache.delete(key);
      timestamps.delete(key);
    }

    // Enforce max cache size
    if (cache.size >= maxSize) {
      const oldestKey = Array.from(timestamps.entries())
        .sort(([, a], [, b]) => a - b)[0][0];
      cache.delete(oldestKey);
      timestamps.delete(oldestKey);
    }

    const result = fn(...args);
    cache.set(key, result);
    timestamps.set(key, Date.now());
    return result;
  };
};

// Debounce function calls
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Throttle function calls
export const throttle = (fn, limit = 1000) => {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy load images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Pagination cache
class PaginationCache {
  constructor(maxPages = 10) {
    this.cache = new Map();
    this.maxPages = maxPages;
  }

  set(key, page, data) {
    if (!this.cache.has(key)) {
      this.cache.set(key, new Map());
    }
    
    const pageCache = this.cache.get(key);
    if (pageCache.size >= this.maxPages) {
      const firstKey = pageCache.keys().next().value;
      pageCache.delete(firstKey);
    }
    
    pageCache.set(page, data);
  }

  get(key, page) {
    return this.cache.get(key)?.get(page);
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const paginationCache = new PaginationCache();

// Virtual scrolling helper
export const createVirtualScroller = (items, itemHeight, containerHeight) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  return {
    getVisibleItems: (scrollTop) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
      return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        offsetY: startIndex * itemHeight,
      };
    },
  };
};

// Request animation frame wrapper
export const requestFrame = (callback) => {
  return requestAnimationFrame(callback);
};

// Cancel animation frame
export const cancelFrame = (id) => {
  cancelAnimationFrame(id);
};

// Measure performance
export const measurePerformance = (label, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

// Async performance measurement
export const measureAsyncPerformance = async (label, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

// Memory-efficient array operations
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Efficient filtering with early exit
export const findFirst = (array, predicate) => {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return null;
};

// Efficient deduplication
export const deduplicate = (array, key = null) => {
  if (key) {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(array)];
};
