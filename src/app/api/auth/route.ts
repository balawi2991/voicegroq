import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';
import bcrypt from 'bcryptjs';

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

// تسجيل الدخول
export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json();

    if (action === 'signin') {
      // تسجيل الدخول
      const { data: user, error } = await database.users.getByEmail(email);
      
      if (error || !user) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401, headers: corsHeaders }
        );
      }

      // التحقق من كلمة المرور (في التطبيق الحقيقي يجب استخدام bcrypt)
      if (user.password !== password) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
          { status: 401, headers: corsHeaders }
        );
      }

      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = user;
      
      return NextResponse.json(
        { success: true, user: userWithoutPassword },
        { headers: corsHeaders }
      );
    }

    if (action === 'signup') {
      // إنشاء حساب جديد
      const existingUser = await database.users.getByEmail(email);
      
      if (existingUser.data) {
        return NextResponse.json(
          { success: false, error: 'البريد الإلكتروني مستخدم بالفعل' },
          { status: 400, headers: corsHeaders }
        );
      }

      // إنشاء agent_id فريد
      const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // إنشاء المستخدم
      const { data: newUser, error: userError } = await database.users.create({
        email,
        agent_id: agentId,
        name,
        password // في التطبيق الحقيقي يجب تشفير كلمة المرور
      });

      if (userError) {
        return NextResponse.json(
          { success: false, error: 'فشل في إنشاء الحساب' },
          { status: 500, headers: corsHeaders }
        );
      }

      // إنشاء تكوين افتراضي للبوت
      await database.botConfigs.upsert({
        agent_id: agentId,
        bot_name: 'مساعد ذكي',
        welcome_message: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        voice_id: 'ar-male-1',
      });

      // إرجاع بيانات المستخدم بدون كلمة المرور
      const { password: _, ...userWithoutPassword } = newUser;
      
      return NextResponse.json(
        { success: true, user: userWithoutPassword },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, error: 'إجراء غير صالح' },
      { status: 400, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// تحديث الملف الشخصي
export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: updatedUser, error } = await database.users.update(userId, updates);

    if (error) {
      return NextResponse.json(
        { success: false, error: 'فشل في تحديث الملف الشخصي' },
        { status: 500, headers: corsHeaders }
      );
    }

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json(
      { success: true, user: userWithoutPassword },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500, headers: corsHeaders }
    );
  }
}