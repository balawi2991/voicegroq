'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SpaceBackground } from '@/components/space/StarField';
import { GlowButton } from '@/components/space/GlowButton';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, loading } = useAuth();
  const router = useRouter();

  // إعادة توجيه إذا كان المستخدم مسجل دخول بالفعل
  useEffect(() => {
    console.log('Auth state check:', { loading, user: !!user, userEmail: user?.email });

    if (!loading && user) {
      console.log('User logged in, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { auth } = await import('@/lib/supabase');
      console.log('Attempting to sign in with:', email);

      const { data, error } = await auth.signIn(email, password);

      console.log('Sign in result:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('User signed in successfully:', data.user.email);
        // انتظار تحديث AuthProvider ثم إعادة التوجيه
        console.log('Waiting for auth state to update...');

        // انتظار أطول للتأكد من تحديث AuthProvider
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          router.replace('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'فشل في تسجيل الدخول. تحقق من بياناتك.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SpaceBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* البطاقة */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
            {/* العنوان */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center gap-2 mb-4"
                animate={{ 
                  textShadow: [
                    "0 0 10px #3B82F6",
                    "0 0 20px #3B82F6",
                    "0 0 10px #3B82F6"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <LogIn className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">تسجيل الدخول</h1>
              </motion.div>
              <p className="text-gray-400">
                ادخل إلى حسابك لإدارة مساعدك الذكي
              </p>
            </div>

            {/* النموذج */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                    dir="ltr"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="أدخل كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <motion.div
                  className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              {/* زر تسجيل الدخول */}
              <GlowButton
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    تسجيل الدخول
                  </>
                )}
              </GlowButton>
            </form>

            {/* روابط إضافية */}
            <div className="mt-8 text-center space-y-4">
              <Link 
                href="/forgot-password" 
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                نسيت كلمة المرور؟
              </Link>
              
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>ليس لديك حساب؟</span>
                <Link 
                  href="/signup" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
              
              <Link 
                href="/" 
                className="inline-block text-gray-500 hover:text-gray-400 text-sm transition-colors"
              >
                ← العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </SpaceBackground>
  );
}
