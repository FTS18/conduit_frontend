import React, { useState, useEffect } from 'react';

const A2HSPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        const standalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://');
        setIsStandalone(standalone);

        // Check if iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        setIsIOS(iOS);

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('a2hs-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

        // Show prompt if not standalone, not dismissed recently (7 days), and visited at least once
        const visitCount = parseInt(localStorage.getItem('visit-count') || '0');
        localStorage.setItem('visit-count', (visitCount + 1).toString());

        if (!standalone && daysSinceDismissed > 7 && visitCount > 2) {
            if (iOS) {
                setShowPrompt(true);
            }
        }

        // Listen for the beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            if (daysSinceDismissed > 7 && visitCount > 2) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Listen for successful installation
        window.addEventListener('appinstalled', () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            localStorage.removeItem('a2hs-dismissed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('a2hs-dismissed', Date.now().toString());
    };

    if (isStandalone || !showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: isIOS ? '80px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '400px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            padding: '20px',
            zIndex: 10000,
            animation: 'slideUp 0.3s ease-out',
            border: '1px solid #e1e4e8'
        }}>
            <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>

            <button
                onClick={handleDismiss}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    color: '#666',
                    cursor: 'pointer',
                    padding: '4px',
                    lineHeight: 1
                }}
                aria-label="Dismiss"
            >
                ×
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>

                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#000'
                    }}>
                        Install Conduit
                    </h3>
                    <p style={{
                        margin: '0 0 16px 0',
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.5'
                    }}>
                        {isIOS
                            ? 'Add to your home screen for a better experience. Tap the share button and select "Add to Home Screen".'
                            : 'Install our app for quick access, offline reading, and a native experience.'
                        }
                    </p>

                    {!isIOS && deferredPrompt && (
                        <button
                            onClick={handleInstallClick}
                            style={{
                                width: '100%',
                                padding: '12px 24px',
                                background: '#000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#333'}
                            onMouseLeave={(e) => e.target.style.background = '#000'}
                        >
                            Install App
                        </button>
                    )}

                    {isIOS && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px',
                            background: '#f6f8fa',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#666'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                <line x1="12" y1="18" x2="12" y2="18" />
                            </svg>
                            <span>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default A2HSPrompt;
