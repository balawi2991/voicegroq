# أفضل الممارسات التقنية للصوت في المتصفح والـ APIs

## 🎙️ تسجيل الصوت في المتصفح

### 1. استخدام MediaRecorder API

```typescript
class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      // طلب إذن الوصول للميكروفون
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // إنشاء MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      // معالجة البيانات المسجلة
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // بدء التسجيل
      this.mediaRecorder.start(100); // chunk كل 100ms
      
    } catch (error) {
      console.error('فشل في بدء التسجيل:', error);
      throw new Error('لا يمكن الوصول للميكروفون');
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('لا يوجد تسجيل نشط'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: 'audio/webm;codecs=opus' 
        });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
    this.mediaRecorder = null;
  }
}
```

### 2. التعامل مع أذونات المتصفح

```typescript
class PermissionManager {
  static async checkMicrophonePermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ 
        name: 'microphone' as PermissionName 
      });
      return result.state === 'granted';
    } catch (error) {
      console.warn('لا يمكن التحقق من أذونات الميكروفون:', error);
      return false;
    }
  }

  static async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('تم رفض إذن الميكروفون:', error);
      return false;
    }
  }
}
```

## 🔊 تشغيل الصوت المتقدم

### 1. استخدام Web Audio API

```typescript
class AdvancedAudioPlayer {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.analyserNode = this.audioContext.createAnalyser();
    
    // ربط العقد
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
  }

  async playAudioBuffer(audioData: ArrayBuffer): Promise<void> {
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const sourceNode = this.audioContext.createBufferSource();
      
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(this.gainNode);
      
      return new Promise((resolve, reject) => {
        sourceNode.onended = () => resolve();
        sourceNode.onerror = reject;
        sourceNode.start();
      });
    } catch (error) {
      console.error('فشل في تشغيل الصوت:', error);
      throw error;
    }
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  getFrequencyData(): Uint8Array {
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }
}
```

### 2. معالجة الصوت في الوقت الفعلي

```typescript
class RealTimeAudioProcessor {
  private audioContext: AudioContext;
  private workletNode: AudioWorkletNode | null = null;

  constructor() {
    this.audioContext = new AudioContext();
  }

  async initializeWorklet(): Promise<void> {
    try {
      // تحميل Audio Worklet
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
      
      this.workletNode = new AudioWorkletNode(
        this.audioContext, 
        'audio-processor'
      );
      
      // معالجة الرسائل من الـ worklet
      this.workletNode.port.onmessage = (event) => {
        console.log('معالجة صوتية:', event.data);
      };
      
    } catch (error) {
      console.error('فشل في تحميل Audio Worklet:', error);
    }
  }

  processAudioStream(stream: MediaStream): void {
    if (!this.workletNode) {
      throw new Error('Audio Worklet غير مهيأ');
    }

    const sourceNode = this.audioContext.createMediaStreamSource(stream);
    sourceNode.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);
  }
}
```

## 🌐 أفضل الممارسات للـ APIs

### 1. تصميم RESTful APIs

```typescript
// بنية API منظمة
const API_ROUTES = {
  // Voice APIs
  VOICE: {
    TTS: '/api/voice/text-to-speech',
    TTS_STREAM: '/api/voice/text-to-speech/stream',
    STT: '/api/voice/speech-to-text',
    PROCESS: '/api/voice/process'
  },
  
  // Bot APIs
  BOT: {
    CONFIG: '/api/bot/config',
    // WELCOME_AUDIO: '/api/bot/welcome-audio', // تم إزالته - الآن نستخدم Simba Multilingual API مباشرة
    SESSION: '/api/bot/session'
  }
};

// معالج API موحد
class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL = '', headers = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }
}

class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}
```

### 2. إدارة الحالة والتخزين المؤقت

```typescript
class AudioCache {
  private cache = new Map<string, ArrayBuffer>();
  private maxSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  set(key: string, data: ArrayBuffer): void {
    // تنظيف الذاكرة إذا تجاوزت الحد الأقصى
    while (this.currentSize + data.byteLength > this.maxSize && this.cache.size > 0) {
      const firstKey = this.cache.keys().next().value;
      const firstData = this.cache.get(firstKey)!;
      this.cache.delete(firstKey);
      this.currentSize -= firstData.byteLength;
    }

    this.cache.set(key, data);
    this.currentSize += data.byteLength;
  }

  get(key: string): ArrayBuffer | undefined {
    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats(): { size: number; count: number; maxSize: number } {
    return {
      size: this.currentSize,
      count: this.cache.size,
      maxSize: this.maxSize
    };
  }
}
```

### 3. معالجة الأخطاء المتقدمة

```typescript
class ErrorHandler {
  static handleAudioError(error: any): string {
    if (error.name === 'NotAllowedError') {
      return 'تم رفض إذن الوصول للميكروفون';
    }
    
    if (error.name === 'NotFoundError') {
      return 'لم يتم العثور على ميكروفون';
    }
    
    if (error.name === 'NotSupportedError') {
      return 'المتصفح لا يدعم تسجيل الصوت';
    }
    
    if (error.name === 'AbortError') {
      return 'تم إلغاء عملية التسجيل';
    }
    
    return 'حدث خطأ غير متوقع في النظام الصوتي';
  }

  static handleAPIError(error: any): string {
    if (error.status === 429) {
      return 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً';
    }
    
    if (error.status === 401) {
      return 'غير مصرح بالوصول';
    }
    
    if (error.status === 500) {
      return 'خطأ في الخادم، يرجى المحاولة لاحقاً';
    }
    
    if (error.status >= 400 && error.status < 500) {
      return 'خطأ في الطلب';
    }
    
    return 'خطأ في الاتصال بالخادم';
  }
}
```

## 🔒 الأمان وأفضل الممارسات

### 1. حماية API Keys

```typescript
// في الـ backend فقط
const config = {
  groq: {
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1'
  }
};

// التحقق من وجود المفاتيح
if (!config.groq.apiKey) {
  throw new Error('GROQ_API_KEY is required');
}
```

### 2. تحديد معدل الطلبات (Rate Limiting)

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests = 100, timeWindowMs = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];
    
    // إزالة الطلبات القديمة
    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(clientId, validRequests);
    return true;
  }
}
```

### 3. تشفير البيانات الحساسة

```typescript
class DataEncryption {
  static async encryptAudioData(data: ArrayBuffer, key: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      data
    );
    
    // دمج IV مع البيانات المشفرة
    const result = new Uint8Array(iv.length + encryptedData.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedData), iv.length);
    
    return result.buffer;
  }
}
```

## 📱 التوافق مع الأجهزة المختلفة

### 1. اكتشاف نوع الجهاز

```typescript
class DeviceDetector {
  static isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  static isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  static supportsWebAudio(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  static supportsMediaRecorder(): boolean {
    return !!window.MediaRecorder;
  }

  static getOptimalAudioSettings() {
    if (this.isMobile()) {
      return {
        sampleRate: 22050,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      };
    }
    
    return {
      sampleRate: 44100,
      channelCount: 2,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    };
  }
}
```

### 2. معالجة خاصة للـ iOS

```typescript
class IOSAudioHandler {
  static async initializeAudioContext(): Promise<AudioContext> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // iOS يتطلب تفاعل المستخدم لتفعيل AudioContext
    if (audioContext.state === 'suspended') {
      await this.waitForUserInteraction();
      await audioContext.resume();
    }
    
    return audioContext;
  }

  private static waitForUserInteraction(): Promise<void> {
    return new Promise((resolve) => {
      const handleInteraction = () => {
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('click', handleInteraction);
        resolve();
      };
      
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('click', handleInteraction);
    });
  }
}
```

## 🧪 اختبار الأداء

### 1. قياس زمن الاستجابة

```typescript
class PerformanceMonitor {
  private static measurements = new Map<string, number[]>();

  static startMeasurement(name: string): string {
    const id = `${name}-${Date.now()}-${Math.random()}`;
    performance.mark(`${id}-start`);
    return id;
  }

  static endMeasurement(id: string): number {
    performance.mark(`${id}-end`);
    performance.measure(id, `${id}-start`, `${id}-end`);
    
    const measure = performance.getEntriesByName(id)[0];
    const duration = measure.duration;
    
    // تخزين القياسات للتحليل
    const name = id.split('-')[0];
    const measurements = this.measurements.get(name) || [];
    measurements.push(duration);
    this.measurements.set(name, measurements);
    
    // تنظيف
    performance.clearMarks(`${id}-start`);
    performance.clearMarks(`${id}-end`);
    performance.clearMeasures(id);
    
    return duration;
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return null;
    
    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: measurements.reduce((a, b) => a + b) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)]
    };
  }
}
```

### 2. مراقبة استهلاك الذاكرة

```typescript
class MemoryMonitor {
  static getCurrentUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  static trackMemoryUsage<T>(fn: () => Promise<T>, name: string): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const before = this.getCurrentUsage();
      
      try {
        const result = await fn();
        const after = this.getCurrentUsage();
        
        console.log(`استهلاك الذاكرة [${name}]: ${after - before} bytes`);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
}
```

---

**الخلاصة**: هذه الممارسات تضمن بناء تطبيقات صوتية قوية وموثوقة تعمل بكفاءة عبر جميع المتصفحات والأجهزة مع الحفاظ على الأمان والأداء العالي.