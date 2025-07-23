'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VoiceBot } from '@/components/voice/VoiceBot';
import { GlowButton } from '@/components/space/GlowButton';
import {
  Copy,
  CheckCircle,
  MessageSquare,
  Mic,
  Palette,
  Brain,
  ExternalLink,
  Code,
  Activity,
  TestTube
} from 'lucide-react';

function DashboardContent() {
  const { user } = useAuth();
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats] = useState({
    totalConversations: 47,
    todayConversations: 12,
    avgResponseTime: '1.2s',
    satisfaction: '94%'
  });

  useEffect(() => {
    if (user?.agentId) {
      // توليد كود التضمين
      const code = `<script src="${window.location.origin}/embed.js" data-agent-id="${user.agentId}"></script>`;
      setEmbedCode(code);
    }
  }, [user?.agentId]);

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('فشل في نسخ الكود:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* الترحيب */}
        <motion.div
          className="text-center lg:text-right"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-gray-400 text-lg">
            إدارة مساعدك الذكي وتتبع أدائه من مكان واحد
          </p>
        </motion.div>

        {/* الإحصائيات */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalConversations}</div>
                <div className="text-sm text-gray-400">إجمالي المحادثات</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.todayConversations}</div>
                <div className="text-sm text-gray-400">اليوم</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Mic className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.avgResponseTime}</div>
                <div className="text-sm text-gray-400">متوسط الاستجابة</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.satisfaction}</div>
                <div className="text-sm text-gray-400">معدل الرضا</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* المحتوى الرئيسي */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* كود التضمين */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">كود التضمين</h2>
            </div>
            
            <p className="text-gray-400 mb-4">
              انسخ هذا الكود وضعه في موقعك لتفعيل المساعد الذكي
            </p>
            
            <div className="bg-black/30 rounded-lg p-4 mb-4 font-mono text-sm">
              <code className="text-green-400 break-all">
                {embedCode}
              </code>
            </div>
            
            <GlowButton
              onClick={copyEmbedCode}
              variant={copied ? 'secondary' : 'primary'}
              className="w-full"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  تم النسخ!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  نسخ الكود
                </>
              )}
            </GlowButton>
          </motion.div>

          {/* معاينة البوت */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">معاينة المساعد</h2>
            </div>
            
            <p className="text-gray-400 mb-6">
              هكذا سيظهر مساعدك في موقعك
            </p>
            
            <div className="flex justify-center items-center min-h-[200px] bg-black/20 rounded-lg border border-white/5">
              {user?.agentId ? (
                <VoiceBot
                  agentId={user.agentId}
                  mode="preview"
                  size="large"
                />
              ) : (
                <div className="text-gray-400">جاري التحميل...</div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <GlowButton
                href="/dashboard/appearance"
                variant="outline"
                size="sm"
              >
                <Palette className="w-4 h-4" />
                تخصيص المظهر
              </GlowButton>
            </div>
          </motion.div>
        </div>

        {/* روابط سريعة */}
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <ExternalLink className="w-6 h-6 text-cyan-400" />
            إجراءات سريعة
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlowButton
              href="/dashboard/knowledge"
              variant="outline"
              className="h-auto p-4 flex-col gap-2"
            >
              <Brain className="w-8 h-8 text-blue-400" />
              <div className="text-center">
                <div className="font-medium">إضافة معرفة</div>
                <div className="text-xs text-gray-400">رفع ملفات جديدة</div>
              </div>
            </GlowButton>

            <GlowButton
              href="/dashboard/faq"
              variant="outline"
              className="h-auto p-4 flex-col gap-2"
            >
              <MessageSquare className="w-8 h-8 text-green-400" />
              <div className="text-center">
                <div className="font-medium">إدارة الأسئلة</div>
                <div className="text-xs text-gray-400">أسئلة شائعة</div>
              </div>
            </GlowButton>

            <GlowButton
              href="/dashboard/conversations"
              variant="outline"
              className="h-auto p-4 flex-col gap-2"
            >
              <Activity className="w-8 h-8 text-purple-400" />
              <div className="text-center">
                <div className="font-medium">عرض المحادثات</div>
                <div className="text-xs text-gray-400">سجل التفاعلات</div>
              </div>
            </GlowButton>

            <GlowButton
              href="/dev"
              variant="outline"
              className="h-auto p-4 flex-col gap-2 border-orange-500/30 hover:border-orange-500/50"
            >
              <TestTube className="w-8 h-8 text-orange-400" />
              <div className="text-center">
                <div className="font-medium">مختبر التطوير</div>
                <div className="text-xs text-gray-400">اختبار البوت</div>
              </div>
            </GlowButton>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
