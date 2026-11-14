import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken, clearAuthToken, removeActiveSession } from '../api/client';
import { Profile } from '../types';

interface AuthContextType {
  token: string | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, force?: boolean) => Promise<{ success: boolean; error?: string; isAlreadyInUse?: boolean }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; isAlreadyInUse?: boolean }>;
  loginDemo: (learner?: 'demo' | 'alex') => Promise<void>;
  logout: () => void;
  releaseSession: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
  analyzeProfile: () => Promise<{ status: string; readiness_pct: number; message: string }>;
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

  const login = async (
    email: string,
    password: string,
    force: boolean = false
  ): Promise<{ success: boolean; error?: string; isAlreadyInUse?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, force);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      await refreshProfile();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || 'Login failed. Please check your credentials.';
      const isAlreadyInUse =
        err?.status === 409 ||
        err?.code === 'EMAIL_ALREADY_IN_USE' ||
        errorMsg.toLowerCase().includes('already in use');
      return { success: false, error: errorMsg, isAlreadyInUse };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string; isAlreadyInUse?: boolean }> => {
    setIsLoading(true);
    try {
      const res = await api.register(email, password, fullName);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      await refreshProfile();
      return { success: true };
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || 'Registration failed. Please try again.';
      const isAlreadyInUse =
        err?.status === 400 ||
        err?.code === 'EMAIL_ALREADY_IN_USE' ||
        errorMsg.toLowerCase().includes('already in use') ||
        errorMsg.toLowerCase().includes('already registered');
      return { success: false, error: errorMsg, isAlreadyInUse };
    } finally {
      setIsLoading(false);
    }
  };

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
    if (profile?.email) {
      api.logout(profile.email).catch(() => {});
      removeActiveSession(profile.email);
    }
    clearAuthToken();
    setToken(null);
    setProfile(null);
  };

  const releaseSession = async (email: string) => {
    try {
      await api.releaseSession(email);
      removeActiveSession(email);
    } catch (_) {}
  };

  const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
    const updated = await api.updateProfile(data);
    setProfile(updated);
    return updated;
  };

  const analyzeProfile = async () => {
    const res = await api.analyzeProfile();
    await refreshProfile();
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        profile,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        loginDemo,
        logout,
        releaseSession,
        updateProfile,
        analyzeProfile,
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
