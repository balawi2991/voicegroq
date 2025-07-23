'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { VoiceBot } from '@/components/voice/VoiceBot';
import { SpaceBackground } from '@/components/space/StarField';
import { TestTube, Palette, Monitor } from 'lucide-react';
import { GlowButton } from '@/components/space/GlowButton';

// أنماط تصميم مختلفة للاختبار
const DESIGN_THEMES = {
  default: {
    name: 'التصميم الافتراضي',
    background: 'bg-gradient-to-br from-blue-900/20 to-purple-900/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    accent: 'text-blue-400'
  },
  glass: {
    name: 'Glass UI',
    background: 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl',
    accent: 'text-cyan-400'
  },
  neon: {
    name: 'Neon Style',
    background: 'bg-gradient-to-br from-purple-900/40 to-pink-900/40',
    glass: 'bg-black/40 backdrop-blur-lg border border-purple-500/30 shadow-purple-500/20 shadow-2xl',
    accent: 'text-purple-400'
  }
};

export default function DevPage() {
  const { user, loading } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('default');

  if (loading) {
    return (
      <SpaceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">جاري تحميل مختبر التطوير...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  if (!user) {
    return (
      <SpaceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <TestTube className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">غير مصرح</h1>
            <p className="text-gray-400 mb-6">تحتاج لتسجيل الدخول للوصول لصفحة التطوير</p>
            <GlowButton onClick={() => window.location.href = '/login'}>
              تسجيل الدخول
            </GlowButton>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  const theme = DESIGN_THEMES[currentTheme as keyof typeof DESIGN_THEMES];
  const agentId = user?.agentId || 'demo-agent-123';

  return (
    <SpaceBackground>
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className={`${theme.glass} rounded-2xl p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <TestTube className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">مختبر التطوير</h1>
                  <p className="text-gray-400">اختبار البوت - Agent ID: {agentId}</p>
                </div>
              </div>
              
              <GlowButton
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                العودة للوحة التحكم
              </GlowButton>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Theme Selector */}
            <div className={`${theme.glass} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <Palette className={`w-5 h-5 ${theme.accent}`} />
                <h3 className="font-semibold text-white">نمط التصميم</h3>
              </div>
              
              <div className="space-y-2">
                {Object.entries(DESIGN_THEMES).map(([key, themeOption]) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key)}
                    className={`w-full p-3 rounded-lg text-right transition-all ${
                      currentTheme === key
                        ? 'bg-blue-500/20 border border-blue-500/50 text-white'
                        : 'bg-white/5 border border-transparent text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {themeOption.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Info */}
            <div className={`${theme.glass} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <Monitor className={`w-5 h-5 ${theme.accent}`} />
                <h3 className="font-semibold text-white">معلومات البوت</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Agent ID:</span>
                  <span className="text-white mr-2">{agentId}</span>
                </div>
                <div>
                  <span className="text-gray-400">المستخدم:</span>
                  <span className="text-white mr-2">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400">الثيم:</span>
                  <span className="text-white mr-2">{theme.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Testing Area */}
          <div className="lg:col-span-3">
            <div className={`${theme.glass} rounded-2xl p-6 h-full`}>
              <div className="flex items-center gap-3 mb-6">
                <TestTube className={`w-6 h-6 ${theme.accent}`} />
                <h2 className="text-xl font-bold text-white">منطقة اختبار البوت</h2>
                <span className="text-sm text-gray-400">({theme.name})</span>
              </div>

              {/* Bot Testing Area */}
              <div className="flex justify-center">
                <div 
                  className={`${theme.background} rounded-2xl p-8 transition-all duration-300`}
                  style={{
                    width: '100%',
                    minHeight: '400px'
                  }}
                >
                  {/* البوت الحقيقي */}
                  <div className="flex items-center justify-center h-full">
                    <VoiceBot 
                      agentId={agentId}
                      mode="preview"
                      size="large"
                      customTheme={currentTheme !== 'default' ? {
                        background: theme.background,
                        glass: theme.glass,
                        accent: theme.accent
                      } : undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-sm text-center">
                  💡 هذا هو البوت الحقيقي الخاص بك. أي تعديل في صفحة التخصيص سينعكس هنا مباشرة
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SpaceBackground>
  );
}
