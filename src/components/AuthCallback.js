import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import agent from '../agent';

const AuthCallback = ({ history }) => {
    const [status, setStatus] = useState('Processing...');

    useEffect(() => {
        handleCallback();
    }, []);

    const handleCallback = async () => {
        try {
            // Get the session from the URL hash
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session) {
                setStatus('Creating your profile...');

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

                    // Store the token from your backend
                    if (response && response.user) {
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

export default AuthCallback;
