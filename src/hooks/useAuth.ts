'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/db';

interface AuthUser extends User {
  agentId?: string;
  fullName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب المستخدم الحالي من localStorage أو session
    const getUser = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        setError(err.message);
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
        throw new Error(result.error || 'فشل في تسجيل الدخول');
      }
      
      const authUser: AuthUser = {
        ...result.user,
        agentId: result.user.agent_id,
        fullName: result.user.name,
      };

      setUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      
      return { user: authUser, error: null };
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
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
          name: fullName,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل في إنشاء الحساب');
      }

      const authUser: AuthUser = {
        ...result.user,
        agentId: result.user.agent_id,
        fullName: result.user.name,
      };

      setUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      
      return { user: authUser, error: null };
    } catch (err: any) {
      setError(err.message);
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      localStorage.removeItem('currentUser');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { fullName?: string; email?: string }) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const response = await fetch('/api/auth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          updates: {
            name: updates.fullName,
            email: updates.email,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل في تحديث الملف الشخصي');
      }

      // تحديث الحالة المحلية
      const authUser: AuthUser = {
        ...result.user,
        agentId: result.user.agent_id,
        fullName: result.user.name,
      };

      setUser(authUser);
      localStorage.setItem('currentUser', JSON.stringify(authUser));

    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
}
