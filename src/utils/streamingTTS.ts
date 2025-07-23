/**
 * مساعد للتعامل مع Streaming Text-to-Speech API
 * يوفر وظائف لتشغيل الصوت المتدفق مع إدارة الذاكرة والأخطاء
 */

export interface StreamingTTSOptions {
  text: string;
  voiceId: string;
  onChunkReceived?: (chunk: Uint8Array) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface StreamingAudioPlayer {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

/**
 * فئة لإدارة تشغيل الصوت المتدفق
 */
export class StreamingTTSPlayer {
  private audioContext: AudioContext | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private chunks: Uint8Array[] = [];
  private isPlaying = false;
  private isPaused = false;
  private startTime = 0;
  private pauseTime = 0;

  constructor() {
    // إنشاء AudioContext عند الحاجة
    this.initAudioContext();
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('فشل في إنشاء AudioContext:', error);
    }
  }

  /**
   * تشغيل النص كصوت متدفق
   */
  async streamTextToSpeech(options: StreamingTTSOptions): Promise<void> {
    const { text, voiceId, onChunkReceived, onProgress, onError, onComplete } = options;

    try {
      const response = await fetch('/api/voice/text-to-speech/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!response.ok) {
        throw new Error(`فشل في الحصول على الصوت المتدفق: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('لا يوجد محتوى في الاستجابة');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalLength = 0;

      // قراءة البيانات المتدفقة
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          chunks.push(value);
          totalLength += value.length;
          
          // استدعاء callback للـ chunk الجديد
          onChunkReceived?.(value);
          
          // حساب التقدم (تقديري)
          const estimatedProgress = Math.min(totalLength / (text.length * 100), 0.9);
          onProgress?.(estimatedProgress);
        }
      }

      // دمج جميع الـ chunks
      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }

      // تشغيل الصوت
      await this.playAudioData(audioData);
      
      onProgress?.(1.0);
      onComplete?.();

    } catch (error) {
      console.error('خطأ في streaming TTS:', error);
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * تشغيل البيانات الصوتية
   */
  private async playAudioData(audioData: Uint8Array): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext غير متاح');
    }

    try {
      // فك تشفير البيانات الصوتية
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
      
      // إنشاء source node
      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.audioContext.destination);
      
      // تشغيل الصوت
      return new Promise((resolve, reject) => {
        sourceNode.onended = () => {
          this.isPlaying = false;
          resolve();
        };
        
        sourceNode.onerror = (error) => {
          this.isPlaying = false;
          reject(error);
        };
        
        this.sourceNode = sourceNode;
        this.isPlaying = true;
        this.startTime = this.audioContext!.currentTime;
        
        sourceNode.start();
      });
    } catch (error) {
      console.error('فشل في تشغيل البيانات الصوتية:', error);
      throw error;
    }
  }

  /**
   * إيقاف التشغيل
   */
  stop(): void {
    if (this.sourceNode && this.isPlaying) {
      this.sourceNode.stop();
      this.sourceNode = null;
      this.isPlaying = false;
      this.isPaused = false;
    }
  }

  /**
   * تنظيف الموارد
   */
  dispose(): void {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.chunks = [];
  }

  /**
   * الحصول على حالة التشغيل
   */
  get playing(): boolean {
    return this.isPlaying;
  }
}

/**
 * دالة مساعدة لتشغيل النص كصوت متدفق بطريقة بسيطة
 */
export async function playStreamingTTS(
  text: string, 
  voiceId: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const player = new StreamingTTSPlayer();
  
  try {
    await player.streamTextToSpeech({
      text,
      voiceId,
      onProgress,
      onError: (error) => {
        console.error('خطأ في تشغيل الصوت المتدفق:', error);
      }
    });
  } finally {
    player.dispose();
  }
}

/**
 * دالة للتحقق من دعم المتصفح للـ streaming
 */
export function isStreamingSupported(): boolean {
  return (
    typeof ReadableStream !== 'undefined' &&
    typeof AudioContext !== 'undefined' &&
    typeof fetch !== 'undefined'
  );
}

/**
 * دالة fallback للأنظمة التي لا تدعم streaming
 */
export async function fallbackTextToSpeech(
  text: string, 
  voiceId: string
): Promise<string> {
  try {
    const response = await fetch('/api/voice/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      throw new Error(`فشل في تحويل النص إلى صوت: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.data.audioData) {
      throw new Error('لم يتم استلام بيانات صوتية صالحة');
    }

    // إنشاء ملف صوتي من البيانات الثنائية
    const audioData = result.data.audioData;
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('خطأ في fallback TTS:', error);
    throw error;
  }
}