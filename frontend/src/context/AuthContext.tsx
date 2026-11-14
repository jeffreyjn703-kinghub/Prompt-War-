import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken } from '../api/client';
import { Profile } from '../types';

interface AuthContextType {
  token: string | null;
  profile: Profile | null;
  isLoading: boolean;
  loginDemo: (learner?: 'demo' | 'alex') => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.warn('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const existingToken = getAuthToken();
      if (existingToken) {
        setToken(existingToken);
        await refreshProfile();
      } else {
        // Automatically pre-load demo learner session so app works seamlessly immediately
        try {
          const res = await api.demoLogin('demo');
          setAuthToken(res.access_token);
          setToken(res.access_token);
          await refreshProfile();
        } catch (err) {
          console.warn('Auto demo login skipped:', err);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginDemo = async (learner: 'demo' | 'alex' = 'demo') => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(learner);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      await refreshProfile();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        isLoading,
        loginDemo,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
