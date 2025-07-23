'use client';

import { motion } from 'framer-motion';
import { SpaceBackground } from '@/components/space/StarField';
import { GlowButton } from '@/components/space/GlowButton';
import { Sparkles, Mic, Zap } from 'lucide-react';

export default function Home() {
  return (
    <SpaceBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* الشعار والعنوان */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-6"
              animate={{
                textShadow: [
                  "0 0 20px #3B82F6",
                  "0 0 40px #3B82F6",
                  "0 0 20px #3B82F6"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-blue-400" />
              <h1 className="text-6xl md:text-8xl font-bold text-white">
                سند بوت
              </h1>
              <Sparkles className="w-12 h-12 text-blue-400" />
            </motion.div>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              مساعدك الذكي يتحدث بدالك... صوتياً، وبس.
            </motion.p>
          </motion.div>

          {/* المميزات */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Mic className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                تفاعل صوتي
              </h3>
              <p className="text-gray-400">
                محادثة طبيعية بالصوت فقط، بدون كتابة أو تعقيد
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                ذكاء متقدم
              </h3>
              <p className="text-gray-400">
                يفهم أسئلتك ويجيب من معرفة موقعك الخاصة
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                تخصيص كامل
              </h3>
              <p className="text-gray-400">
                صوت وشكل ولون مخصص لعلامتك التجارية
              </p>
            </div>
          </motion.div>

          {/* أزرار العمل */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <GlowButton
              href="/signup"
              size="lg"
              className="min-w-[200px]"
            >
              <Sparkles className="w-5 h-5" />
              ابدأ الآن
            </GlowButton>

            <GlowButton
              href="/login"
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              تسجيل الدخول
            </GlowButton>
          </motion.div>

          {/* معلومات إضافية */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <p className="text-gray-500 text-sm">
              مجاني للبدء • تخصيص كامل • دعم عربي
            </p>
          </motion.div>
        </div>
      </div>
    </SpaceBackground>
  );
}
