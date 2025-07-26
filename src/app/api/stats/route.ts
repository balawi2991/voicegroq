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

export async function GET(request: NextRequest) {
  try {
    // الحصول على معرف المستخدم من localStorage (في التطبيق الحقيقي يجب استخدام JWT)
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('x-user-agent');
    
    // للحصول على agentId من query parameters أو headers
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'معرف الوكيل مطلوب' },
        { status: 400, headers: corsHeaders }
      );
    }

    // جلب جميع المحادثات للمستخدم
    const { data: conversations, error: conversationsError } = await database.conversations.getByAgentId(agentId);
    
    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json(
        { success: false, error: 'فشل في جلب المحادثات' },
        { status: 500, headers: corsHeaders }
      );
    }

    // حساب الإحصائيات
    const totalConversations = conversations.length;
    
    // حساب محادثات آخر 24 ساعة
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const todayConversations = conversations.filter(conv => 
      new Date(conv.started_at) >= twentyFourHoursAgo
    ).length;

    // حساب متوسط زمن الاستجابة
    let totalResponseTime = 0;
    let responseCount = 0;

    conversations.forEach(conversation => {
      if (conversation.conversation_messages && Array.isArray(conversation.conversation_messages)) {
        const messages = conversation.conversation_messages;
        
        for (let i = 0; i < messages.length - 1; i++) {
          const currentMessage = messages[i];
          const nextMessage = messages[i + 1];
          
          // إذا كانت الرسالة الحالية من المستخدم والتالية من البوت
          if (currentMessage.message_type === 'user' && nextMessage.message_type === 'bot') {
            const responseTime = new Date(nextMessage.timestamp).getTime() - new Date(currentMessage.timestamp).getTime();
            totalResponseTime += responseTime;
            responseCount++;
          }
        }
      }
    });

    const avgResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0; // بالثواني

    // حساب معدل الرضا (من التقييمات المتوفرة)
    const satisfactionRatings = conversations
      .filter(conv => conv.user_satisfaction !== null && conv.user_satisfaction !== undefined)
      .map(conv => conv.user_satisfaction);
    
    const satisfaction = satisfactionRatings.length > 0 
      ? Math.round((satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length) * 100)
      : 100; // افتراضي 100% إذا لم توجد تقييمات

    const stats = {
      totalConversations,
      todayConversations,
      avgResponseTime,
      satisfaction
    };

    return NextResponse.json(
      { success: true, data: stats },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500, headers: corsHeaders }
    );
  }
}