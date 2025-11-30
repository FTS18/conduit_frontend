// Haptic Feedback Utility
export const haptic = {
    // Light tap (selection, button press)
    light: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    },

    // Medium impact (toggle, swipe action)
    medium: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(20);
        }
    },

    // Heavy impact (important action, error)
    heavy: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(30);
        }
    },

    // Success pattern
    success: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 50, 10]);
        }
    },

    // Error pattern
    error: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
    },

    // Notification pattern
    notification: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate([10, 100, 10, 100, 10]);
        }
    },

    // Selection change (scrolling through list)
    selection: () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(5);
        }
    }
};

// Gesture Support Hook
import { useEffect, useRef, useState } from 'react';

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const [isSwiping, setIsSwiping] = useState(false);

    const minSwipeDistance = threshold;

    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
        setIsSwiping(true);
    };

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) {
            setIsSwiping(false);
            return;
        }

        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            haptic.medium();
            onSwipeLeft?.();
        } else if (isRightSwipe) {
            haptic.medium();
            onSwipeRight?.();
        }

        setIsSwiping(false);
    };

    return {
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        isSwiping
    };
};

export const useLongPress = (callback, ms = 500) => {
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const start = (e) => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            haptic.medium();
            callback(e);
        }, ms);
    };

    const clear = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    const click = (e) => {
        if (isLongPress.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return {
        onMouseDown: start,
        onTouchStart: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchEnd: clear,
        onClick: click
    };
};

// Pinch to Zoom Hook
export const usePinchZoom = (minScale = 1, maxScale = 3) => {
    const [scale, setScale] = useState(1);
    const lastDistance = useRef(null);

    const getDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e) => {
        if (e.touches.length === 2) {
            lastDistance.current = getDistance(e.touches);
        }
    };

    const onTouchMove = (e) => {
        if (e.touches.length === 2 && lastDistance.current) {
            const currentDistance = getDistance(e.touches);
            const delta = currentDistance / lastDistance.current;

            setScale(prevScale => {
                const newScale = prevScale * delta;
                return Math.min(Math.max(newScale, minScale), maxScale);
            });

            lastDistance.current = currentDistance;

            // Light haptic feedback during pinch
            if (Math.abs(delta - 1) > 0.1) {
                haptic.selection();
            }
        }
    };

    const onTouchEnd = () => {
        lastDistance.current = null;
    };

    const reset = () => {
        setScale(1);
        haptic.light();
    };

    return {
        scale,
        reset,
        handlers: {
            onTouchStart,
            onTouchMove,
            onTouchEnd
        }
    };
};

export default haptic;
