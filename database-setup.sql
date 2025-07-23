-- إعداد قاعدة البيانات لسند بوت
-- انسخ هذا الكود وشغله في Supabase SQL Editor

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    agent_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول تكوين البوت
CREATE TABLE IF NOT EXISTS public.bot_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT 'مساعد ذكي',
    avatar_url TEXT,
    avatar_emoji TEXT NOT NULL DEFAULT '🤖',
    voice_id TEXT NOT NULL DEFAULT 'ar-male-1',
    button_color TEXT NOT NULL DEFAULT '#3B82F6',
    welcome_message TEXT,

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة حقول جديدة للجداول الموجودة
ALTER TABLE public.bot_configs ADD COLUMN IF NOT EXISTS avatar_emoji TEXT DEFAULT '🤖';

-- إنشاء جدول ملفات المعرفة
CREATE TABLE IF NOT EXISTS public.knowledge_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'md')),
    file_size INTEGER,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الأسئلة الشائعة
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    message_count INTEGER DEFAULT 0,
    user_location TEXT,
    user_ip TEXT,
    user_agent TEXT
);

-- إنشاء جدول رسائل المحادثات
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    text TEXT NOT NULL,
    audio_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_users_agent_id ON public.users(agent_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_bot_configs_agent_id ON public.bot_configs(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_agent_id ON public.knowledge_files(agent_id);
CREATE INDEX IF NOT EXISTS idx_faqs_agent_id ON public.faqs(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON public.conversation_messages(session_id);

-- إدراج بيانات تجريبية
INSERT INTO public.users (email, agent_id, full_name) VALUES 
('demo@sanadbot.ai', 'agent_demo_123', 'مستخدم تجريبي')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.bot_configs (agent_id, name, voice_id, button_color) VALUES 
('agent_demo_123', 'مساعد ذكي', 'ar-male-1', '#3B82F6')
ON CONFLICT (agent_id) DO NOTHING;

INSERT INTO public.faqs (agent_id, question, answer) VALUES 
('agent_demo_123', 'ما هي ساعات العمل؟', 'نعمل من الأحد إلى الخميس من 9 صباحاً حتى 6 مساءً بتوقيت الرياض.'),
('agent_demo_123', 'كيف يمكنني التواصل معكم؟', 'يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف أو من خلال هذا المساعد الذكي.'),
('agent_demo_123', 'هل تقدمون خدمة التوصيل؟', 'نعم، نقدم خدمة التوصيل لجميع مناطق المملكة خلال 2-3 أيام عمل.')
ON CONFLICT DO NOTHING;
