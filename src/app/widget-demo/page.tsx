'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Phone, MessageCircle } from 'lucide-react';

// CSS للتصميم البسيط الأنيق مثل الصور
const modernAnimationStyles = `
  @keyframes gentlePulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  @keyframes slideIn {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .vocify-widget {
    background: #000000;
    color: #ffffff;
    border-radius: 25px;
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }

  .vocify-widget:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  .vocify-widget.ended {
    background: #ffffff;
    color: #000000;
    border: 1px solid #e5e5e5;
  }

  .vocify-widget.connecting {
    background: #1a1a1a;
  }

  .vocify-widget.connected {
    background: #000000;
  }

  .avatar-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  }
`;

// أنواع الحالات المختلفة للويدجت (تدفق محسن)
type WidgetState = 'idle' | 'connecting' | 'connected' | 'ending';

// نافذة الشروط والأحكام المصغرة
function TermsModal({ isOpen, onAccept, onCancel }: {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[60] animate-in slide-in-from-bottom-4 duration-300">
      <div
        className="bg-white rounded-2xl w-80 shadow-2xl transform"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header مصغر */}
        <div className="p-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 justify-end">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">الشروط والأحكام</h3>
          </div>
        </div>

        {/* Content مصغر */}
        <div className="p-4">
          <div className="text-gray-700 text-xs leading-relaxed mb-4 text-right space-y-2">
            <p className="font-medium text-gray-900 text-sm">
              مرحباً بك! 👋
            </p>
            <p>
              بالموافقة، أوافق على تسجيل وحفظ محادثاتي مع مقدمي الخدمات الخارجيين.
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <p className="text-purple-800 text-xs">
                💡 يمكنك الامتناع عن الاستخدام إذا كنت لا ترغب في التسجيل.
              </p>
            </div>
          </div>

          {/* Buttons مصغرة */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={onAccept}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              موافق
            </button>
          </div>
        </div>

        {/* سهم يشير للويدجت */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
      </div>
    </div>
  );
}

// الويدجت الصوتي الثابت - مثل مكالمة هاتفية
function FloatingVoiceWidget() {
  const [state, setState] = useState<WidgetState>('idle');
  const [showTerms, setShowTerms] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [contactName] = useState('المساعد الذكي سند');

  // النصوص لكل حالة (التدفق المحسن)
  const getStateText = () => {
    switch (state) {
      case 'idle':
        return 'اسأل المساعد الذكي';
      case 'connecting':
        return 'جاري الاتصال...';
      case 'connected':
        return `تحدث مع سند • ${formatCallDuration(callDuration)}`;
      case 'ending':
        return 'تم إنهاء المكالمة';
      default:
        return 'اسأل المساعد الذكي';
    }
  };

  // تنسيق مدة المكالمة
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // الأيقونة لكل حالة (التدفق المحسن)
  const getStateIcon = () => {
    switch (state) {
      case 'idle':
        return <Phone className="w-4 h-4" />;
      case 'connecting':
        return <Phone className="w-4 h-4 animate-pulse" />;
      case 'connected':
        return <Mic className="w-4 h-4" />;
      case 'ending':
        return <X className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  // ستايل الويدجت لكل حالة
  const getWidgetClass = () => {
    switch (state) {
      case 'idle':
        return 'vocify-widget';
      case 'connecting':
        return 'vocify-widget connecting';
      case 'connected':
        return 'vocify-widget connected';
      case 'ending':
        return 'vocify-widget ended';
      default:
        return 'vocify-widget';
    }
  };

  // التعامل مع النقر على الويدجت (التدفق المحسن)
  const handleClick = () => {
    if (state === 'idle') {
      if (!hasAcceptedTerms) {
        setShowTerms(true);
        return;
      }
      startCall();
    } else if (state === 'ending') {
      setState('idle');
      setCallDuration(0);
    }
    // لا يمكن النقر أثناء الاتصال أو المكالمة - سيكون هناك زر منفصل
  };

  // بدء المكالمة مع التدفق المحسن
  const startCall = async () => {
    setState('connecting');

    try {
      // إنشاء جلسة جديدة عبر API
      const formData = new FormData();
      formData.append('agentId', 'demo-agent'); // استخدام معرف ثابت للعرض التوضيحي

      const response = await fetch('/api/voice/start', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل في بدء الجلسة');
      }

      // تخزين معرف الجلسة في متغير عام للاستخدام لاحقاً
      (window as any).demoSessionId = result.data.sessionId;
      
      setState('connected');
      setCallDuration(0);
    } catch (error) {
      console.error('Error starting call:', error);
      // في حالة الفشل، نستمر في العرض التوضيحي بدون API
      setState('connected');
      setCallDuration(0);
    }
  };

  // إنهاء المكالمة
  const endCall = async () => {
    setState('ending');
    
    try {
      // إنهاء الجلسة في قاعدة البيانات إذا كانت موجودة
      const sessionId = (window as any).demoSessionId;
      if (sessionId) {
        const formData = new FormData();
        formData.append('sessionId', sessionId);

        await fetch('/api/voice/end', {
          method: 'POST',
          body: formData
        });
        
        // مسح معرف الجلسة
        (window as any).demoSessionId = null;
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
    
    setTimeout(() => {
      setState('idle');
      setCallDuration(0);
    }, 1500);
  };

  // مؤقت المكالمة
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state]);

  // قبول الشروط
  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowTerms(false);
    startCall();
  };

  // رفض الشروط
  const handleCancelTerms = () => {
    setShowTerms(false);
  };

  return (
    <>
      {/* الويدجت الثابت */}
      <div className="fixed bottom-6 right-6 z-50">


        {/* ويدجت بسيط مثل الصور */}
        <div style={{ animation: 'slideIn 0.3s ease-out' }}>
          <div className="flex items-center gap-3">
            {/* الويدجت الرئيسي */}
            <button
              onClick={handleClick}
              className={`${getWidgetClass()} flex items-center gap-3 px-4 py-3 transition-all duration-300`}
              style={{
                direction: 'rtl',
                minWidth: '200px',
                animation: state === 'connecting' ? 'gentlePulse 2s infinite ease-in-out' : 'none'
              }}
            >
              {/* الأفاتار - يمين النص */}
              <div className="w-8 h-8 rounded-full avatar-gradient flex items-center justify-center flex-shrink-0 relative">
                <div className="text-sm">🤖</div>

                {/* موجات صوتية أثناء المكالمة */}
                {state === 'connected' && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full border border-blue-400/50"
                      style={{ animation: 'gentlePulse 1.5s infinite ease-in-out' }}
                    />
                    <div
                      className="absolute -inset-1 rounded-full border border-purple-400/30"
                      style={{ animation: 'gentlePulse 1.5s infinite ease-in-out 0.3s' }}
                    />
                    <div
                      className="absolute -inset-2 rounded-full border border-cyan-400/20"
                      style={{ animation: 'gentlePulse 1.5s infinite ease-in-out 0.6s' }}
                    />
                  </>
                )}
              </div>

              {/* النص */}
              <span className="text-sm font-medium flex-1 text-right">
                {getStateText()}
              </span>

              {/* الأيقونة */}
              <div className="flex items-center justify-center">
                {getStateIcon()}
              </div>
            </button>

            {/* زر الإنهاء المنفصل - يظهر فقط أثناء المكالمة */}
            {state === 'connected' && (
              <button
                onClick={endCall}
                className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>


      </div>

      {/* نافذة الشروط والأحكام */}
      <TermsModal
        isOpen={showTerms}
        onAccept={handleAcceptTerms}
        onCancel={handleCancelTerms}
      />
    </>
  );
}

// الصفحة الرئيسية للتجربة
export default function WidgetDemoPage() {
  const [currentDemo, setCurrentDemo] = useState('floating');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* CSS للانيميشن العصري */}
      <style jsx>{modernAnimationStyles}</style>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تجربة الويدجت الصوتي</h1>
              <p className="text-gray-600 mt-1">معاينة التصميم الجديد للمساعد الصوتي</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">نسخة تجريبية</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* معلومات التجربة */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-4">معلومات التجربة</h3>
              
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">الهدف</h4>
                  <p className="text-blue-700">
                    اختبار تصميم الويدجت الصوتي الجديد قبل تطبيقه على النظام الأساسي
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">المميزات</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>• تصميم عربي RTL</li>
                    <li>• حالات متعددة مع انيميشن</li>
                    <li>• نافذة الشروط والأحكام</li>
                    <li>• تأثيرات بصرية احترافية</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-semibold text-amber-900 mb-2">التعليمات</h4>
                  <p className="text-amber-700">
                    انقر على الويدجت في أسفل يسار الصفحة لبدء التجربة
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* منطقة العرض */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border min-h-[500px]">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                منطقة عرض الويدجت
              </h3>
              
              <div className="text-center text-gray-500 mt-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-lg mb-2">الويدجت الصوتي موجود في أسفل يسار الصفحة</p>
                <p className="text-sm">انقر عليه لبدء التجربة</p>
                
                <div className="mt-8 p-4 bg-gray-50 rounded-lg inline-block">
                  <p className="text-xs text-gray-600">
                    💡 هذه مجرد صفحة تجريبية لاختبار التصميم
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الويدجت الثابت */}
      <FloatingVoiceWidget />
    </div>
  );
}
