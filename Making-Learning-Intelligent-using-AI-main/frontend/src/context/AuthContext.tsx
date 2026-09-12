import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'mentor';
  learning_style?: string;
  grade_level?: string;
  department?: string;
  specialization?: string;
  expertise?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: string) => Promise<void>;
  registerStudent: (data: any) => Promise<void>;
  registerTeacher: (data: any) => Promise<void>;
  logout: () => void;
  quickSwitchUser: (preset: 'arun' | 'priya' | 'teacher' | 'mentor') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('learniq_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('learniq_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('learniq_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('learniq_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('learniq_token');
          localStorage.removeItem('learniq_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password, role });
      const { access_token, user_id, full_name, role: userRole } = res.data;
      
      localStorage.setItem('learniq_token', access_token);
      setToken(access_token);

      // Fetch full details
      const meRes = await authApi.getMe();
      const userData = meRes.data;
      setUser(userData);
      localStorage.setItem('learniq_user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (data: any) => {
    await authApi.registerStudent(data);
    await login(data.email, data.password, 'student');
  };

  const registerTeacher = async (data: any) => {
    await authApi.registerTeacher(data);
    await login(data.email, data.password, 'teacher');
  };

  const logout = () => {
    localStorage.removeItem('learniq_token');
    localStorage.removeItem('learniq_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const quickSwitchUser = async (preset: 'arun' | 'priya' | 'teacher' | 'mentor') => {
    const credentials = {
      arun: { email: 'arun@learniq.com', pwd: 'password123', role: 'student' },
      priya: { email: 'priya@learniq.com', pwd: 'password123', role: 'student' },
      teacher: { email: 'sarah@learniq.com', pwd: 'password123', role: 'teacher' },
      mentor: { email: 'rahul.mentor@learniq.com', pwd: 'password123', role: 'mentor' },
    }[preset];

    await login(credentials.email, credentials.pwd, credentials.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        registerStudent,
        registerTeacher,
        logout,
        quickSwitchUser,
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
