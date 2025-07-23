// أنواع البيانات الأساسية لسند بوت

export interface User {
  id: string;
  email: string;
  agentId: string;
  createdAt: string;
}

export interface BotConfig {
  agentId: string;
  name: string;
  avatarUrl?: string;
  avatarEmoji: string;
  voiceId: string;
  welcomeMessage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// الإيموجيات المتاحة للأفاتار
export const AVAILABLE_AVATARS = [
  { emoji: '🤖', name: 'روبوت' },
  { emoji: '👨‍💼', name: 'رجل أعمال' },
  { emoji: '👩‍💼', name: 'سيدة أعمال' },
  { emoji: '🧑‍💻', name: 'مطور' },
  { emoji: '👨‍🔬', name: 'عالم' },
  { emoji: '👩‍⚕️', name: 'طبيبة' },
  { emoji: '🎓', name: 'أكاديمي' },
  { emoji: '💼', name: 'مهني' },
  { emoji: '🌟', name: 'نجم' },
  { emoji: '💡', name: 'مبدع' },
];

export interface KnowledgeFile {
  id: string;
  agentId: string;
  fileName: string;
  fileType: 'pdf' | 'txt' | 'md';
  content: string;
  uploadedAt: string;
}

export interface FAQ {
  id: string;
  agentId: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  sessionId: string;
  agentId: string;
  startedAt: string;
  endedAt?: string;
  messageCount: number;
}

export interface ConversationMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface CustomTheme {
  background?: string;
  glass?: string;
  accent?: string;
}

export interface VoiceBotProps {
  agentId: string;
  mode?: 'embedded' | 'preview';
  size?: 'normal' | 'large';
  className?: string;
  customTheme?: CustomTheme;
}

export interface VoiceSession {
  sessionId: string;
  agentId: string;
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  messages: ConversationMessage[];
}

// أنواع API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VoiceProcessRequest {
  sessionId: string;
  agentId: string;
  audioBlob: Blob;
}

export interface VoiceProcessResponse {
  sessionId: string;
  userText: string;
  botResponse: string;
  audioUrl: string;
}

// أنواع التخصيص
export interface AppearanceSettings {
  name: string;
  avatarUrl?: string;
  buttonColor: string;
  voiceId: string;
  welcomeMessage?: string;
}

// تم إزالة ألوان الأزرار - لا نحتاجها في التصميم الجديد

// أنواع الأصوات المتاحة
export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: 'ar';
  preview?: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'ar-male-1',
    name: 'أحمد - صوت ذكوري هادئ',
    gender: 'male',
    language: 'ar',
  },
  {
    id: 'ar-female-1', 
    name: 'فاطمة - صوت أنثوي واضح',
    gender: 'female',
    language: 'ar',
  },
  {
    id: 'ar-male-2',
    name: 'محمد - صوت ذكوري دافئ',
    gender: 'male',
    language: 'ar',
  },
  {
    id: 'ar-female-2',
    name: 'عائشة - صوت أنثوي مرح',
    gender: 'female',
    language: 'ar',
  },
];
