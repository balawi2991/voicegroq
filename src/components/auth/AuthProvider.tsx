'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, users, botConfigs, User } from '@/lib/db';

interface AuthUser extends User {
  agentId?: string;
  fullName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user?: AuthUser; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user?: AuthUser; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // جلب المستخدم الحالي من localStorage
    const getUser = async () => {
      try {
        // التحقق من توفر localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedUser = localStorage.getItem('currentUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.warn('localStorage access denied or unavailable:', err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signin',
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { error: result.error || 'فشل في تسجيل الدخول' };
      }

      // تحويل بيانات المستخدم
      const authUser: AuthUser = {
        ...result.user,
        agentId: result.user.agent_id,
        fullName: result.user.name,
      };

      setUser(authUser);
      
      // حفظ بيانات المستخدم في localStorage مع معالجة الأخطاء
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(authUser));
        }
      } catch (storageErr: any) {
        console.warn('Failed to save user data to localStorage:', storageErr.message);
      }

      return { user: authUser };
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في تسجيل الدخول';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          name,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { error: result.error || 'فشل في إنشاء الحساب' };
      }

      // تحويل بيانات المستخدم
      const authUser: AuthUser = {
        ...result.user,
        agentId: result.user.agent_id,
        fullName: result.user.name,
      };

      setUser(authUser);
      
      // حفظ بيانات المستخدم في localStorage مع معالجة الأخطاء
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('currentUser', JSON.stringify(authUser));
        }
      } catch (storageErr: any) {
        console.warn('Failed to save user data to localStorage:', storageErr.message);
      }

      return { user: authUser };
    } catch (err: any) {
      const errorMessage = err.message || 'فشل في إنشاء الحساب';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      
      // إزالة بيانات المستخدم من localStorage مع معالجة الأخطاء
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('currentUser');
        }
      } catch (storageErr: any) {
        console.warn('Failed to remove user data from localStorage:', storageErr.message);
      }
      
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
