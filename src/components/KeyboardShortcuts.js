import React, { useEffect, useState, createContext, useContext } from 'react';

const KeyboardShortcutsContext = createContext();

export const useKeyboardShortcuts = () => useContext(KeyboardShortcutsContext);

export const KeyboardShortcutsProvider = ({ children }) => {
    const [showHelp, setShowHelp] = useState(false);
    const [shortcuts, setShortcuts] = useState({});

    const registerShortcut = (key, callback, description) => {
        setShortcuts(prev => ({
            ...prev,
            [key]: { callback, description }
        }));
    };

    const unregisterShortcut = (key) => {
        setShortcuts(prev => {
            const newShortcuts = { ...prev };
            delete newShortcuts[key];
            return newShortcuts;
        });
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Allow Escape to close
                if (e.key === 'Escape') {
                    e.target.blur();
                }
                return;
            }

            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;

            // Show help modal
            if (key === '?' && !ctrl) {
                e.preventDefault();
                setShowHelp(true);
                return;
            }

            // Close help modal
            if (key === 'escape') {
                setShowHelp(false);
                return;
            }

            // Execute registered shortcuts
            const shortcutKey = ctrl ? `ctrl+${key}` : key;
            if (shortcuts[shortcutKey]) {
                e.preventDefault();
                shortcuts[shortcutKey].callback(e);

                // Haptic feedback
                if ('vibrate' in navigator) {
                    navigator.vibrate(5);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);

    return (
        <KeyboardShortcutsContext.Provider value={{ registerShortcut, unregisterShortcut }}>
            {children}
            {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} shortcuts={shortcuts} />}
        </KeyboardShortcutsContext.Provider>
    );
};

const KeyboardShortcutsHelp = ({ onClose, shortcuts }) => {
    const defaultShortcuts = {
        '?': { description: 'Show keyboard shortcuts' },
        'j': { description: 'Next article' },
        'k': { description: 'Previous article' },
        'l': { description: 'Like current article' },
        'b': { description: 'Bookmark current article' },
        '/': { description: 'Focus search' },
        'n': { description: 'New article' },
        'g h': { description: 'Go to home' },
        'g p': { description: 'Go to profile' },
        'g n': { description: 'Go to notifications' },
        'ctrl+k': { description: 'Quick search' },
        'esc': { description: 'Close modals / Blur input' },
    };

    const allShortcuts = { ...defaultShortcuts, ...shortcuts };

    return (
        <div className="shortcuts-overlay" onClick={onClose}>
            <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="shortcuts-grid">
                    {Object.entries(allShortcuts).map(([key, { description }]) => (
                        <div key={key} className="shortcut-item">
                            <kbd className="shortcut-key">{key.toUpperCase()}</kbd>
                            <span className="shortcut-desc">{description}</span>
                        </div>
                    ))}
                </div>

                <div className="shortcuts-footer">
                    <p>Press <kbd>?</kbd> anytime to see this help</p>
                </div>
            </div>

            <style jsx>{`
        .shortcuts-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
          animation: fadeIn 0.2s ease-out;
          padding: 20px;
        }

        .shortcuts-modal {
          background: #fff;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shortcuts-header {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .shortcuts-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #374151;
        }

        .shortcuts-grid {
          padding: 24px;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 16px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .shortcut-key {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 4px 8px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          min-width: 32px;
          text-align: center;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .shortcut-desc {
          font-size: 14px;
          color: #6b7280;
        }

        .shortcuts-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          text-align: center;
        }

        .shortcuts-footer p {
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        }

        .shortcuts-footer kbd {
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
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
        .dark-theme .shortcuts-modal {
          background: #1f2937;
        }

        .dark-theme .shortcuts-header {
          border-color: #374151;
        }

        .dark-theme .shortcuts-header h2 {
          color: #f9fafb;
        }

        .dark-theme .close-btn {
          color: #6b7280;
        }

        .dark-theme .close-btn:hover {
          color: #9ca3af;
        }

        .dark-theme .shortcut-key {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }

        .dark-theme .shortcut-desc {
          color: #9ca3af;
        }

        .dark-theme .shortcuts-footer {
          background: #111827;
          border-color: #374151;
        }

        .dark-theme .shortcuts-footer p {
          color: #9ca3af;
        }

        .dark-theme .shortcuts-footer kbd {
          background: #374151;
          border-color: #4b5563;
          color: #e5e7eb;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .shortcuts-modal {
            max-height: 90vh;
          }

          .shortcuts-grid {
            grid-template-columns: 1fr;
          }

          .shortcuts-header h2 {
            font-size: 20px;
          }
        }
      `}</style>
        </div>
    );
};

export default KeyboardShortcutsProvider;
