'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SpaceBackground } from '@/components/space/StarField';
import { GlowButton } from '@/components/space/GlowButton';
import { Home, Search, ArrowRight, Sparkles } from 'lucide-react';

export default function NotFound() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SpaceBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* الرقم 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <motion.h1
              className="text-8xl md:text-9xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                backgroundSize: "200% 200%",
              }}
            >
              404
            </motion.h1>
          </motion.div>

          {/* الرسالة الرئيسية */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              وش تدور؟ ما لقيناه! 🤔
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              يبدو إنك تايه في الفضاء... الصفحة اللي تدورها مو موجودة هنا
            </p>
          </motion.div>

          {/* الكواكب المتحركة */}
          <motion.div
            className="relative mb-12 h-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* كوكب 1 */}
            <motion.div
              className="absolute left-1/4 top-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
              }}
              transition={{
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* كوكب 2 */}
            <motion.div
              className="absolute right-1/3 top-8 w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -360],
              }}
              transition={{
                y: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                rotate: { duration: 6, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* كوكب 3 */}
            <motion.div
              className="absolute left-1/2 top-12 w-4 h-4 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"
              animate={{
                y: [0, -25, 0],
                rotate: [0, 360],
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
                rotate: { duration: 10, repeat: Infinity, ease: "linear" }
              }}
            />

            {/* نجوم صغيرة */}
            {isClient && Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 8}px`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>

          {/* الاقتراحات */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              ممكن تجرب هذي:
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-right">
              <div className="flex items-center gap-3 text-gray-300">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <span>تأكد من كتابة الرابط صح</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <ArrowRight className="w-4 h-4 text-purple-400" />
                <span>ارجع للصفحة الرئيسية</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>دور في لوحة التحكم</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <ArrowRight className="w-4 h-4 text-green-400" />
                <span>تواصل معنا إذا تحتاج مساعدة</span>
              </div>
            </div>
          </motion.div>

          {/* أزرار العمل */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <GlowButton 
              href="/"
              size="lg"
              className="min-w-[200px]"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
            </GlowButton>
            
            <GlowButton 
              href="/dashboard"
              variant="outline" 
              size="lg"
              className="min-w-[200px]"
            >
              <Search className="w-5 h-5" />
              لوحة التحكم
            </GlowButton>
          </motion.div>

          {/* رسالة مرحة */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <p className="text-gray-500 text-sm">
              لا تشيل هم، حتى رواد الفضاء يتوهون أحياناً 🚀
            </p>
          </motion.div>
        </div>
      </div>
    </SpaceBackground>
  );
}
