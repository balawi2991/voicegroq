import { NextRequest, NextResponse } from 'next/server';
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
 * API لإنهاء جلسة محادثة صوتية
 * 
 * تقوم هذه الواجهة بتحديث حقل ended_at في جدول المحادثات
 */
export async function POST(request: NextRequest) {
  try {
    // استخراج معرف الجلسة من الطلب
    const formData = await request.formData();
    const sessionId = formData.get('sessionId')?.toString();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'معرف الجلسة مطلوب' },
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // تحديث الجلسة في قاعدة البيانات
    const { data, error } = await supabase
      .from('conversations')
      .update({
        ended_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending conversation session:', error);
      return NextResponse.json(
        { success: false, error: 'فشل في إنهاء جلسة المحادثة' },
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );
    }

    // إرجاع نجاح العملية
    return NextResponse.json({
      success: true,
      data: { sessionId, endedAt: data.ended_at }
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in voice session end:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء إنهاء جلسة المحادثة' },
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