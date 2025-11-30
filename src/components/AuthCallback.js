import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import agent from '../agent';
import { connect } from 'react-redux';
import { LOGIN } from '../constants/actionTypes';

const mapDispatchToProps = dispatch => ({
  onLogin: (user) => dispatch({ type: LOGIN, payload: Promise.resolve({ user }) })
});

const AuthCallback = ({ onLogin }) => {
  const history = useHistory();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) {
          history.push('/login');
          return;
        }

        const supabaseUser = session.user;
        
        const response = await fetch(`${agent.API_ROOT}/auth/supabase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: supabaseUser })
        });

        if (!response.ok) throw new Error('Failed to sync user');
        
        const { user } = await response.json();
        
        window.localStorage.setItem('jwt', user.token);
        agent.setToken(user.token);
        onLogin(user);
        
        history.push('/');
      } catch (error) {
        console.error('Auth callback error:', error);
        history.push('/login');
      }
    };

    handleCallback();
  }, [history, onLogin]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Signing you in...</p>
    </div>
  );
};

export default connect(null, mapDispatchToProps)(AuthCallback);
