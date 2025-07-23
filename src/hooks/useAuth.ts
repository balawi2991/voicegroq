'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, database } from '@/lib/supabase';

interface AuthUser extends User {
  agentId?: string;
  fullName?: string;
}

export function useAuth() {
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
          // جلب بيانات المستخدم من قاعدة البيانات باستخدام البريد الإلكتروني
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            // إذا لم يوجد المستخدم في قاعدة البيانات، أنشئه
            if (userError.code === 'PGRST116') {
              console.log('User not found in database, creating...');
              const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

              const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                  email: user.email,
                  agent_id: agentId,
                  full_name: user.user_metadata?.full_name || '',
                })
                .select()
                .single();

              if (createError) {
                console.error('Error creating user:', createError);
              } else {
                // إنشاء تكوين افتراضي للبوت
                await supabase
                  .from('bot_configs')
                  .insert({
                    agent_id: agentId,
                    name: 'مساعد ذكي',
                    voice_id: 'ar-male-1',
                    button_color: '#3B82F6',
                  });

                setUser({
                  ...user,
                  agentId: newUser.agent_id,
                  fullName: newUser.full_name,
                });
                return;
              }
            }
          }

          setUser({
            ...user,
            agentId: userData?.agent_id,
            fullName: userData?.full_name,
          });
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
        if (event === 'SIGNED_IN' && session?.user) {
          // جلب بيانات المستخدم عند تسجيل الدخول
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userError && userError.code === 'PGRST116') {
            // إنشاء المستخدم إذا لم يوجد
            const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const { data: newUser } = await supabase
              .from('users')
              .insert({
                email: session.user.email,
                agent_id: agentId,
                full_name: session.user.user_metadata?.full_name || '',
              })
              .select()
              .single();

            // إنشاء تكوين افتراضي للبوت
            await supabase
              .from('bot_configs')
              .insert({
                agent_id: agentId,
                name: 'مساعد ذكي',
                voice_id: 'ar-male-1',
                button_color: '#3B82F6',
              });

            setUser({
              ...session.user,
              agentId: newUser?.agent_id,
              fullName: newUser?.full_name,
            });
          } else {
            setUser({
              ...session.user,
              agentId: userData?.agent_id,
              fullName: userData?.full_name,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
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

  const updateProfile = async (updates: { fullName?: string; email?: string }) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // تحديث في Supabase Auth إذا كان هناك تغيير في البريد الإلكتروني
      if (updates.email && updates.email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: updates.email
        });
        if (authError) throw authError;
      }

      // تحديث في قاعدة البيانات
      const { error: dbError } = await database.users.update(user.id, {
        full_name: updates.fullName,
        email: updates.email,
      });

      if (dbError) throw dbError;

      // تحديث الحالة المحلية
      setUser(prev => prev ? {
        ...prev,
        email: updates.email || prev.email,
        fullName: updates.fullName || prev.fullName,
      } : null);

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
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  };
}
