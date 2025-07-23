'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SpaceBackground } from '@/components/space/StarField';
import { GlowButton } from '@/components/space/GlowButton';
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // التحقق من تطابق كلمات المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setIsLoading(false);
      return;
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setIsLoading(false);
      return;
    }

    try {
      const { auth, supabase } = await import('@/lib/supabase');

      // إنشاء حساب في Supabase Auth
      const { data, error } = await auth.signUp(formData.email, formData.password);

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // إنشاء agent_id فريد
        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // إنشاء سجل المستخدم في قاعدة البيانات
        const { error: userError } = await supabase
          .from('users')
          .insert({
            email: formData.email,
            agent_id: agentId,
            full_name: formData.name,
          });

        if (userError) {
          console.error('Error creating user record:', userError);
        }

        // إنشاء تكوين افتراضي للبوت
        const { error: configError } = await supabase
          .from('bot_configs')
          .insert({
            agent_id: agentId,
            name: 'مساعد ذكي',
            voice_id: 'ar-male-1',
            button_color: '#3B82F6',
          });

        if (configError) {
          console.error('Error creating bot config:', configError);
        }

        // إعادة توجيه للوحة التحكم
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء الحساب. حاول مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SpaceBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
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
                <UserPlus className="w-8 h-8 text-blue-400" />
                <h1 className="text-3xl font-bold text-white">إنشاء حساب</h1>
              </motion.div>
              <p className="text-gray-400">
                ابدأ رحلتك مع مساعدك الذكي الآن
              </p>
            </div>

            {/* النموذج */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* الاسم */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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

              {/* تأكيد كلمة المرور */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="أعد إدخال كلمة المرور"
                    required
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

              {/* زر إنشاء الحساب */}
              <GlowButton
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    إنشاء حساب
                  </>
                )}
              </GlowButton>
            </form>

            {/* روابط إضافية */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>لديك حساب بالفعل؟</span>
                <Link 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  تسجيل الدخول
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
