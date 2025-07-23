import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { supabase, database } from '@/lib/supabase';

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

/**
 * API لبدء جلسة محادثة صوتية جديدة
 * 
 * تقوم هذه الواجهة بإنشاء جلسة جديدة في قاعدة البيانات وإرجاع معرف الجلسة
 */
export async function POST(request: NextRequest) {
  try {
    // استخراج معرف العميل من الطلب
    const formData = await request.formData();
    const agentId = formData.get('agentId')?.toString();

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'معرف العميل مطلوب' },
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // إنشاء معرف جلسة جديد
    const sessionId = `session_${uuidv4()}`;

    // تخزين الجلسة في قاعدة البيانات
    const { data, error } = await database.conversations.create({
      session_id: sessionId,
      agent_id: agentId,
      started_at: new Date().toISOString(),
      message_count: 0,
      user_location: null, // يمكن تحديثه لاحقًا إذا كانت هناك معلومات موقع
    });

    if (error) {
      console.error('Error creating conversation session:', error);
      return NextResponse.json(
        { success: false, error: 'فشل في إنشاء جلسة المحادثة' },
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // إرجاع معرف الجلسة
    return NextResponse.json({
      success: true,
      data: { sessionId }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in voice session start:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء بدء جلسة المحادثة' },
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