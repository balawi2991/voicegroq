'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthUser extends User {
  agentId?: string;
  fullName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // جلب المستخدم الحالي
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }

        if (user) {
          // جلب بيانات المستخدم من قاعدة البيانات
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (userError && userError.code === 'PGRST116') {
            // إنشاء المستخدم إذا لم يوجد
            const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                email: user.email,
                agent_id: agentId,
                full_name: user.user_metadata?.full_name || '',
              })
              .select()
              .single();

            // إنشاء تكوين افتراضي للبوت
            await supabase
              .from('bot_configs')
              .insert({
                agent_id: agentId,
                name: 'مساعد ذكي',
                avatar_emoji: '🤖',
                voice_id: 'ar-male-1',
                button_color: '#3B82F6',
              });

            setUser({
              ...user,
              agentId: newUser?.agent_id,
              fullName: newUser?.full_name,
            });
          } else {
            setUser({
              ...user,
              agentId: userData?.agent_id,
              fullName: userData?.full_name,
            });
          }
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

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        try {
          if (event === 'SIGNED_IN' && session?.user) {
          console.log('Processing SIGNED_IN event for:', session.user.email);

          // جلب بيانات المستخدم عند تسجيل الدخول
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          console.log('User lookup result:', { userData, userError });

          if (userError && userError.code === 'PGRST116') {
            console.log('User not found, creating new user...');
            // إنشاء المستخدم إذا لم يوجد
            const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                email: session.user.email,
                agent_id: agentId,
                full_name: session.user.user_metadata?.full_name || '',
              })
              .select()
              .single();

            console.log('User creation result:', { newUser, insertError });

            // إنشاء تكوين افتراضي للبوت
            const { error: configError } = await supabase
              .from('bot_configs')
              .insert({
                agent_id: agentId,
                name: 'مساعد ذكي',
                avatar_emoji: '🤖',
                voice_id: 'ar-male-1',
                button_color: '#3B82F6',
              });

            console.log('Bot config creation result:', { configError });

            const userObj = {
              ...session.user,
              agentId: newUser?.agent_id,
              fullName: newUser?.full_name,
            };
            console.log('Setting new user:', userObj);
            setUser(userObj);
          } else {
            const userObj = {
              ...session.user,
              agentId: userData?.agent_id,
              fullName: userData?.full_name,
            };
            console.log('Setting existing user:', userObj);
            setUser(userObj);
          }
            console.log('Auth loading set to false');
            setLoading(false);
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            setUser(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      window.location.href = '/';
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
