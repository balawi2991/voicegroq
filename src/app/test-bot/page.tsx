'use client';

import { useEffect } from 'react';

export default function TestBotPage() {
  useEffect(() => {
    // تحميل embed.js ديناميكياً
    const script = document.createElement('script');
    script.src = '/embed.js';
    script.setAttribute('data-agent-id', 'agent_1753098702984_wnwt07md8');
    document.body.appendChild(script);

    return () => {
      // تنظيف عند إلغاء التحميل
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">🤖 اختبار سند بوت</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🔄 اختبار السيناريو الجديد:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-700">
                <li><strong>النقر على البوت:</strong> "جاري الاتصال..."</li>
                <li><strong>البوت يقول رسالة الترحيب:</strong> "مرحباً! أنا [الاسم]..."</li>
                <li><strong>عند بداية كلام البوت:</strong> العداد يبدأ (00:01, 00:02...)</li>
                <li><strong>بعد انتهاء الترحيب:</strong> "تحدث مع [الاسم] • 00:05"</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">📊 معلومات التحديث:</h3>
              <p className="text-green-700"><strong>التحديث التلقائي:</strong> كل 10 ثوان</p>
              <p className="text-green-700"><strong>التحديث الفوري:</strong> عند الحفظ في صفحة التخصيص</p>
              <p className="text-green-700" id="last-update"><strong>آخر تحديث:</strong> عند التحميل</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">🎵 اختبار OpenAI TTS:</h3>
              <ul className="list-disc list-inside space-y-2 text-yellow-700">
                <li>البوت الآن يستخدم <strong>OpenAI TTS (tts-1-hd)</strong> بدلاً من Gemini</li>
                <li>أصوات عالية الجودة مع دعم ممتاز للعربية</li>
                <li>جودة صوت فائقة ووضوح استثنائي</li>
                <li>استجابة سريعة وتكلفة اقتصادية</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">🔧 للمطورين:</h3>
              <p className="text-purple-700">افتح <strong>Developer Tools (F12)</strong> لمراقبة:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-600 mt-2">
                <li>تحميل البوت وإصداره</li>
                <li>استدعاءات OpenAI TTS API</li>
                <li>تحديثات التخصيص</li>
                <li>أي أخطاء أو تحذيرات</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📋 حالة النظام:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Frontend:</span>
                  <span className="text-green-600 ml-2">✅ يعمل</span>
                </div>
                <div>
                  <span className="font-medium">Gemini LLM:</span>
                  <span className="text-green-600 ml-2">✅ يعمل</span>
                </div>
                <div>
                  <span className="font-medium">OpenAI TTS:</span>
                  <span className="text-blue-600 ml-2">🔄 محدث</span>
                </div>
                <div>
                  <span className="font-medium">Database:</span>
                  <span className="text-green-600 ml-2">✅ يعمل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
