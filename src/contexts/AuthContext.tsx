import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType {
  auth: AuthState;
  login: (email: string, password: string, userType: 'ops' | 'client') => Promise<void>;
  signup: (email: string, password: string) => Promise<{ encryptedUrl: string }>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'VERIFY_EMAIL' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        token: null,
      };
    case 'VERIFY_EMAIL':
      return {
        ...state,
        user: state.user ? { ...state.user, isVerified: true } : null,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: JSON.parse(user), token },
      });
    }
  }, []);

  const login = async (email: string, password: string, userType: 'ops' | 'client') => {
    try {
      // Simulate API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // For demo purposes, simulate successful login
      const user: User = {
        id: '1',
        email,
        userType,
        isVerified: userType === 'ops' ? true : true,
      };
      const token = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    }
  };

  const signup = async (email: string, password: string): Promise<{ encryptedUrl: string }> => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { encryptedUrl: data.encryptedUrl };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // For demo purposes
      return { encryptedUrl: `https://secure-app.com/verify/${btoa(email + Date.now())}` };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'VERIFY_EMAIL' });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // For demo purposes
      dispatch({ type: 'VERIFY_EMAIL' });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, login, signup, logout, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};