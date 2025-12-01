import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import robustAuthManager from './utils/robustAuthManager';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionStatus, setSessionStatus] = useState('active');
    const [sessionWarning, setSessionWarning] = useState(null);

    useEffect(() => {
        // Initialize robust auth manager
        robustAuthManager.initialize();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            if (session?.access_token) {
                robustAuthManager.handleLoginSuccess(session.access_token);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            if (session?.access_token) {
                robustAuthManager.handleLoginSuccess(session.access_token);
            }
        });

        // Subscribe to auth manager events
        const unsubscribe = robustAuthManager.subscribe((event, data) => {
            switch (event) {
                case 'session_warning':
                    setSessionWarning(data.message);
                    setSessionStatus('warning');
                    break;
                case 'session_expired':
                    setSessionStatus('expired');
                    setSessionWarning(data.message);
                    setUser(null);
                    setSession(null);
                    signOut();
                    break;
                case 'session_extended':
                    setSessionStatus('active');
                    setSessionWarning(null);
                    break;
                case 'logout':
                    setSessionStatus('inactive');
                    break;
                default:
                    break;
            }
        });

        return () => {
            subscription.unsubscribe();
            unsubscribe();
            robustAuthManager.destroy();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            robustAuthManager.handleLogout();
            setUser(null);
            setSession(null);
            setSessionStatus('inactive');
        } catch (error) {
            console.error('[AUTH] Sign out error:', error);
        }
    };

    const extendSession = () => {
        const extended = robustAuthManager.extendSession();
        if (extended) {
            setSessionWarning(null);
            setSessionStatus('active');
        }
    };

    const value = {
        session,
        user,
        loading,
        sessionStatus,
        sessionWarning,
        signOut,
        extendSession,
        getSessionInfo: () => robustAuthManager.getSessionInfo(),
        validateSession: () => robustAuthManager.validateSession()
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
