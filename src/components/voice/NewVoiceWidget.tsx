'use client';

import React, { useState, useEffect } from 'react';
import { Phone, X, Mic, MessageCircle } from 'lucide-react';
import { playStreamingTTS, fallbackTextToSpeech, isStreamingSupported } from '@/utils/streamingTTS';

// أنواع الحالات المختلفة للويدجت
type WidgetState = 'idle' | 'connecting' | 'connected' | 'ending';

interface NewVoiceWidgetProps {
  agentId: string;
  name: string;
  avatarEmoji: string;
  voiceId: string;
  welcomeMessage?: string;
  mode?: 'embedded' | 'preview';
  onStateChange?: (state: WidgetState) => void;
  className?: string;
}

// CSS للتصميم البسيط الأنيق
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

export function NewVoiceWidget({
  agentId,
  name,
  avatarEmoji,
  voiceId,
  welcomeMessage,
  mode = 'embedded',
  onStateChange,
  className = ''
}: NewVoiceWidgetProps) {
  const [state, setState] = useState<WidgetState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  // النصوص لكل حالة
  const getStateText = () => {
    switch (state) {
      case 'idle':
        return `اسأل ${name}`;
      case 'connecting':
        return 'جاري الاتصال...';
      case 'connected':
        return `تحدث مع ${name} • ${formatCallDuration(callDuration)}`;
      case 'ending':
        return 'تم إنهاء المكالمة';
      default:
        return `اسأل ${name}`;
    }
  };

  // تنسيق مدة المكالمة
  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // الأيقونة لكل حالة
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

  // تم إزالة Web Speech API - لا يتم تشغيل الصوت في المتصفح
  const textToSpeechLocal = async (text: string): Promise<void> => {
    console.log('تم تعطيل تشغيل الصوت في المتصفح');
    throw new Error('تم تعطيل تشغيل الصوت في المتصفح');
  };

  // تحويل النص إلى صوت باستخدام Streaming API مع fallback
  const textToSpeech = async (text: string, voiceId: string): Promise<string | null> => {
    try {
      // محاولة استخدام Streaming API أولاً إذا كان مدعوماً
      if (isStreamingSupported()) {
        console.log('استخدام Streaming TTS API');
        await playStreamingTTS(text, voiceId, (progress) => {
          console.log(`تقدم التشغيل: ${Math.round(progress * 100)}%`);
        });
        return null; // إشارة أن الصوت تم تشغيله مباشرة
      } else {
        console.log('Streaming غير مدعوم، استخدام الطريقة التقليدية');
        // fallback للطريقة التقليدية
        return await fallbackTextToSpeech(text, voiceId);
      }
    } catch (streamingError) {
      console.warn('فشل في Streaming TTS، محاولة الطريقة التقليدية:', streamingError);
      
      try {
        // محاولة الطريقة التقليدية
        return await fallbackTextToSpeech(text, voiceId);
      } catch (fallbackError) {
        if (fallbackError.message && fallbackError.message.includes('429')) {
          console.log('⚠️ تجاوز حصة API - تم تعطيل تشغيل الصوت في المتصفح');
        } else {
          console.error('فشل في جميع طرق API، التبديل إلى Web Speech API:', fallbackError);
        }
        
        // تم إزالة Web Speech API - لا يتم تشغيل الصوت في المتصفح
        console.log('تم تعطيل تشغيل الصوت في المتصفح');
        throw new Error('فشل في تحويل النص إلى صوت - تم تعطيل تشغيل الصوت في المتصفح');
      }
    }
  };

  // تشغيل الملف الصوتي
  const playAudio = (audioUrl: string | null): Promise<void> => {
    return new Promise((resolve, reject) => {
      // إذا كان audioUrl هو null، فهذا يعني أن Web Speech API تم استخدامه بالفعل
      if (audioUrl === null) {
        resolve();
        return;
      }
      
      const audio = new Audio(audioUrl);
      
      // التحقق من نوع الـ URL لتحديد ما إذا كان blob URL أم لا
      const isBlobUrl = audioUrl.startsWith('blob:');
      
      audio.onended = () => {
        // تحرير الذاكرة فقط إذا كان blob URL
        if (isBlobUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        resolve();
      };
      
      audio.onerror = (error) => {
        // تحرير الذاكرة فقط إذا كان blob URL
        if (isBlobUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  };

  // تشغيل رسالة الترحيب
  const playWelcomeMessage = async () => {
    // التحقق من وجود رسالة ترحيب
    if (!welcomeMessage || !welcomeMessage.trim()) {
      console.log('No welcome message configured');
      // تغيير الحالة إلى connected حتى لو لم تكن هناك رسالة ترحيب
      setState('connected');
      setCallDuration(0);
      return;
    }

    try {
      // توليد الصوت مباشرة باستخدام Streaming TTS
      console.log('Generating welcome message using Streaming TTS');
      try {
        // استخدام playStreamingTTS مع onAudioStart
        await playStreamingTTS(
          welcomeMessage,
          voiceId,
          undefined, // onProgress
          () => {
            // تغيير الحالة إلى connected وبدء العداد عند بدء النطق الفعلي
            setState('connected');
            setCallDuration(0);
          }
        );
        console.log('تم تشغيل رسالة الترحيب بنجاح');
      } catch (ttsError) {
        // تغيير الحالة إلى connected حتى في حالة فشل TTS
        setState('connected');
        setCallDuration(0);
        
        if (ttsError.message && ttsError.message.includes('429')) {
          console.log('⚠️ تم تعطيل تشغيل الصوت في المتصفح بسبب تجاوز حصة API');
        } else {
          console.log('TTS service temporarily unavailable:', ttsError.message || ttsError);
        }
        
        // تم إزالة Web Speech API - لا يتم تشغيل الصوت في المتصفح
        console.log('تم تعطيل تشغيل الصوت في المتصفح - لن يتم تشغيل رسالة الترحيب صوتياً');
        // عرض رسالة نصية كبديل أخير
        console.log('عرض رسالة الترحيب كنص:', welcomeMessage);
      }
    } catch (err) {
      // تغيير الحالة إلى connected حتى في حالة الخطأ
      setState('connected');
      setCallDuration(0);
      
      console.error('Error playing welcome message:', {
        errorName: err?.name || 'Unknown',
        errorMessage: err?.message || 'Unknown error',
        errorStack: err?.stack || 'No stack trace',
        welcomeMessage,
        agentId,
        voiceId
      });
      
      // محاولة أخيرة باستخدام Web Speech API
      try {
        console.log('تم تعطيل تشغيل الصوت في المتصفح...');
        await textToSpeechLocal(welcomeMessage);
        console.log('تم تشغيل رسالة الترحيب في محاولة الطوارئ');
      } catch (emergencyError) {
        console.error('فشل في محاولة الطوارئ أيضاً:', emergencyError);
      }
    }
  };

  // بدء المكالمة
  const startCall = async () => {
    setState('connecting');
    
    try {
      // إنشاء جلسة جديدة عبر API
      const formData = new FormData();
      formData.append('agentId', agentId);

      const response = await fetch('/api/voice/start', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'فشل في بدء الجلسة');
      }

      // تخزين معرف الجلسة في متغير عام للاستخدام لاحقاً
      (window as any).currentSessionId = result.data.sessionId;
      
      // تشغيل رسالة الترحيب أولاً، ثم تغيير الحالة عند بدء الصوت
      await playWelcomeMessage();
    } catch (error) {
      console.error('Error starting call:', error);
      setState('idle');
    }
  };

  // إنهاء المكالمة
  const endCall = async () => {
    setState('ending');
    
    try {
      // إنهاء الجلسة في قاعدة البيانات إذا كانت موجودة
      const sessionId = (window as any).currentSessionId;
      if (sessionId) {
        const formData = new FormData();
        formData.append('sessionId', sessionId);

        await fetch('/api/voice/end', {
          method: 'POST',
          body: formData
        });
        
        // مسح معرف الجلسة
        (window as any).currentSessionId = null;
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
  useEffect(() => {
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

  // إشعار تغيير الحالة
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // التعامل مع النقر على الويدجت
  const handleClick = () => {
    if (state === 'idle') {
      if (!hasAcceptedTerms && mode === 'embedded') {
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

  // قبول الشروط
  const acceptTerms = () => {
    setHasAcceptedTerms(true);
    setShowTerms(false);
    startCall();
  };

  return (
    <>
      {/* CSS للانيميشن */}
      <style jsx>{modernAnimationStyles}</style>

      {/* الويدجت الرئيسي */}
      <div className={`${className}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
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
              <div className="text-sm">{avatarEmoji}</div>
              
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

      {/* نافذة الشروط والأحكام */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]" dir="rtl">
          <div className="bg-white rounded-2xl w-80 shadow-2xl transform">
            <div className="p-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">الشروط والأحكام</h3>
              </div>
            </div>

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

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTerms(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={acceptTerms}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-all transform hover:scale-105"
                >
                  موافق وابدأ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
