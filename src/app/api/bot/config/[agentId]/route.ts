import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // جلب تكوين البوت
    const { data: config, error } = await database.botConfigs.getByAgentId(agentId);

    if (error) {
      console.error('Error fetching bot config:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bot configuration' },
        { status: 500 }
      );
    }

    if (!config) {
      // إنشاء تكوين افتراضي إذا لم يوجد
      const defaultConfig = {
        agent_id: agentId,
        bot_name: 'مساعد ذكي',
        welcome_message: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        voice_id: 'ar-male-1',
        avatar_url: null,
        avatar_emoji: '🤖',
      };

      const { data: newConfig, error: createError } = await database.botConfigs.upsert(defaultConfig);

      if (createError) {
        console.error('Error creating default config:', createError);
        return NextResponse.json(
          { error: 'Failed to create bot configuration' },
          { status: 500 }
        );
      }

      // تحويل أسماء الحقول للواجهة الأمامية
    const frontendConfig = {
      ...newConfig,
      name: newConfig.bot_name,
      avatar_emoji: newConfig.avatar_emoji,
      voice_id: newConfig.voice_id,
      welcome_message: newConfig.welcome_message,
      avatar_url: newConfig.avatar_url
    };
    
    const response = NextResponse.json({
      success: true,
      data: frontendConfig
    });
    
    // إضافة headers للـ CORS وترميز UTF-8
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, Expires');
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    // إضافة headers لمنع التخزين المؤقت
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;
    }

    // تحويل أسماء الحقول للواجهة الأمامية
    const frontendConfig = {
      ...config,
      name: config.bot_name,
      avatar_emoji: config.avatar_emoji,
      voice_id: config.voice_id,
      welcome_message: config.welcome_message,
      avatar_url: config.avatar_url
    };
    
    const response = NextResponse.json({
      success: true,
      data: frontendConfig
    });
    
    // إضافة headers للـ CORS وترميز UTF-8
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, Expires');
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    // إضافة headers لمنع التخزين المؤقت
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Last-Modified', new Date().toUTCString());
    
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const body = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    console.log('Received body:', JSON.stringify(body, null, 2));
    
    // تحديث تكوين البوت
    const updateData = {
      agent_id: agentId,
      bot_name: body.name || 'مساعد ذكي',
      welcome_message: body.welcome_message || '',
      primary_color: body.primary_color || '#3B82F6',
      secondary_color: body.secondary_color || '#1E40AF',
      voice_id: body.voice_id || 'ar-male-1',
      avatar_url: body.avatar_url || null,
      avatar_emoji: body.avatar_emoji || '🤖',
    };
    
    console.log('Update data:', JSON.stringify(updateData, null, 2));

    const { data: config, error } = await database.botConfigs.upsert(updateData);

    if (error) {
      console.error('Error updating bot config:', error);
      return NextResponse.json(
        { error: 'Failed to update bot configuration' },
        { status: 500 }
      );
    }

    // تحويل أسماء الحقول للواجهة الأمامية
    const frontendConfig = {
      ...config,
      name: config.bot_name,
      avatar_emoji: config.avatar_emoji,
      voice_id: config.voice_id,
      welcome_message: config.welcome_message,
      avatar_url: config.avatar_url
    };
    
    const response = NextResponse.json({
      success: true,
      data: frontendConfig
    });
    
    // إضافة headers للـ CORS وترميز UTF-8
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, Expires');
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// إضافة دعم OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, Pragma, Expires',
    },
  });
}
