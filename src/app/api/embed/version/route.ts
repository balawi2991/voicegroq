import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // قراءة embed.js للحصول على الإصدار الحالي
    const embedPath = path.join(process.cwd(), 'public', 'embed.js');
    const embedContent = fs.readFileSync(embedPath, 'utf8');
    
    // استخراج رقم الإصدار
    const versionMatch = embedContent.match(/const SANAD_BOT_VERSION = '([^']+)'/);
    const version = versionMatch ? versionMatch[1] : '1.0.0';
    
    // معلومات إضافية
    const stats = fs.statSync(embedPath);
    const lastModified = stats.mtime.toISOString();
    
    return NextResponse.json({
      success: true,
      data: {
        version,
        lastModified,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting embed version:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get version info',
        data: {
          version: '1.0.0',
          lastModified: new Date().toISOString(),
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
