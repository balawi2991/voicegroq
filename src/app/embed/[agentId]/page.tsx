'use client';

import { useState, useEffect } from 'react';
import { VoiceBot } from '@/components/voice/VoiceBot';
import { X } from 'lucide-react';

interface EmbedPageProps {
  params: Promise<{
    agentId: string;
  }>;
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [agentId, setAgentId] = useState<string>('');

  useEffect(() => {
    params.then(({ agentId }) => setAgentId(agentId));
  }, [params]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // إرسال رسالة للنافذة الأب عند الإغلاق
    const handleClose = () => {
      if (window.parent) {
        window.parent.postMessage({ type: 'sanad-bot-close' }, '*');
      }
    };

    // إضافة مستمع للوحة المفاتيح
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage({ type: 'sanad-bot-close' }, '*');
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex flex-col">
      {/* شريط علوي */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">س</span>
          </div>
          <div>
            <h1 className="text-white font-semibold">مساعد ذكي</h1>
            <p className="text-gray-300 text-xs">متصل الآن</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleMinimize}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={isMinimized ? 'توسيع' : 'تصغير'}
          >
            <div className="w-4 h-0.5 bg-gray-300"></div>
          </button>
          
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {!isMinimized && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* رسالة الترحيب */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              مرحباً! 👋
            </h2>
            <p className="text-gray-300 max-w-sm">
              أنا مساعدك الذكي. اضغط على الزر أدناه وتحدث معي بصوتك
            </p>
          </div>

          {/* البوت الصوتي */}
          <div className="mb-8">
            <VoiceBot 
              agentId={agentId}
              mode="embedded"
              size="large"
            />
          </div>

          {/* تعليمات الاستخدام */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-sm">
            <h3 className="text-white font-medium mb-2 text-center">
              كيفية الاستخدام:
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• اضغط على الزر الأزرق</li>
              <li>• تحدث بوضوح</li>
              <li>• انتظر الرد الصوتي</li>
              <li>• كرر العملية للمحادثة</li>
            </ul>
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              مدعوم بتقنية الذكاء الاصطناعي
            </p>
          </div>
        </div>
      )}

      {/* وضع مصغر */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3 mx-auto">
              <span className="text-white text-xl font-bold">س</span>
            </div>
            <p className="text-gray-300 text-sm">المساعد مصغر</p>
            <button
              onClick={handleMinimize}
              className="mt-2 text-blue-400 hover:text-blue-300 text-xs transition-colors"
            >
              انقر للتوسيع
            </button>
          </div>
        </div>
      )}

      {/* تأثيرات بصرية */}
      <div className="absolute inset-0 pointer-events-none">
        {/* نجوم متحركة */}
        {agentId && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 7 + 10) % 100}%`,
              top: `${(i * 11 + 5) % 100}%`,
              animationDelay: `${(i * 0.2) % 2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
