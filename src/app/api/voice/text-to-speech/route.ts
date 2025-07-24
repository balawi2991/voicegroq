import { NextRequest, NextResponse } from 'next/server';

// CORS headers
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

// إعدادات TTS - يمكن التحكم في الخدمة المستخدمة
const TTS_CONFIG = {
  // تعطيل OpenAI مؤقتاً - يمكن تفعيله لاحقاً
  OPENAI_ENABLED: false,
  // تفعيل Groq كخدمة افتراضية
  GROQ_ENABLED: true,
  // ترتيب الأولوية للخدمات
  PRIORITY: ['groq', 'openai'] as const
};

// دالة لتحويل voice_id إلى OpenAI voice name
function getOpenAIVoiceName(voiceId: string): string {
  const voiceMap: { [key: string]: string } = {
    'ar-male-1': 'onyx', // Deep voice - مناسب للذكور
    'ar-female-1': 'nova', // Warm voice - مناسب للإناث
    'ar-male-2': 'echo', // Clear voice - ذكر واضح
    'ar-female-2': 'shimmer', // Soft voice - أنثى ناعمة
  };

  return voiceMap[voiceId] || voiceMap['ar-male-1'];
}

// دالة لتحديد نموذج Groq المناسب
function getGroqModel(voiceId: string): string {
  // استخدام playai-tts-arabic للأصوات العربية
  return 'playai-tts-arabic';
}

// دالة لتحديد معرف الصوت لـ Groq PlayAI Arabic
function getGroqVoiceId(voiceId: string): string {
  // Groq PlayAI Arabic يستخدم معرفات صوت محددة
  const voiceMap: { [key: string]: string } = {
    'ar-male-1': 'Ahmad-PlayAI', // صوت ذكوري عربي
    'ar-female-1': 'Amira-PlayAI', // صوت أنثوي عربي
    'ar-male-2': 'Khalid-PlayAI', // صوت ذكوري عربي بديل
    'ar-female-2': 'Nasser-PlayAI', // صوت ذكوري عربي بديل
  };

  return voiceMap[voiceId] || 'Ahmad-PlayAI';
}

// تحويل النص إلى صوت باستخدام Groq TTS API
async function groqTextToSpeech(text: string, voiceId: string): Promise<{type: string, data: string, mimeType: string, error?: boolean}> {
  try {
    // تحديد النموذج والصوت المناسب لـ Groq PlayAI Arabic
    const groqModel = getGroqModel(voiceId);
    const groqVoiceId = getGroqVoiceId(voiceId);

    console.log('Calling Groq TTS API with PlayAI Arabic:', {
      model: groqModel,
      voiceId: groqVoiceId,
      text: text.substring(0, 50) + '...',
      hasApiKey: !!process.env.GROQ_API_KEY
    });

    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: groqModel, // استخدام playai-tts-arabic
        input: text,
        voice: groqVoiceId,
        response_format: 'wav'
      })
    });

    console.log('Groq TTS response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq TTS API error details:', errorText);
      throw new Error(`Groq TTS API error: ${response.status} - ${errorText}`);
    }

    // معالجة استجابة Groq TTS - البيانات تأتي كـ binary
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer).toString('base64');

    console.log('Groq TTS audio generated successfully, size:', audioData.length);

    // إرجاع البيانات الصوتية
    return {
      type: 'base64',
      data: audioData,
      mimeType: 'audio/wav'
    };
  } catch (error) {
    console.error('Error in Groq TTS:', error);
    throw error;
  }
}

// تحويل النص إلى صوت باستخدام OpenAI TTS API (معطل مؤقتاً)
async function openaiTextToSpeech(text: string, voiceId: string): Promise<{type: string, data: string, mimeType: string, error?: boolean}> {
  try {
    // تحديد الصوت المناسب لـ OpenAI
    const openaiVoiceName = getOpenAIVoiceName(voiceId);

    console.log('Calling OpenAI TTS API:', {
      voiceName: openaiVoiceName,
      text: text.substring(0, 50) + '...',
      hasApiKey: !!process.env.OPENAI_API_KEY
    });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice: openaiVoiceName,
        response_format: 'mp3'
      })
    });

    console.log('OpenAI TTS response:', {
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS API error details:', errorText);
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    // معالجة استجابة OpenAI TTS - البيانات تأتي كـ binary
    const audioBuffer = await response.arrayBuffer();
    const audioData = Buffer.from(audioBuffer).toString('base64');

    console.log('OpenAI TTS audio generated successfully, size:', audioData.length);

    // إرجاع البيانات الصوتية
    return {
      type: 'base64',
      data: audioData,
      mimeType: 'audio/mp3'
    };
  } catch (error) {
    console.error('Error in OpenAI TTS:', error);
    throw error;
  }
}

// دالة موحدة لتحويل النص إلى صوت مع دعم التبديل بين الخدمات
async function textToSpeech(text: string, voiceId: string): Promise<{type: string, data: string, mimeType: string, error?: boolean}> {
  const errors: string[] = [];

  // جرب الخدمات حسب الأولوية والتفعيل
  for (const service of TTS_CONFIG.PRIORITY) {
    try {
      if (service === 'groq' && TTS_CONFIG.GROQ_ENABLED) {
        console.log('🎤 Using Groq TTS service');
        return await groqTextToSpeech(text, voiceId);
      } else if (service === 'openai' && TTS_CONFIG.OPENAI_ENABLED) {
        console.log('🤖 Using OpenAI TTS service');
        return await openaiTextToSpeech(text, voiceId);
      }
    } catch (error) {
      const errorMsg = `${service} TTS failed: ${error.message}`;
      console.warn(errorMsg);
      errors.push(errorMsg);
      continue;
    }
  }

  // إذا فشلت جميع الخدمات، إرجاع خطأ
  console.error('All TTS services failed:', errors);
  return {
    type: 'base64',
    data: Buffer.from('fallback audio data').toString('base64'),
    mimeType: 'audio/mp3',
    error: true
  };
}

export async function POST(request: NextRequest) {
  console.log('🔊 TTS API called!');

  try {
    const { text, voiceId, agentId } = await request.json();
    console.log('📝 Request data:', { text, voiceId, agentId });

    if (!text) {
      console.log('❌ No text provided');
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    console.log('Converting text to speech:', { text, voiceId, agentId });
    console.log('TTS Configuration:', {
      groqEnabled: TTS_CONFIG.GROQ_ENABLED,
      openaiEnabled: TTS_CONFIG.OPENAI_ENABLED,
      priority: TTS_CONFIG.PRIORITY
    });

    // تحويل النص إلى صوت
    const audioData = await textToSpeech(text, voiceId || 'ar-male-1');

    console.log('Audio data result:', {
      type: audioData.type,
      dataLength: audioData.data.length,
      mimeType: audioData.mimeType,
      hasError: audioData.error
    });

    // إذا كان هناك خطأ في توليد الصوت، إرجاع success: false
    if (audioData.error) {
      console.log('❌ Audio generation failed, returning error response');
      return NextResponse.json(
        { success: false, error: 'Audio generation failed - quota exceeded or API error' },
        { 
          status: 429, // Too Many Requests
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        audioData,
        text,
        voiceId: voiceId || 'ar-male-1'
      }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Text-to-speech API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert text to speech' },
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
