import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/supabase';

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

// تحويل الصوت إلى نص باستخدام Gladia API
async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('language', 'ar');
    formData.append('language_behaviour', 'automatic single language');

    const response = await fetch('https://api.gladia.io/v2/transcription/', {
      method: 'POST',
      headers: {
        'X-Gladia-Key': process.env.GLADIA_API_KEY!,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Gladia API error: ${response.status}`);
    }

    const result = await response.json();

    // Gladia يرجع النص في result.prediction أو result.transcription
    const transcription = result.prediction?.[0]?.transcription ||
                         result.transcription ||
                         'لم أتمكن من فهم ما قلته';

    return transcription;
  } catch (error) {
    console.error('Error in speechToText:', error);
    // fallback للمحاكاة في حالة الخطأ
    return 'مرحباً، كيف يمكنني مساعدتك؟';
  }
}

async function processWithAI(text: string, agentId: string): Promise<string> {
  try {
    // جلب المعرفة والأسئلة الشائعة
    const { data: faqs } = await database.faqs.getByAgentId(agentId);
    const { data: knowledge } = await database.knowledgeFiles.getByAgentId(agentId);

    // البحث في الأسئلة الشائعة أولاً
    const activeFaqs = faqs?.filter(faq => faq.is_active) || [];
    const matchingFaq = activeFaqs.find(faq =>
      text.toLowerCase().includes(faq.question.toLowerCase()) ||
      faq.question.toLowerCase().includes(text.toLowerCase())
    );

    if (matchingFaq) {
      return matchingFaq.answer;
    }

    // إعداد السياق من المعرفة
    const knowledgeContext = knowledge?.map(k => k.content).join('\n\n') || '';

    // إعداد prompt لـ Gemini
    const prompt = `
أنت مساعد ذكي مفيد. استخدم المعلومات التالية للإجابة على السؤال:

المعرفة المتاحة:
${knowledgeContext}

الأسئلة الشائعة:
${activeFaqs.map(faq => `س: ${faq.question}\nج: ${faq.answer}`).join('\n\n')}

السؤال: ${text}

تعليمات:
- أجب باللغة العربية
- كن مفيداً ومهذباً
- إذا لم تجد إجابة في المعرفة المتاحة، قل ذلك بوضوح
- اجعل إجابتك مختصرة ومفيدة
`;

    // استدعاء Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text ||
                      'عذراً، لم أتمكن من معالجة سؤالك في الوقت الحالي.';

    return aiResponse;
  } catch (error) {
    console.error('Error in processWithAI:', error);
    // fallback للإجابات الأساسية
    if (text.includes('ساعات العمل') || text.includes('وقت العمل')) {
      return 'نعمل من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً بتوقيت الرياض.';
    }
    if (text.includes('التواصل') || text.includes('الاتصال')) {
      return 'يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف أو من خلال هذا المساعد الذكي.';
    }

    return 'شكراً لك على سؤالك. سأحاول مساعدتك بأفضل ما أستطيع. هل يمكنك توضيح سؤالك أكثر؟';
  }
}

async function textToSpeech(text: string, voiceId: string, agentId: string): Promise<string> {
  try {
    // استخدام Speechify Streaming TTS API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/text-to-speech/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId, agentId }),
    });

    if (!response.ok) {
      console.warn('Speechify Streaming failed, falling back to regular TTS');
      // Fallback to regular TTS API
      const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId, agentId }),
      });

      if (!fallbackResponse.ok) {
        throw new Error(`Fallback TTS API error: ${fallbackResponse.status}`);
      }

      const fallbackResult = await fallbackResponse.json();
      
      if (!fallbackResult.success || !fallbackResult.data.audioData) {
        throw new Error('Invalid audio data from fallback TTS API');
      }

      // إرجاع البيانات الصوتية بصيغة data URL
      const audioData = fallbackResult.data.audioData;
      return `data:${audioData.mimeType};base64,${audioData.data}`;
    }

    // تحويل الاستجابة المتدفقة إلى blob
    const audioBlob = await response.blob();
    
    // تحويل blob إلى data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    console.error('Error in TTS:', error);
    // fallback للمحاكاة
    return `data:audio/mp3;base64,${Buffer.from(text).toString('base64')}`;
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;
    const agentId = formData.get('agentId') as string;

    if (!audioFile || !sessionId || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // جلب تكوين البوت
    const { data: config } = await database.botConfigs.getByAgentId(agentId);
    if (!config) {
      return NextResponse.json(
        { error: 'Bot configuration not found' },
        { 
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // 1. تحويل الصوت إلى نص
    const audioBlob = new Blob([await audioFile.arrayBuffer()]);
    const userText = await speechToText(audioBlob);

    // 2. معالجة النص بالذكاء الاصطناعي
    const botResponse = await processWithAI(userText, agentId);

    // 3. تحويل الرد إلى صوت باستخدام Speechify Streaming
    const audioUrl = await textToSpeech(botResponse, config.voice_id, agentId);

    // 4. حفظ الرسائل في قاعدة البيانات
    await database.conversations.addMessage({
      session_id: sessionId,
      role: 'user',
      text: userText,
    });

    await database.conversations.addMessage({
      session_id: sessionId,
      role: 'bot',
      text: botResponse,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userText,
        botResponse,
        audioUrl,
      }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice input' },
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