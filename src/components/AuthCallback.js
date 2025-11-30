import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import agent from '../agent';
import { connect } from 'react-redux';
import { LOGIN } from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
    onLogin: payload => dispatch({ type: LOGIN, payload })
});

const AuthCallback = ({ history, onLogin }) => {
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            console.log('AuthCallback: Starting callback handling...');
            // First try to get the session normally
            let { data: { session }, error } = await supabase.auth.getSession();
            console.log('AuthCallback: Initial session check:', { session, error });

            // If no session and we have a hash with access_token, try to parse it manually
            // This handles the case where HashRouter adds a '/' prefix (e.g. #/access_token=...)
            if (!session && window.location.hash && window.location.hash.includes('access_token')) {
                console.log('AuthCallback: Attempting manual hash parsing...');
                const hash = window.location.hash.substring(1); // Remove #
                // If it starts with /, remove it
                const paramsStr = hash.startsWith('/') ? hash.substring(1) : hash;
                const params = new URLSearchParams(paramsStr);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');

                if (access_token && refresh_token) {
                    console.log('AuthCallback: Found tokens in hash, setting session...');
                    const { data, error: setSessionError } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });
                    if (!setSessionError && data.session) {
                        session = data.session;
                        console.log('AuthCallback: Session successfully set from hash');
                    } else {
                        console.error('AuthCallback: Failed to set session from hash:', setSessionError);
                    }
                }
            }

            if (error) throw error;

            if (session) {
                setStatus('Creating your profile...');
                console.log('AuthCallback: Session found, syncing with backend...', session.user);

                // Get user info from Supabase
                const { user } = session;

                // Create or update user in your backend
                try {
                    // Try to create user profile in your backend
                    const response = await agent.Auth.supabaseLogin({
                        email: user.email,
                        username: user.user_metadata?.full_name?.replace(/\s+/g, '_').toLowerCase() || user.email.split('@')[0],
                        image: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
                        supabaseId: user.id
                    });

                    console.log('AuthCallback: Backend sync response:', response);

                    // Store the token from your backend
                    if (response && response.user) {
                        onLogin(response);
                        setStatus('Success! Redirecting...');
                        setTimeout(() => {
                            history.push('/');
                        }, 1000);
                    }
                } catch (err) {
                    console.error('Backend sync error:', err);
                    // Even if backend sync fails, redirect to home
                    // The backend integration will be completed later
                    setStatus('Logged in! Redirecting...');
                    setTimeout(() => {
                        history.push('/');
                    }, 1000);
                }
            } else {
                console.log('AuthCallback: No session found after all attempts');
                setStatus('No session found. Redirecting to login...');
                setTimeout(() => {
                    history.push('/login');
                }, 2000);
            }
        } catch (error) {
            console.error('Auth callback error:', error);
            setStatus('Authentication failed. Redirecting to login...');
            setTimeout(() => {
                history.push('/login');
            }, 2000);
        }
    };

    return (
        <div className="auth-callback-page">
            <div className="callback-container">
                <div className="spinner"></div>
                <h2>{status}</h2>
            </div>

            <style>{`
        .auth-callback-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--bg-body);
        }

        .callback-container {
          text-align: center;
          padding: 2rem;
        }

        .callback-container h2 {
          color: var(--text-main);
          margin-top: 1.5rem;
          font-size: 1.25rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default connect(null, mapDispatchToProps)(AuthCallback);
