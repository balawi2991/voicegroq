import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';

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

// تحويل الصوت إلى نص باستخدام Groq Whisper API
async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    // التحقق من حجم الملف الصوتي
    if (audioBlob.size === 0) {
      console.warn('Empty audio blob received');
      return 'لم يتم تسجيل أي صوت، يرجى المحاولة مرة أخرى';
    }

    const formData = new FormData();
    // تحديد اسم الملف بناءً على نوع MIME
    let fileName = 'audio.wav';
    if (audioBlob.type) {
      if (audioBlob.type.includes('webm')) {
        fileName = 'audio.webm';
      } else if (audioBlob.type.includes('mpeg') || audioBlob.type.includes('mp3')) {
        fileName = 'audio.mp3';
      }
    }
    
    formData.append('file', audioBlob, fileName);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'ar'); // تعيين اللغة العربية كافتراضية
    
    console.log(`[STT] قبل الإرسال إلى Groq: ملف صوتي (${audioBlob.size} بايت، نوع: ${audioBlob.type || 'غير معروف'})`);
    
    // استخدام Groq Whisper API مع اكتشاف اللغة التلقائي
    const startTime = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY!}`,
      },
      body: formData
    });
    const responseTime = Date.now() - startTime;

    console.log(`[STT] استجابة Groq: status=${response.status}, time=${responseTime}ms`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[STT] خطأ في Groq Whisper API: ${response.status}`, errorText);
      throw new Error(`Groq Whisper API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // التحقق من وجود النص في الاستجابة
    if (!result.text) {
      console.warn('[STT] لا يوجد نص في استجابة Groq:', result);
      return 'لم أتمكن من فهم ما قلته';
    }
    
    console.log(`[STT] نتيجة Groq Whisper: ${JSON.stringify(result)}`);

    // Groq Whisper يرجع النص في result.text
    const transcription = result.text;
    console.log(`[STT] النص المستخرج: "${transcription}"`);

    return transcription;
  } catch (error) {
    console.error('[STT] خطأ في تحويل الصوت إلى نص:', error);
    // fallback للمحاكاة في حالة الخطأ
    return 'مرحباً، كيف يمكنني مساعدتك؟';
  }
}

async function processWithAI(text: string, agentId: string, sessionId: string): Promise<string> {
  try {
    console.log(`[AI] بدء معالجة النص: "${text}" للوكيل: ${agentId}, الجلسة: ${sessionId}`);
    
    // جلب المعرفة والأسئلة الشائعة
    const { data: faqs } = await database.faqs.getByAgentId(agentId);
    const { data: knowledge } = await database.knowledgeFiles.getByAgentId(agentId);
    
    console.log(`[AI] تم جلب ${faqs?.length || 0} سؤال شائع و ${knowledge?.length || 0} ملف معرفة`);
    
    // جلب الرسائل السابقة للجلسة الحالية
    const { data: previousMessages } = await database.conversations.getMessagesBySessionId(sessionId);
    console.log(`[AI] تم جلب ${previousMessages?.length || 0} رسالة سابقة للجلسة`);

    // البحث في الأسئلة الشائعة أولاً
    const activeFaqs = faqs?.filter(faq => faq.is_active) || [];
    const matchingFaq = activeFaqs.find(faq =>
      text.toLowerCase().includes(faq.question.toLowerCase()) ||
      faq.question.toLowerCase().includes(text.toLowerCase())
    );

    if (matchingFaq) {
      console.log(`[AI] تم العثور على سؤال شائع مطابق: "${matchingFaq.question}"`);
      return matchingFaq.answer;
    }

    // إعداد السياق من المعرفة
    const knowledgeContext = knowledge?.map(k => k.content).join('\n\n') || '';
    
    // إعداد سياق المحادثة السابقة
    const conversationHistory = previousMessages?.map(msg => 
      `${msg.message_type === 'user' ? 'المستخدم' : 'المساعد'}: ${msg.content}`
    ).join('\n') || '';

    // إعداد prompt لـ Gemini مع السياق الكامل
    const prompt = `
أنت مساعد ذكي مفيد. استخدم المعلومات التالية للإجابة على السؤال:

المعرفة المتاحة:
${knowledgeContext}

الأسئلة الشائعة:
${activeFaqs.map(faq => `س: ${faq.question}\nج: ${faq.answer}`).join('\n\n')}

${conversationHistory ? `سياق المحادثة السابقة:\n${conversationHistory}\n\n` : ''}السؤال الحالي: ${text}

تعليمات:
- أجب باللغة العربية
- كن مفيداً ومهذباً
- استخدم سياق المحادثة السابقة لفهم السؤال بشكل أفضل
- إذا لم تجد إجابة في المعرفة المتاحة، قل ذلك بوضوح
- اجعل إجابتك مختصرة ومفيدة
- إذا كان السؤال يتطلب معلومات من المحادثة السابقة، استخدمها في إجابتك
`;

    console.log(`[AI] قبل الإرسال إلى Gemini: طول النص ${prompt.length} حرف`);

    // استدعاء Gemini API
    const startTime = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
    const responseTime = Date.now() - startTime;

    console.log(`[AI] استجابة Gemini: status=${response.status}, time=${responseTime}ms`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error(`[AI] خطأ في Gemini API: ${response.status}`, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // التحقق من وجود استجابة صالحة
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0]) {
      console.warn('[AI] استجابة Gemini غير صالحة:', JSON.stringify(result));
      throw new Error('Invalid Gemini API response structure');
    }
    
    const aiResponse = result.candidates[0].content.parts[0].text ||
                      'عذراً، لم أتمكن من معالجة سؤالك في الوقت الحالي.';

    console.log(`[AI] استجابة Gemini: "${aiResponse.substring(0, 100)}${aiResponse.length > 100 ? '...' : ''}"`);
    return aiResponse;
  } catch (error) {
    console.error('[AI] خطأ في معالجة النص بالذكاء الاصطناعي:', error);
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
    console.log(`[TTS] بدء تحويل النص إلى صوت: طول النص ${text.length} حرف، الصوت: ${voiceId}`);
    
    // استخدام Groq Streaming TTS API
    console.log(`[TTS] قبل الإرسال إلى Groq Streaming TTS API`);
    const startTime = Date.now();
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/text-to-speech/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId, agentId }),
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`[TTS] استجابة Groq Streaming: status=${response.status}, time=${responseTime}ms`);

    if (!response.ok) {
      console.warn(`[TTS] فشل Groq Streaming (${response.status}), الرجوع إلى TTS العادي`);
      // Fallback to regular TTS API
      const fallbackStartTime = Date.now();
      const fallbackResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/voice/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId, agentId }),
      });
      const fallbackResponseTime = Date.now() - fallbackStartTime;
      
      console.log(`[TTS] استجابة TTS العادي: status=${fallbackResponse.status}, time=${fallbackResponseTime}ms`);

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text().catch(() => 'No error details');
        console.error(`[TTS] خطأ في TTS العادي: ${fallbackResponse.status}`, errorText);
        throw new Error(`Fallback TTS API error: ${fallbackResponse.status} - ${errorText}`);
      }

      const fallbackResult = await fallbackResponse.json();
      
      if (!fallbackResult.success || !fallbackResult.data.audioData) {
        console.error('[TTS] بيانات صوتية غير صالحة من TTS العادي:', fallbackResult);
        throw new Error('Invalid audio data from fallback TTS API');
      }

      // إرجاع البيانات الصوتية بصيغة data URL
      const audioData = fallbackResult.data.audioData;
      console.log(`[TTS] تم الحصول على بيانات صوتية من TTS العادي: نوع=${audioData.mimeType}, حجم=${audioData.data.length} حرف`);
      return `data:${audioData.mimeType};base64,${audioData.data}`;
    }

    // تحويل الاستجابة المتدفقة إلى blob
    const audioBlob = await response.blob();
    console.log(`[TTS] تم الحصول على blob من Groq Streaming: حجم=${audioBlob.size} بايت، نوع=${audioBlob.type || 'غير معروف'}`);
    
    // تحويل blob إلى data URL في بيئة Node.js
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = audioBlob.type || 'audio/mpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    console.log(`[TTS] تم تحويل blob إلى data URL بنجاح`);
    return dataUrl;
  } catch (error) {
    console.error('[TTS] خطأ في تحويل النص إلى صوت:', error);
    // fallback للمحاكاة
    console.log('[TTS] استخدام fallback للمحاكاة');
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
    console.log('[API] بدء معالجة طلب الصوت');
    
    // محاولة تحليل FormData مع معالجة الأخطاء
    let formData;
    try {
      formData = await request.formData();
      console.log('[API] تم تحليل FormData بنجاح');
    } catch (formError: any) {
      console.error('[API] خطأ في تحليل FormData:', formError.message);
      return Response.json({ 
        success: false, 
        error: 'Invalid form data format', 
        details: formError.message 
      }, { status: 400 });
    }

    // التحقق من الحقول المطلوبة
    const audioFile = formData.get('audio') as File;
    const sessionId = formData.get('sessionId') as string;
    const voiceId = formData.get('voiceId') as string;
    const agentId = formData.get('agentId') as string;
    const userId = formData.get('userId') as string;

    console.log(`[API] معلومات الطلب: sessionId=${sessionId}, voiceId=${voiceId}, agentId=${agentId}, userId=${userId}`);
    console.log(`[API] معلومات الملف الصوتي: اسم=${audioFile?.name || 'غير متوفر'}, حجم=${audioFile?.size || 0} بايت, نوع=${audioFile?.type || 'غير معروف'}`);

    if (!audioFile || !sessionId || !voiceId || !agentId) {
      console.error('[API] حقول مفقودة في الطلب:', { 
        audioFile: !!audioFile, 
        sessionId: !!sessionId, 
        voiceId: !!voiceId, 
        agentId: !!agentId, 
        userId: !!userId 
      });
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // التحقق من انتهاء الجلسة
    const { data: messages } = await database.conversations.getMessagesBySessionId(sessionId);
    const { data: conversations } = await database.conversations.getByAgentId(agentId);
    const session = conversations.find(conv => conv.session_id === sessionId);

    if (!session) {
      console.error(`[API] الجلسة غير موجودة: ${sessionId}`);
      return Response.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (session.ended_at) {
      console.error(`[API] الجلسة منتهية: ${sessionId}`);
      return Response.json({ success: false, error: 'Session has ended' }, { status: 400 });
    }

    // جلب تكوين البوت
    console.log(`[API] جلب تكوين البوت للوكيل: ${agentId}`);
    const { data: botConfig } = await database.botConfigs.getByAgentId(agentId);

    if (!botConfig) {
      console.error(`[API] تكوين البوت غير موجود للوكيل: ${agentId}`);
      return Response.json({ success: false, error: 'Bot configuration not found' }, { status: 404 });
    }

    // تحويل الصوت إلى نص
    console.log('[API] بدء تحويل الصوت إلى نص');
    const transcriptResult = await speechToText(audioFile);
    console.log(`[API] نتيجة تحويل الصوت إلى نص: ${transcriptResult.length} حرف`);

    // معالجة النص بالذكاء الاصطناعي
    console.log('[API] بدء معالجة النص بالذكاء الاصطناعي');
    const aiResponse = await processWithAI(transcriptResult, agentId, sessionId);
    console.log(`[API] نتيجة معالجة الذكاء الاصطناعي: ${aiResponse.length} حرف`);

    // تحويل الرد إلى صوت
    console.log('[API] بدء تحويل الرد إلى صوت');
    const audioData = await textToSpeech(aiResponse, voiceId, agentId);
    console.log('[API] تم الحصول على البيانات الصوتية بنجاح');

    // حفظ الرسائل في قاعدة البيانات
    console.log('[API] حفظ الرسائل في قاعدة البيانات');
    await database.conversations.addMessage({
      session_id: sessionId,
      message_type: 'user',
      content: transcriptResult,
      timestamp: new Date().toISOString(),
    });
    
    await database.conversations.addMessage({
      session_id: sessionId,
      message_type: 'bot',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // تم حفظ الرسائل بنجاح
    console.log('[API] تم حفظ الرسائل بنجاح');

    console.log('[API] اكتمال معالجة طلب الصوت بنجاح');
    return Response.json({
      success: true,
      data: {
        transcript: transcriptResult,
        response: aiResponse,
        audioData,
      },
    });
  } catch (error: any) {
    console.error('[API] خطأ في معالجة طلب الصوت:', error);
    // تسجيل تفاصيل الخطأ
    const errorDetails = {
      message: error.message || 'Unknown error',
      stack: error.stack || 'No stack trace',
      name: error.name || 'Error',
      cause: error.cause || 'Unknown cause',
    };
    console.error('[API] تفاصيل الخطأ:', JSON.stringify(errorDetails, null, 2));
    
    return Response.json(
      { 
        success: false, 
        error: error.message || 'An error occurred during voice processing',
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      }, 
      { status: 500 }
    );
  }
}