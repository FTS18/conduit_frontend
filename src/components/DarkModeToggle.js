import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return saved ? saved === 'dark' : prefersDark;
    });

    useEffect(() => {
        // Apply theme
        if (isDark) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (!localStorage.getItem('theme')) {
                setIsDark(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);

        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="dark-mode-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="toggle-track">
                <div className="toggle-thumb">
                    {isDark ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    )}
                </div>
            </div>

            <style jsx>{`
        .dark-mode-toggle {
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-track {
          width: 48px;
          height: 24px;
          background: ${isDark ? '#374151' : '#e5e7eb'};
          border-radius: 12px;
          position: relative;
          transition: background 0.3s ease;
        }

        .toggle-thumb {
          width: 20px;
          height: 20px;
          background: ${isDark ? '#1f2937' : '#ffffff'};
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: ${isDark ? '26px' : '2px'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${isDark ? '#fbbf24' : '#f59e0b'};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dark-mode-toggle:hover .toggle-track {
          background: ${isDark ? '#4b5563' : '#d1d5db'};
        }

        .dark-mode-toggle:active .toggle-thumb {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .toggle-track {
            width: 44px;
            height: 22px;
          }
          
          .toggle-thumb {
            width: 18px;
            height: 18px;
            left: ${isDark ? '24px' : '2px'};
          }
        }
      `}</style>
        </button>
    );
};

export default DarkModeToggle;
