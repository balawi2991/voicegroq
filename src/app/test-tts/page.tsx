'use client';

import { useState } from 'react';

// دالة لإنشاء WAV header للـ PCM data
function createWavFile(pcmData: Uint8Array, sampleRate: number, channels: number, bitsPerSample: number): ArrayBuffer {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const fileSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM data
  const pcmView = new Uint8Array(buffer, 44);
  pcmView.set(pcmData);

  return buffer;
}

export default function TestTTSPage() {
  const [text, setText] = useState('مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟');
  const [voice, setVoice] = useState('ar-male-1');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testTTS = async () => {
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString('ar-SA');
    
    try {
      setResults(prev => [...prev, `⏳ [${timestamp}] جاري تحويل النص لصوت...\nالنص: ${text}\nالصوت: ${voice}`]);
      
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: voice,
          agentId: 'test_agent'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('TTS Result:', result); // للتشخيص

        setResults(prev => {
          const newResults = [...prev];
          const dataLength = result.data.audioData?.data?.length || 'غير معروف';
          newResults[newResults.length - 1] = `✅ [${timestamp}] نجح التحويل!\nالنص: ${text}\nالصوت: ${voice}\nحجم البيانات: ${dataLength} حرف`;
          return newResults;
        });

        // إنشاء Blob من البيانات
        try {
          const audioData = result.data.audioData;

          if (!audioData || !audioData.data) {
            throw new Error('لا توجد بيانات صوتية في الاستجابة');
          }

          const binaryString = atob(audioData.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // إنشاء WAV file صحيح من PCM data
          const wavBuffer = createWavFile(bytes, 24000, 1, 16);
          const blob = new Blob([wavBuffer], { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(blob);

          // تشغيل الصوت
          const audio = new Audio(audioUrl);
          audio.play().then(() => {
            setResults(prev => {
              const newResults = [...prev];
              newResults[newResults.length - 1] += '\n🔊 تم تشغيل الصوت بنجاح!';
              return newResults;
            });

            // تنظيف URL بعد التشغيل
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
            };
          }).catch(error => {
            setResults(prev => {
              const newResults = [...prev];
              newResults[newResults.length - 1] += `\n❌ فشل في تشغيل الصوت: ${error.message}`;
              return newResults;
            });
            URL.revokeObjectURL(audioUrl);
          });
        } catch (error: any) {
          setResults(prev => {
            const newResults = [...prev];
            newResults[newResults.length - 1] += `\n❌ خطأ في معالجة الصوت: ${error.message}`;
            return newResults;
          });
        }
      } else {
        setResults(prev => {
          const newResults = [...prev];
          newResults[newResults.length - 1] = `❌ [${timestamp}] فشل التحويل!\nالخطأ: ${result.error}`;
          return newResults;
        });
      }
    } catch (error: any) {
      setResults(prev => {
        const newResults = [...prev];
        newResults[newResults.length - 1] = `❌ [${timestamp}] خطأ في الطلب!\nالخطأ: ${error.message}`;
        return newResults;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-center mb-6">🔊 اختبار تحويل النص لصوت</h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                النص:
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                الصوت:
              </label>
              <select
                id="voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ar-male-1">ذكر عربي 1</option>
                <option value="ar-female-1">أنثى عربية 1</option>
                <option value="ar-male-2">ذكر عربي 2</option>
                <option value="ar-female-2">أنثى عربية 2</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={testTTS}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-md transition-colors"
              >
                {isLoading ? '⏳ جاري التحويل...' : '🎵 تحويل لصوت'}
              </button>
              
              <button
                onClick={() => setResults([])}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors"
              >
                🗑️ مسح النتائج
              </button>
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">النتائج:</h2>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-md font-mono text-sm whitespace-pre-wrap ${
                      result.includes('✅') 
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : result.includes('❌')
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-800'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
