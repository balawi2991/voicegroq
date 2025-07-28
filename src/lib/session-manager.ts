// إدارة جلسات المكالمات الصوتية مع تطبيق الحد الأقصى للمدة

interface SessionData {
  sessionId: string;
  agentId: string;
  startTime: number;
  maxDuration: number; // بالدقائق
  timeoutId: NodeJS.Timeout;
  isActive: boolean;
}

// تخزين الجلسات النشطة في الذاكرة
const activeSessions = new Map<string, SessionData>();

/**
 * بدء جلسة جديدة مع تطبيق الحد الأقصى للمدة
 */
export function startSession(sessionId: string, agentId: string, maxDuration: number): void {
  // إنهاء الجلسة السابقة إذا كانت موجودة
  if (activeSessions.has(sessionId)) {
    endSession(sessionId);
  }

  const startTime = Date.now();
  const timeoutDuration = maxDuration * 60 * 1000; // تحويل الدقائق إلى ميلي ثانية

  // إنشاء timeout لإنهاء الجلسة تلقائياً
  const timeoutId = setTimeout(async () => {
    console.log(`Session ${sessionId} timed out after ${maxDuration} minutes`);
    await handleSessionTimeout(sessionId);
  }, timeoutDuration);

  // حفظ بيانات الجلسة
  const sessionData: SessionData = {
    sessionId,
    agentId,
    startTime,
    maxDuration,
    timeoutId,
    isActive: true
  };

  activeSessions.set(sessionId, sessionData);
  console.log(`Session ${sessionId} started with ${maxDuration} minute timeout`);
}

/**
 * إنهاء جلسة يدوياً
 */
export function endSession(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return false;
  }

  // إلغاء timeout
  clearTimeout(session.timeoutId);
  
  // تحديث حالة الجلسة
  session.isActive = false;
  
  // إزالة الجلسة من الذاكرة
  activeSessions.delete(sessionId);
  
  console.log(`Session ${sessionId} ended manually`);
  return true;
}

/**
 * التحقق من حالة الجلسة
 */
export function isSessionActive(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  return session ? session.isActive : false;
}

/**
 * الحصول على الوقت المتبقي للجلسة (بالثواني)
 */
export function getRemainingTime(sessionId: string): number {
  const session = activeSessions.get(sessionId);
  if (!session || !session.isActive) {
    return 0;
  }

  const elapsed = Date.now() - session.startTime;
  const maxDurationMs = session.maxDuration * 60 * 1000;
  const remaining = Math.max(0, maxDurationMs - elapsed);
  
  return Math.floor(remaining / 1000); // إرجاع بالثواني
}

/**
 * الحصول على مدة الجلسة الحالية (بالثواني)
 */
export function getSessionDuration(sessionId: string): number {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return 0;
  }

  const elapsed = Date.now() - session.startTime;
  return Math.floor(elapsed / 1000); // إرجاع بالثواني
}

/**
 * معالجة انتهاء مهلة الجلسة
 */
async function handleSessionTimeout(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return;
  }

  try {
    // إنهاء الجلسة في قاعدة البيانات
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/voice/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sessionId: sessionId,
        reason: 'timeout'
      })
    });

    if (!response.ok) {
      console.error(`Failed to end session ${sessionId} in database:`, response.status);
    }

    // إرسال رسالة إنهاء للعميل (إذا كان متصلاً)
    // يمكن تطوير هذا لاحقاً باستخدام WebSocket أو Server-Sent Events
    console.log(`Session ${sessionId} ended due to timeout`);
    
  } catch (error) {
    console.error(`Error handling session timeout for ${sessionId}:`, error);
  } finally {
    // إزالة الجلسة من الذاكرة
    activeSessions.delete(sessionId);
  }
}

/**
 * الحصول على جميع الجلسات النشطة (للمراقبة)
 */
export function getActiveSessions(): SessionData[] {
  return Array.from(activeSessions.values()).filter(session => session.isActive);
}

/**
 * تنظيف الجلسات المنتهية الصلاحية (يتم استدعاؤها دورياً)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  
  for (const [sessionId, session] of activeSessions.entries()) {
    const elapsed = now - session.startTime;
    const maxDurationMs = session.maxDuration * 60 * 1000;
    
    if (elapsed > maxDurationMs) {
      console.log(`Cleaning up expired session: ${sessionId}`);
      endSession(sessionId);
    }
  }
}

// تشغيل تنظيف دوري كل دقيقة
setInterval(cleanupExpiredSessions, 60000);