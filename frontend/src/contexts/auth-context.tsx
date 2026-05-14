import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  profile_id: string;
  email_verified: boolean;
  applicant_name?: string;
  photo_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ profileId: string }>;
  register: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  setPassword: (email: string, otp: string, password: string) => Promise<{ profileId: string; accessToken: string; refreshToken: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('bpsc-access-token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.data);
      }
    } catch {
      setUser(null);
      localStorage.removeItem('bpsc-access-token');
      localStorage.removeItem('bpsc-refresh-token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('bpsc-access-token', data.data.accessToken);
    localStorage.setItem('bpsc-refresh-token', data.data.refreshToken);
    await refreshUser();
    return { profileId: data.data.profileId };
  };

  const register = async (email: string) => {
    await api.post('/auth/register', { email });
  };

  const verifyOtp = async (email: string, otp: string) => {
    await api.post('/auth/verify-otp', { email, otp });
  };

  const setPasswordFn = async (email: string, otp: string, password: string) => {
    const { data } = await api.post('/auth/set-password', { email, otp, password });
    localStorage.setItem('bpsc-access-token', data.data.accessToken);
    localStorage.setItem('bpsc-refresh-token', data.data.refreshToken);
    await refreshUser();
    return data.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('bpsc-access-token');
    localStorage.removeItem('bpsc-refresh-token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        setPassword: setPasswordFn,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
