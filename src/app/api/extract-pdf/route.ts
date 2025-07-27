import { NextRequest, NextResponse } from 'next/server';

// سيتم تحميل pdf-parse بشكل ديناميكي في دالة POST

/**
 * دالة لتنظيف النص المستخرج من PDF
 * تزيل الرموز غير المفهومة والترميز الخاطئ
 */
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  return text
    // إزالة الرموز المعطوبة والترميز الخاطئ
    .replace(/\uFFFD/g, '') // إزالة رمز الاستبدال Unicode
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // إزالة رموز التحكم
    .replace(/\s+/g, ' ') // توحيد المسافات
    .replace(/\n\s*\n/g, '\n\n') // الحفاظ على الفقرات
    .replace(/[^\u0000-\u007F\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '') // الحفاظ على الأحرف الإنجليزية والعربية فقط
    .trim();
}

/**
 * دالة لاستخراج النص من PDF مع تحسينات إضافية
 */
async function extractTextFromPDF(buffer: Buffer, pdfParseLib: any): Promise<{ text: string; pages: number; info?: any }> {
  try {
    // استخراج النص من PDF مع خيارات محسنة
    const data = await pdfParseLib(buffer, {
      // تحسين استخراج النص
      normalizeWhitespace: false,
      disableCombineTextItems: false,
      max: 0 // لا حد أقصى للصفحات
    });
    
    // تنظيف النص المستخرج
    const cleanedText = cleanExtractedText(data.text);
    
    return {
      text: cleanedText,
      pages: data.numpages || 0,
      info: data.info || {}
    };
    
  } catch (error) {
    console.error('خطأ في استخراج النص من PDF:', error);
    throw new Error('فشل في قراءة ملف PDF. قد يكون الملف تالفاً أو محمياً بكلمة مرور.');
  }
}

export async function POST(request: NextRequest) {
  try {
    // محاولة تحميل pdf-parse
    let pdfParse;
    try {
      const pdfParseModule = await import('pdf-parse');
      pdfParse = pdfParseModule.default;
      console.log('تم تحميل pdf-parse بنجاح');
    } catch (error) {
      console.error('خطأ في تحميل pdf-parse:', error);
      return NextResponse.json(
        { error: 'مكتبة استخراج PDF غير متوفرة' },
        { status: 503 }
      );
    }

    if (!pdfParse) {
      return NextResponse.json(
        { error: 'مكتبة استخراج PDF غير متوفرة' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم العثور على ملف' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. يجب أن يكون PDF' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف (حد أقصى 50 ميجابايت)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى المسموح 50 ميجابايت.' },
        { status: 400 }
      );
    }

    // تحويل الملف إلى Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // استخراج النص من PDF
      const { text, pages, info } = await extractTextFromPDF(buffer, pdfParse);
      
      // التحقق من وجود نص قابل للقراءة
      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'تعذر قراءة هذا الملف. يرجى رفع نسخة تحتوي على نص قابل للنسخ.',
            extractedText: '',
            pages: pages
          },
          { status: 400 }
        );
      }

      // التحقق من أن النص يحتوي على محتوى مفيد (أكثر من 10 أحرف)
      if (text.trim().length < 10) {
        return NextResponse.json(
          { 
            error: 'الملف لا يحتوي على نص كافٍ للمعالجة. يرجى التأكد من أن الملف يحتوي على نص قابل للنسخ.',
            extractedText: text,
            pages: pages
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        extractedText: text,
        pages: pages,
        fileSize: file.size,
        fileName: file.name,
        info: info || {}
      });

    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json(
        { 
          error: pdfError instanceof Error ? pdfError.message : 'تعذر قراءة هذا الملف. يرجى رفع نسخة تحتوي على نص قابل للنسخ.',
          details: pdfError instanceof Error ? pdfError.message : 'خطأ غير معروف'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Extract PDF API error:', error);
    return NextResponse.json(
      { 
        error: 'خطأ داخلي في الخادم أثناء معالجة الملف',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}