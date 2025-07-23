import { NextRequest, NextResponse } from 'next/server';

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// إعدادات TTS Streaming - يمكن التحكم في الخدمة المستخدمة
const TTS_STREAMING_CONFIG = {
  // تفعيل Speechify كخدمة افتراضية للـ streaming
  SPEECHIFY_ENABLED: true,
  // إعدادات الـ streaming
  CHUNK_SIZE: 1024, // حجم كل chunk بالبايت
  BUFFER_SIZE: 4096, // حجم الـ buffer
  // ترتيب الأولوية للخدمات
  PRIORITY: ['speechify'] as const
};

// دالة لتحديد نموذج Speechify (Simba Multilingual)
function getSpeechifyModel(voiceId: string): string {
  // جميع الأصوات تستخدم Simba Multilingual للدعم متعدد اللغات
  return 'simba-multilingual';
}

// دالة لتحديد معرف الصوت لـ Simba Multilingual
function getSpeechifyVoiceId(voiceId: string): string {
  // Simba Multilingual يستخدم معرفات صوت محددة
  const voiceMap: { [key: string]: string } = {
    'ar-male-1': 'george', // صوت ذكوري عربي
    'ar-female-1': 'erin', // صوت أنثوي عربي (فاطمة)
    'ar-male-2': 'ismail', // صوت ذكوري عربي بديل (محمد)
    'ar-female-2': 'aicha', // صوت أنثوي عربي بديل (عائشة)
  };

  return voiceMap[voiceId] || 'george';
}

// تحويل النص إلى صوت باستخدام Speechify Streaming API
async function speechifyStreamingTextToSpeech(
  text: string, 
  voiceId: string
): Promise<ReadableStream<Uint8Array>> {
  try {
    // تحديد النموذج والصوت لـ Speechify
    const model = getSpeechifyModel(voiceId);
    const voice_id = getSpeechifyVoiceId(voiceId);

    console.log('Calling Speechify Streaming TTS API with Simba Multilingual:', {
      model,
      voice_id,
      text: text.substring(0, 50) + '...',
      hasApiKey: !!process.env.SPEECHIFY_API_KEY
    });

    // استخدام stream endpoint بدلاً من speech endpoint
    const response = await fetch('https://api.sws.speechify.com/v1/audio/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SPEECHIFY_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: model,
        voice_id: voice_id,
        audio_format: 'mp3',
        sample_rate: 24000,
        // إعدادات خاصة بالـ streaming
        streaming: true,
        chunk_length_s: 0.5, // طول كل chunk بالثواني
      })
    });

    console.log('Speechify Streaming TTS response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speechify Streaming TTS API error details:', errorText);
      throw new Error(`Speechify Streaming TTS API error: ${response.status} - ${errorText}`);
    }

    // التحقق من وجود body للـ streaming
    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    console.log('Speechify Streaming TTS started successfully');
    return response.body;

  } catch (error) {
    console.error('Error in Speechify Streaming TTS:', error);
    throw error;
  }
}

// دالة موحدة لتحويل النص إلى صوت مع دعم الـ streaming
async function streamingTextToSpeech(
  text: string, 
  voiceId: string
): Promise<ReadableStream<Uint8Array>> {
  const errors: string[] = [];

  // جرب الخدمات حسب الأولوية والتفعيل
  for (const service of TTS_STREAMING_CONFIG.PRIORITY) {
    try {
      if (service === 'speechify' && TTS_STREAMING_CONFIG.SPEECHIFY_ENABLED) {
        console.log('🎤 Using Speechify Streaming TTS service');
        return await speechifyStreamingTextToSpeech(text, voiceId);
      }
    } catch (error) {
      const errorMsg = `${service} Streaming TTS failed: ${error.message}`;
      console.warn(errorMsg);
      errors.push(errorMsg);
      continue;
    }
  }

  // إذا فشلت جميع الخدمات، إرجاع خطأ
  console.error('All Streaming TTS services failed:', errors);
  throw new Error('All streaming TTS services failed: ' + errors.join(', '));
}

// معالج الطلبات الرئيسي للـ streaming
export async function POST(request: NextRequest) {
  console.log('🔊 Streaming TTS API called!');

  try {
    const { text, voiceId, agentId } = await request.json();
    console.log('📝 Streaming Request data:', { text, voiceId, agentId });

    if (!text) {
      console.log('❌ No text provided for streaming');
      return NextResponse.json(
        { success: false, error: 'Text is required for streaming' },
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    console.log('Converting text to streaming audio:', { text, voiceId, agentId });
    console.log('Streaming TTS Configuration:', {
      speechifyEnabled: TTS_STREAMING_CONFIG.SPEECHIFY_ENABLED,
      chunkSize: TTS_STREAMING_CONFIG.CHUNK_SIZE,
      bufferSize: TTS_STREAMING_CONFIG.BUFFER_SIZE,
      priority: TTS_STREAMING_CONFIG.PRIORITY
    });

    // تحويل النص إلى صوت streaming
    const audioStream = await streamingTextToSpeech(text, voiceId || 'ar-male-1');

    console.log('Audio streaming started successfully');

    // إرجاع الـ streaming response
    return new NextResponse(audioStream, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        // إضافة headers خاصة بالـ streaming
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
      },
    });

  } catch (error) {
    console.error('Streaming Text-to-speech API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start streaming text to speech' },
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

// معالج GET للتحقق من حالة الخدمة
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      service: 'Speechify Streaming TTS API',
      status: 'active',
      config: {
        speechifyEnabled: TTS_STREAMING_CONFIG.SPEECHIFY_ENABLED,
        chunkSize: TTS_STREAMING_CONFIG.CHUNK_SIZE,
        bufferSize: TTS_STREAMING_CONFIG.BUFFER_SIZE,
      }
    },
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    }
  );
}