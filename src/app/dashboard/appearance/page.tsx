'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NewVoiceWidget } from '@/components/voice/NewVoiceWidget';
import { GlowButton } from '@/components/space/GlowButton';
import {
  Palette,
  User,
  Mic,
  Save,
  Upload,
  Volume2,
  Smile
} from 'lucide-react';
import { AVAILABLE_VOICES, AVAILABLE_AVATARS, type VoiceOption } from '@/types';

function AppearanceContent() {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    name: 'مساعد ذكي',
    avatarEmoji: '🤖',
    voiceId: 'ar-male-1',
    avatarUrl: '',
    welcomeMessage: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // جلب تكوين البوت عند تحميل الصفحة
  useEffect(() => {
    const fetchBotConfig = async () => {
      if (!user?.agentId) return;

      try {
        const response = await fetch(`/api/bot/config/${user.agentId}`);
        const result = await response.json();

        if (result.success && result.data) {
          setConfig({
            name: result.data.name || 'مساعد ذكي',
            avatarEmoji: result.data.avatar_emoji || '🤖',
            voiceId: result.data.voice_id || 'ar-male-1',
            avatarUrl: result.data.avatar_url || '',
            welcomeMessage: result.data.welcome_message || ''
          });
        }
      } catch (error) {
        console.error('Error fetching bot config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotConfig();
  }, [user?.agentId]);

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    // الحفظ التلقائي لكل شيء عدا رسالة الترحيب
    if (!updates.hasOwnProperty('welcomeMessage')) {
      autoSave();
    }
  };

  // دالة منفصلة لحفظ رسالة الترحيب
  const saveWelcomeMessage = async () => {
    if (!user?.agentId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/bot/config/${user.agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          avatar_emoji: config.avatarEmoji,
          voice_id: config.voiceId,
          avatar_url: config.avatarUrl,
          welcome_message: config.welcomeMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ملاحظة: تم إزالة توليد الملف الصوتي المسبق لتجنب الطلبات المكررة
        // الآن سيتم توليد الصوت مباشرة عند الحاجة باستخدام Simba Multilingual API
        console.log('تم حفظ إعدادات البوت، سيتم توليد الصوت عند الحاجة باستخدام Simba Multilingual API');

        setSaveMessage('تم حفظ رسالة الترحيب بنجاح');
        setTimeout(() => setSaveMessage(''), 2000);

        // إشعار embed.js بالتحديث - طرق متعددة للتأكد من الوصول
        try {
          // الطريقة الأولى: localStorage مع المفتاح الصحيح
          localStorage.setItem(`bot_config_${user.agentId}`, JSON.stringify({
            name: config.name,
            avatarEmoji: config.avatarEmoji,
            voiceId: config.voiceId,
            avatarUrl: config.avatarUrl,
            welcomeMessage: config.welcomeMessage,
            timestamp: Date.now()
          }));
          
          // الطريقة الثانية: إشعار عام للتحديث
          localStorage.setItem('config_updated', Date.now().toString());
          
          // الطريقة الثالثة: إرسال حدث مخصص
          window.dispatchEvent(new CustomEvent('botConfigUpdate', {
            detail: {
              agentId: user.agentId,
              welcomeMessage: config.welcomeMessage,
              timestamp: Date.now()
            }
          }));
          
          console.log('🔔 Embed notification sent via multiple channels');
        } catch (e) {
          console.log('Could not update localStorage for embed notification:', e);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setSaveMessage('فشل في حفظ رسالة الترحيب');
      console.error('Error saving welcome message:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const autoSave = async () => {
    if (!user?.agentId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/bot/config/${user.agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          avatar_emoji: config.avatarEmoji,
          voice_id: config.voiceId,
          avatar_url: config.avatarUrl,
          welcome_message: config.welcomeMessage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ملاحظة: تم إزالة توليد الملف الصوتي المسبق لتجنب الطلبات المكررة
        // الآن سيتم توليد الصوت مباشرة عند الحاجة باستخدام Simba Multilingual API
        console.log('تم حفظ إعدادات البوت تلقائياً، سيتم توليد الصوت عند الحاجة باستخدام Simba Multilingual API');

        setSaveMessage('تم الحفظ تلقائياً');
        setTimeout(() => setSaveMessage(''), 2000);

        // إشعار embed.js بالتحديث - طرق متعددة للتأكد من الوصول
        try {
          // الطريقة الأولى: localStorage مع المفتاح الصحيح
          localStorage.setItem(`bot_config_${user.agentId}`, JSON.stringify({
            name: config.name,
            avatarEmoji: config.avatarEmoji,
            voiceId: config.voiceId,
            avatarUrl: config.avatarUrl,
            welcomeMessage: config.welcomeMessage,
            timestamp: Date.now()
          }));
          
          // الطريقة الثانية: إشعار عام للتحديث
          localStorage.setItem('config_updated', Date.now().toString());
          
          // الطريقة الثالثة: إرسال حدث مخصص
          window.dispatchEvent(new CustomEvent('botConfigUpdate', {
            detail: {
              agentId: user.agentId,
              config: {
                name: config.name,
                avatarEmoji: config.avatarEmoji,
                voiceId: config.voiceId,
                welcomeMessage: config.welcomeMessage
              },
              timestamp: Date.now()
            }
          }));
          
          console.log('🔔 Auto-save embed notification sent via multiple channels');
        } catch (e) {
          console.log('Could not update localStorage for embed notification:', e);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setSaveMessage('فشل في الحفظ');
      console.error('Error saving config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: رفع الصورة
      const url = URL.createObjectURL(file);
      updateConfig({ avatarUrl: url });
    }
  };

  // حالة تشغيل الصوت
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);

  const playVoicePreview = async (voiceId: string) => {
    try {
      // تعيين حالة التشغيل
      setIsPlayingPreview(voiceId);
      
      // نص المعاينة
      const previewText = 'مرحباً، هذا هو صوت المساعد الذكي';
      
      // استدعاء API لتحويل النص إلى صوت
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: previewText, 
          voiceId,
          agentId: user?.agentId
        }),
      });

      if (!response.ok) {
        throw new Error(`فشل في تحويل النص إلى صوت: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data.audioData) {
        throw new Error('لم يتم استلام بيانات صوتية صالحة');
      }

      // إنشاء ملف صوتي من البيانات المشفرة بـ base64
      const audioData = result.data.audioData.data;
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.data.audioData.mimeType });
      
      // إنشاء URL للملف الصوتي
      const audioUrl = URL.createObjectURL(blob);
      
      // تشغيل الصوت
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // تحرير الذاكرة
        setIsPlayingPreview(null); // إيقاف حالة التشغيل
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl); // تحرير الذاكرة
        console.error('Error playing audio preview');
        setIsPlayingPreview(null); // إيقاف حالة التشغيل
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error in voice preview:', error);
      setIsPlayingPreview(null); // إيقاف حالة التشغيل في حالة الخطأ
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">تخصيص المظهر</h1>
          </div>
          <p className="text-gray-400">
            خصص شكل وصوت مساعدك ليتناسب مع علامتك التجارية
          </p>
          
          {/* رسالة الحفظ */}
          {saveMessage && (
            <motion.div
              className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {saveMessage}
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* إعدادات التخصيص */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* اسم المساعد */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">اسم المساعد</h3>
              </div>
              
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="أدخل اسم المساعد"
              />
              
              <p className="text-sm text-gray-400 mt-2">
                هذا الاسم سيظهر عند تقديم المساعد نفسه
              </p>
            </div>

            {/* الأفاتار */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Smile className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">الأفاتار</h3>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <button
                    key={avatar.emoji}
                    onClick={() => updateConfig({ avatarEmoji: avatar.emoji })}
                    className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center text-2xl ${
                      config.avatarEmoji === avatar.emoji
                        ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent scale-110 bg-blue-500/20'
                        : 'hover:scale-105 bg-white/5 hover:bg-white/10'
                    }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-400 mt-3">
                اختر الأفاتار الذي يمثل مساعدك الذكي
              </p>
            </div>

            {/* نوع الصوت */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">نوع الصوت</h3>
              </div>
              
              <div className="space-y-3">
                {AVAILABLE_VOICES.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      config.voiceId === voice.id
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => updateConfig({ voiceId: voice.id })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{voice.name}</div>
                        <div className="text-sm text-gray-400">
                          {voice.gender === 'male' ? 'ذكوري' : 'أنثوي'} • عربي
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoicePreview(voice.id);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
                        disabled={isPlayingPreview !== null}
                      >
                        {isPlayingPreview === voice.id ? (
                          <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الصورة الرمزية */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">الصورة الرمزية</h3>
              </div>
              
              <div className="flex items-center gap-4">
                {config.avatarUrl ? (
                  <img
                    src={config.avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <GlowButton
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      رفع صورة
                    </GlowButton>
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG حتى 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* رسالة الترحيب */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">رسالة الترحيب</h3>
              </div>
              
              <div className="space-y-3">
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                  rows={3}
                  placeholder={`مرحباً، أنا ${config.name}. كيف يمكنني مساعدتك؟`}
                />
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    اتركه فارغاً لاستخدام الرسالة الافتراضية
                  </p>
                  
                  <GlowButton
                    onClick={saveWelcomeMessage}
                    disabled={isSaving}
                    variant="primary"
                    size="sm"
                    className="min-w-[100px]"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        حفظ
                      </>
                    )}
                  </GlowButton>
                </div>
                
                {saveMessage && (
                  <div className="text-sm text-green-400 text-center">
                    {saveMessage}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* معاينة المساعد */}
          <motion.div
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 h-fit sticky top-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Mic className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">معاينة مباشرة</h3>
              {isSaving && (
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              )}
            </div>
            
            <p className="text-gray-400 mb-6">
              هكذا سيظهر مساعدك للزوار
            </p>
            
            <div className="flex justify-center items-center min-h-[300px] bg-black/20 rounded-lg border border-white/5 relative">
              {user?.agentId && !isLoading ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center mb-4">
                    <h3 className="text-white font-medium mb-2">معاينة الويدجت</h3>
                    <p className="text-gray-400 text-sm">هكذا سيظهر في موقعك</p>
                  </div>

                  <NewVoiceWidget
                    agentId={user.agentId}
                    name={config.name}
                    avatarEmoji={config.avatarEmoji}
                    voiceId={config.voiceId}
                    welcomeMessage={config.welcomeMessage}
                    mode="preview"
                  />

                  <div className="text-center">
                    <div className="text-sm text-white font-medium mb-1">
                      {config.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {AVAILABLE_VOICES.find(v => v.id === config.voiceId)?.name}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">جاري التحميل...</div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                التغييرات تظهر فوراً في موقعك بعد الحفظ
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AppearancePage() {
  return <AppearanceContent />;
}
