import React, { useState, useEffect } from 'react';

const ReadingProgressBar = ({ estimatedReadTime }) => {
    const [progress, setProgress] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
            setProgress(Math.min(scrollPercentage, 100));

            // Show scroll-to-top button after 20% scroll
            setShowScrollTop(scrollPercentage > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <>
            {/* Progress Bar */}
            <div className="reading-progress-container">
                <div
                    className="reading-progress-bar"
                    style={{ width: `${progress}%` }}
                />

                {estimatedReadTime && (
                    <div className="reading-time-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{estimatedReadTime} min read</span>
                    </div>
                )}
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="scroll-to-top"
                    aria-label="Scroll to top"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
            )}

            <style jsx>{`
        .reading-progress-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(0, 0, 0, 0.05);
          z-index: 999;
        }

        .reading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transition: width 0.1s ease-out;
        }

        .reading-time-badge {
          position: fixed;
          top: 12px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          z-index: 998;
        }

        .reading-time-badge svg {
          flex-shrink: 0;
        }

        .scroll-to-top {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #000;
          color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 998;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.3s ease-out;
        }

        .scroll-to-top:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .scroll-to-top:active {
          transform: translateY(-2px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Dark theme */
        .dark-theme .reading-progress-container {
          background: rgba(255, 255, 255, 0.1);
        }

        .dark-theme .reading-time-badge {
          background: rgba(31, 41, 55, 0.95);
          color: #e5e7eb;
        }

        .dark-theme .scroll-to-top {
          background: #fff;
          color: #000;
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .reading-time-badge {
            top: 64px;
            right: 12px;
            font-size: 12px;
            padding: 4px 10px;
          }

          .scroll-to-top {
            bottom: 80px;
            right: 12px;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
        </>
    );
};

export default ReadingProgressBar;
