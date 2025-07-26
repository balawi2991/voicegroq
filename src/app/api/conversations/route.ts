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
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const conversationId = searchParams.get('conversationId');
    
    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'معرف الوكيل مطلوب' },
        { status: 400, headers: corsHeaders }
      );
    }

    // إذا تم تمرير conversationId، إرجاع تفاصيل محادثة واحدة
    if (conversationId) {
      // جلب تفاصيل المحادثة
      const { data: conversations, error: conversationError } = await database.conversations.getByAgentId(agentId);
      
      if (conversationError) {
        console.error('Error fetching conversation:', conversationError);
        return NextResponse.json(
          { success: false, error: 'فشل في جلب المحادثة' },
          { status: 500, headers: corsHeaders }
        );
      }

      // البحث عن المحادثة المطلوبة
      const conversation = conversations.find(c => c.session_id === conversationId || c.id === conversationId);
      
      if (!conversation) {
        return NextResponse.json(
          { success: false, error: 'المحادثة غير موجودة' },
          { status: 404, headers: corsHeaders }
        );
      }

      // جلب الرسائل
      const { data: messages, error: messagesError } = await database.conversations.getMessagesBySessionId(conversation.session_id);
      
      if (messagesError) {
        console.error('Error fetching conversation messages:', messagesError);
        return NextResponse.json(
          { success: false, error: 'فشل في جلب رسائل المحادثة' },
          { status: 500, headers: corsHeaders }
        );
      }

      // حساب مدة المحادثة
      let duration = 0;
      if (conversation.started_at && conversation.ended_at) {
        duration = new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime();
      } else if (conversation.started_at && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        duration = new Date(lastMessage.timestamp).getTime() - new Date(conversation.started_at).getTime();
      }
      
      // تحويل المدة من ميلي ثانية إلى دقائق
      const durationInMinutes = Math.round(duration / (1000 * 60));

      return NextResponse.json(
        { 
          success: true, 
          data: {
            id: conversation.id,
            sessionId: conversation.session_id,
            createdAt: conversation.started_at,
            endedAt: conversation.ended_at,
            duration: durationInMinutes,
            messageCount: messages.length,
            messages 
          }
        },
        { headers: corsHeaders }
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

    // تحويل البيانات لتتناسب مع واجهة المستخدم
    const formattedConversations = conversations.map(conversation => {
      const messages = conversation.conversation_messages || [];
      const messageCount = messages.length;
      
      // الحصول على أول رسالة (أي نوع) وآخر رد من البوت
      const sortedMessages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstMessage = sortedMessages[0]; // أول رسالة بأي نوع (قد تكون ترحيبية من البوت)
      const lastBotMessage = messages.filter(msg => msg.message_type === 'bot').pop();
      
      // حساب مدة المحادثة
      let duration = 0;
      if (conversation.started_at && conversation.ended_at) {
        duration = new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime();
      } else if (conversation.started_at && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        duration = new Date(lastMessage.timestamp).getTime() - new Date(conversation.started_at).getTime();
      }
      
      // تحويل المدة من ميلي ثانية إلى دقائق
      const durationInMinutes = Math.round(duration / (1000 * 60));
      
      return {
        id: conversation.id,
        sessionId: conversation.session_id,
        createdAt: conversation.started_at,
        endedAt: conversation.ended_at,
        messageCount,
        firstMessage: firstMessage ? {
          content: firstMessage.content,
          timestamp: firstMessage.timestamp
        } : null,
        lastBotMessage: lastBotMessage ? {
          content: lastBotMessage.content,
          timestamp: lastBotMessage.timestamp
        } : null,
        duration: durationInMinutes,
        satisfaction: conversation.user_satisfaction,
        isActive: !conversation.ended_at
      };
    });

    return NextResponse.json(
      { success: true, data: formattedConversations },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Conversations API error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500, headers: corsHeaders }
    );
  }
}