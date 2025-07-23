import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/supabase';

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
        name: 'مساعد ذكي',
        avatar_emoji: '🤖',
        voice_id: 'ar-male-1',
        is_active: true,
      };

      const { data: newConfig, error: createError } = await database.botConfigs.upsert(defaultConfig);

      if (createError) {
        console.error('Error creating default config:', createError);
        return NextResponse.json(
          { error: 'Failed to create bot configuration' },
          { status: 500 }
        );
      }

      const response = NextResponse.json({
      success: true,
      data: newConfig
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

    const response = NextResponse.json({
      success: true,
      data: config
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

    // تحديث تكوين البوت
    const updateData = {
      agent_id: agentId,
      name: body.name,
      avatar_emoji: body.avatar_emoji || '🤖',
      voice_id: body.voice_id,
      avatar_url: body.avatar_url,
      welcome_message: body.welcome_message,
      is_active: body.is_active !== undefined ? body.is_active : true,
      updated_at: new Date().toISOString(),
    };

    const { data: config, error } = await database.botConfigs.upsert(updateData);

    if (error) {
      console.error('Error updating bot config:', error);
      return NextResponse.json(
        { error: 'Failed to update bot configuration' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: config
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
