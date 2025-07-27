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

    const { data, error } = await database.knowledgeFiles.getByAgentId(agentId);

    if (error) {
      console.error('Error fetching knowledge files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch knowledge files' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Knowledge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const { fileName, fileType, content, fileSize } = body;

    if (!fileName || !fileType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // معالجة المحتوى حسب نوع الملف
    let processedContent = content;
    let status = 'ready';

    if (fileType === 'pdf') {
      // للملفات PDF، نحفظ المحتوى كما هو (base64)
      // في المستقبل يمكن إضافة استخراج النص من PDF هنا
      processedContent = content;
      status = 'ready'; // أو 'processing' إذا كنا نريد معالجة لاحقة
    } else {
      // للملفات النصية، نتأكد من أن المحتوى نص صالح
      if (typeof content !== 'string') {
        return NextResponse.json(
          { error: 'Invalid content format for text file' },
          { status: 400 }
        );
      }
      processedContent = content;
    }

    const { data, error } = await database.knowledgeFiles.create({
      agent_id: agentId,
      filename: fileName,
      file_type: fileType,
      content: processedContent,
      file_size: fileSize || 0,
      status: status
    });

    if (error) {
      console.error('Error creating knowledge file:', error);
      return NextResponse.json(
        { error: 'Failed to create knowledge file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Knowledge POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!agentId || !fileId) {
      return NextResponse.json(
        { error: 'Agent ID and File ID are required' },
        { status: 400 }
      );
    }

    const { error } = await database.knowledgeFiles.delete(fileId);

    if (error) {
      console.error('Error deleting knowledge file:', error);
      return NextResponse.json(
        { error: 'Failed to delete knowledge file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Knowledge DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
