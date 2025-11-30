import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type, // 'success', 'error', 'warning', 'info'
            duration: options.duration || 3000,
            action: options.action,
            onUndo: options.onUndo,
            ...options
        };

        setToasts(prev => [...prev, toast]);

        if (toast.duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, options) => addToast(message, 'success', options), [addToast]);
    const error = useCallback((message, options) => addToast(message, 'error', options), [addToast]);
    const warning = useCallback((message, options) => addToast(message, 'warning', options), [addToast]);
    const info = useCallback((message, options) => addToast(message, 'info', options), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '400px',
            width: 'calc(100% - 40px)'
        }}>
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};

const Toast = ({ toast, onClose }) => {
    const colors = {
        success: { bg: '#10b981', icon: '✓' },
        error: { bg: '#ef4444', icon: '✕' },
        warning: { bg: '#f59e0b', icon: '⚠' },
        info: { bg: '#3b82f6', icon: 'ℹ' }
    };

    const { bg, icon } = colors[toast.type] || colors.info;

    return (
        <div style={{
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'slideInRight 0.3s ease-out',
            border: '1px solid #e5e7eb'
        }}>
            <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: bg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0
            }}>
                {icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#111827',
                    lineHeight: '1.5',
                    wordBreak: 'break-word'
                }}>
                    {toast.message}
                </p>

                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action.onClick();
                            onClose();
                        }}
                        style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f9fafb';
                            e.target.style.borderColor = '#d1d5db';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.borderColor = '#e5e7eb';
                        }}
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={onClose}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0',
                    lineHeight: 1,
                    flexShrink: 0
                }}
                aria-label="Close"
            >
                ×
            </button>
        </div>
    );
};
