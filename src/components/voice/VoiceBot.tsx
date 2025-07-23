'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { NewVoiceWidget } from '@/components/voice/NewVoiceWidget';
import { cn } from '@/lib/utils';
import { playStreamingTTS, fallbackTextToSpeech, isStreamingSupported } from '@/utils/streamingTTS';
import type { VoiceBotProps, BotConfig, VoiceSession } from '@/types';

export function VoiceBot({
  agentId,
  mode = 'embedded',
  size = 'normal',
  className,
  customTheme
}: VoiceBotProps) {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // جلب تكوين البوت
  useEffect(() => {
    fetchBotConfig();
  }, [agentId]);

  const fetchBotConfig = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/bot/config/${agentId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const botConfig: BotConfig = {
          agentId,
          name: result.data.name || 'مساعد ذكي',
          avatarEmoji: result.data.avatar_emoji || '🤖',
          voiceId: result.data.voice_id || 'ar-male-1',
          welcomeMessage: result.data.welcome_message || '',
          isActive: result.data.is_active || true,
          createdAt: result.data.created_at || new Date().toISOString(),
          updatedAt: result.data.updated_at || new Date().toISOString(),
        };
        setConfig(botConfig);
      } else {
        throw new Error('Failed to fetch config');
      }
    } catch (err) {
      setError('فشل في تحميل إعدادات المساعد');
      console.error('Error fetching bot config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceSession = async () => {
    if (!config) return;

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

      // إنشاء كائن الجلسة
      const newSession: VoiceSession = {
        sessionId: result.data.sessionId,
        agentId,
        isListening: false,
        isProcessing: false,
        isPlaying: false,
        messages: [],
      };

      setSession(newSession);
      
      // تشغيل رسالة الترحيب
      await playWelcomeMessage();
      
      // بدء الاستماع
      await startListening();
    } catch (err) {
      setError('فشل في بدء المحادثة');
      console.error('Error starting voice session:', err);
    }
  };

  // تحويل النص إلى صوت باستخدام Streaming API مع fallback
  const textToSpeech = async (text: string, voiceId: string): Promise<string | null> => {
    try {
      // محاولة استخدام Streaming API أولاً إذا كان مدعوماً
      if (isStreamingSupported()) {
        console.log('استخدام Streaming TTS API في VoiceBot');
        await playStreamingTTS(text, voiceId, (progress) => {
          console.log(`تقدم التشغيل: ${Math.round(progress * 100)}%`);
        });
        return null; // إشارة أن الصوت تم تشغيله مباشرة
      } else {
        console.log('Streaming غير مدعوم، استخدام الطريقة التقليدية');
        // fallback للطريقة التقليدية
        return await fallbackTextToSpeech(text, voiceId);
      }
    } catch (error) {
      console.warn('فشل في Streaming TTS، محاولة الطريقة التقليدية:', error);
      
      try {
        // محاولة الطريقة التقليدية كـ fallback
        return await fallbackTextToSpeech(text, voiceId);
      } catch (fallbackError) {
        console.error('فشل في جميع طرق TTS:', fallbackError);
        throw fallbackError;
      }
    }
  };

  // تشغيل الملف الصوتي
  const playAudio = (audioUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
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

  const playWelcomeMessage = async () => {
    if (!config || !session) return;

    // التحقق من وجود رسالة ترحيب
    if (!config.welcomeMessage || !config.welcomeMessage.trim()) {
      console.log('No welcome message configured');
      return;
    }
    
    setSession(prev => prev ? { ...prev, isPlaying: true } : null);
    
    try {
      // توليد الصوت مباشرة باستخدام Streaming TTS
      console.log('Generating welcome message using Streaming TTS');
      const audioUrl = await textToSpeech(config.welcomeMessage, config.voiceId);
      
      // تشغيل الصوت فقط إذا تم إرجاع URL (الطريقة التقليدية)
      if (audioUrl) {
        await playAudio(audioUrl);
      }
      // إذا كان audioUrl هو null، فهذا يعني أن streaming تم استخدامه وتم التشغيل بالفعل
    } catch (err) {
      console.error('Error playing welcome message:', err);
      // محاكاة تشغيل الصوت في حالة الفشل
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setSession(prev => prev ? { ...prev, isPlaying: false } : null);
    }
  };



  const startListening = async () => {
    if (!session) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
      };
      
      mediaRecorder.start();
      setSession(prev => prev ? { ...prev, isListening: true } : null);
      
      // إيقاف التسجيل بعد صمت (محاكاة)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 5000);
      
    } catch (err) {
      setError('فشل في الوصول للميكروفون');
      console.error('Error starting listening:', err);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    if (!session) return;

    setSession(prev => prev ? { 
      ...prev, 
      isListening: false, 
      isProcessing: true 
    } : null);

    try {
      // TODO: معالجة الصوت عبر API
      // 1. تحويل الصوت إلى نص (Gladia)
      // 2. معالجة النص (Gemini + RAG)
      // 3. تحويل الرد إلى صوت (ElevenLabs)
      
      // محاكاة المعالجة
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResponse = 'شكراً لك على سؤالك. هذا رد تجريبي من المساعد الذكي.';
      
      // تشغيل الرد
      setSession(prev => prev ? { 
        ...prev, 
        isProcessing: false,
        isPlaying: true 
      } : null);
      
      // محاكاة تشغيل الرد
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // العودة للاستماع
      setSession(prev => prev ? { 
        ...prev, 
        isPlaying: false 
      } : null);
      
      // بدء دورة استماع جديدة
      setTimeout(() => startListening(), 1000);
      
    } catch (err) {
      setError('فشل في معالجة الصوت');
      console.error('Error processing voice input:', err);
      setSession(prev => prev ? { 
        ...prev, 
        isProcessing: false 
      } : null);
    }
  };

  const stopSession = async () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // إنهاء الجلسة في قاعدة البيانات إذا كانت موجودة
    if (session?.sessionId) {
      try {
        const formData = new FormData();
        formData.append('sessionId', session.sessionId);

        await fetch('/api/voice/end', {
          method: 'POST',
          body: formData
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }

    setSession(null);
  };

  if (isLoading) {
    return (
      <div className={cn(
        'flex items-center justify-center',
        size === 'large' ? 'w-32 h-32' : 'w-16 h-16',
        className
      )}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-red-500/20 rounded-full border border-red-500/50',
        size === 'large' ? 'w-32 h-32' : 'w-16 h-16',
        className
      )}>
        <MicOff className="w-8 h-8 text-red-400" />
      </div>
    );
  }

  const buttonSize = size === 'large' ? 128 : 64;
  const iconSize = size === 'large' ? 32 : 20;

  return (
    <div className={cn('relative', className)}>
      <NewVoiceWidget
        agentId={agentId}
        name={config.name}
        avatarEmoji={config.avatarEmoji}
        voiceId={config.voiceId}
        welcomeMessage={config.welcomeMessage}
        mode={mode}
      />
      
      {/* عرض حالة الجلسة في وضع المعاينة */}
      {mode === 'preview' && session && (
        <motion.div
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-white">
            {session.isListening && 'يستمع...'}
            {session.isProcessing && 'يعالج...'}
            {session.isPlaying && 'يتحدث...'}
          </div>
        </motion.div>
      )}
    </div>
  );
}
