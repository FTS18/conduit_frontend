import React, { useState } from 'react';
import { useSwipeGesture, haptic } from '../utils/haptics';

const SwipeableArticleCard = ({ article, onLike, onBookmark, onDelete, children }) => {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [action, setAction] = useState(null);

    const handleSwipeLeft = () => {
        if (onBookmark) {
            setAction('bookmark');
            setTimeout(() => {
                onBookmark(article.slug);
                setAction(null);
                setSwipeOffset(0);
            }, 300);
        }
    };

    const handleSwipeRight = () => {
        if (onLike) {
            setAction('like');
            setTimeout(() => {
                onLike(article.slug);
                setAction(null);
                setSwipeOffset(0);
            }, 300);
        }
    };

    const swipeGesture = useSwipeGesture(handleSwipeLeft, handleSwipeRight, 80);

    return (
        <div className="swipeable-card-wrapper">
            {/* Background Actions */}
            <div className="swipe-actions">
                <div className="swipe-action swipe-action-left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>Like</span>
                </div>
                <div className="swipe-action swipe-action-right">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Bookmark</span>
                </div>
            </div>

            {/* Card Content */}
            <div
                className={`swipeable-card ${action ? `action-${action}` : ''}`}
                {...swipeGesture}
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: swipeGesture.isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {children}
            </div>

            <style jsx>{`
        .swipeable-card-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        .swipe-actions {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
        }

        .swipe-action {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .swipe-action-left {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .swipe-action-right {
          background: linear-gradient(90deg, #3b82f6, #2563eb);
        }

        .swipeable-card {
          position: relative;
          background: #fff;
          z-index: 1;
          touch-action: pan-y;
        }

        .swipeable-card.action-like .swipe-action-left,
        .swipeable-card.action-bookmark .swipe-action-right {
          opacity: 1;
        }

        /* Dark theme */
        .dark-theme .swipeable-card {
          background: #1f2937;
        }

        @media (min-width: 769px) {
          .swipe-actions {
            display: none;
          }
        }
      `}</style>
        </div>
    );
};

export default SwipeableArticleCard;
