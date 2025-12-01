import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import agent from '../agent';
import { connect } from 'react-redux';
import robustAuthManager from '../utils/robustAuthManager';
import { setTokenWithExpiry } from '../utils/authSecurity';
import { LOGIN } from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
    onLogin: payload => dispatch({ type: LOGIN, payload })
});

const AuthCallback = ({ history, onLogin }) => {
    const [status, setStatus] = useState('Processing...');
    const [error, setError] = useState(null);

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            console.log('[OAUTH_CALLBACK] Starting callback handling...');
            
            // Get the session after OAuth redirect
            let { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('[OAUTH_CALLBACK] Initial session check:', { session, error: sessionError });

            // Fallback: manually parse hash if needed (for HashRouter compatibility)
            if (!session && window.location.hash && window.location.hash.includes('access_token')) {
                console.log('[OAUTH_CALLBACK] Attempting manual hash parsing...');
                const hash = window.location.hash.substring(1);
                const paramsStr = hash.startsWith('/') ? hash.substring(1) : hash;
                const params = new URLSearchParams(paramsStr);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                    console.log('[OAUTH_CALLBACK] Found tokens in hash, setting session...');
                    const { data, error: setSessionError } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });
                    
                    if (!setSessionError && data.session) {
                        session = data.session;
                        console.log('[OAUTH_CALLBACK] Session successfully set from hash');
                    } else {
                        console.error('[OAUTH_CALLBACK] Failed to set session from hash:', setSessionError);
                    }
                }
            }

            if (sessionError) {
                console.error('[OAUTH_CALLBACK] Session error:', sessionError);
                throw sessionError;
            }

            if (!session) {
                console.warn('[OAUTH_CALLBACK] No session found');
                setStatus('No session found. Redirecting to login...');
                setError('OAuth session not found');
                setTimeout(() => {
                    history.push('/login');
                }, 2000);
                return;
            }

            setStatus('Creating your profile...');
            console.log('[OAUTH_CALLBACK] Session found, syncing with backend...', session.user);

            const { user } = session;

            // Validate user data
            if (!user || !user.email) {
                throw new Error('OAuth user data incomplete');
            }

            try {
                // Create or update user in backend
                const username = user.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() 
                  || user.email.split('@')[0];
                
                const response = await agent.Auth.supabaseLogin({
                    email: user.email,
                    username: username,
                    image: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
                    supabaseId: user.id
                });

                console.log('[OAUTH_CALLBACK] Backend sync successful:', response);

                // Store token with expiry
                if (session.access_token) {
                    setTokenWithExpiry(session.access_token, session.expires_in * 1000);
                    robustAuthManager.handleLoginSuccess(session.access_token, session.expires_in);
                }

                // Dispatch login action
                if (response && response.user) {
                    onLogin(response);
                    setStatus('Success! Redirecting...');
                    setTimeout(() => {
                        history.push('/');
                    }, 500);
                } else {
                    throw new Error('Invalid login response');
                }
            } catch (backendError) {
                console.error('[OAUTH_CALLBACK] Backend sync error:', backendError);
                
                // Still redirect even if backend sync fails
                // User can try manual login or account linking
                setStatus('Session created. Redirecting...');
                setTimeout(() => {
                    history.push('/');
                }, 1000);
            }
        } catch (error) {
            console.error('[OAUTH_CALLBACK] Callback error:', error);
            setStatus('Authentication failed. Redirecting...');
            setError(error.message || 'An error occurred during authentication');
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-body)',
            color: 'var(--text-main)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid var(--border-color)',
                        borderTop: '4px solid var(--primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                </div>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>{status}</h2>
                {error && (
                    <p style={{ color: '#dc3545', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                        {error}
                    </p>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default connect(null, mapDispatchToProps)(AuthCallback);
