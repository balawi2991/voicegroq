# 🗄️ إعداد قاعدة البيانات - سند بوت

## 📋 الخطوات المطلوبة:

### 1. إعداد Supabase
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. افتح مشروعك: `https://supabase.com/dashboard/project/rftytgthazpqnhpeooge`
3. اذهب إلى **SQL Editor** من القائمة الجانبية

### 2. تشغيل SQL
1. انسخ محتوى ملف `database-setup.sql`
2. الصقه في SQL Editor
3. اضغط **Run** لتشغيل الكود

### 3. التحقق من الجداول
بعد تشغيل SQL، يجب أن ترى الجداول التالية في **Table Editor**:

- ✅ `users` - بيانات المستخدمين
- ✅ `bot_configs` - تكوين البوت
- ✅ `knowledge_files` - ملفات المعرفة
- ✅ `faqs` - الأسئلة الشائعة
- ✅ `conversations` - المحادثات
- ✅ `conversation_messages` - رسائل المحادثات

### 4. بيانات تجريبية
سيتم إنشاء مستخدم تجريبي تلقائياً:

```
Email: demo@sanadbot.ai
Agent ID: agent_demo_123
```

### 5. إعداد المصادقة (اختياري)
إذا كنت تريد تسجيل دخول حقيقي:

1. اذهب إلى **Authentication** > **Settings**
2. فعّل **Enable email confirmations** (اختياري)
3. أضف **Site URL**: `http://localhost:3000`
4. أضف **Redirect URLs**: `http://localhost:3000/dashboard`

### 6. إعداد Row Level Security (للإنتاج)
لحماية البيانات في الإنتاج، فعّل RLS:

```sql
-- تفعيل RLS لجميع الجداول
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين - يمكن للمستخدم رؤية بياناته فقط
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- سياسة لتكوين البوت - يمكن للمستخدم إدارة بوته فقط
CREATE POLICY "Users can manage own bot" ON public.bot_configs
    FOR ALL USING (
        agent_id IN (
            SELECT agent_id FROM public.users WHERE id::text = auth.uid()::text
        )
    );
```

## 🧪 اختبار الاتصال

بعد إعداد قاعدة البيانات، اختبر الاتصال:

```bash
# في مجلد المشروع
npm run dev
```

ثم اذهب إلى:
- `http://localhost:3000/signup` - إنشاء حساب جديد
- `http://localhost:3000/login` - تسجيل دخول
- `http://localhost:3000/dashboard` - لوحة التحكم

## ❗ مشاكل شائعة

### خطأ "relation does not exist"
- تأكد من تشغيل SQL في **SQL Editor**
- تحقق من وجود الجداول في **Table Editor**

### خطأ "RLS policy violation"
- تأكد من تعطيل RLS أثناء التطوير:
```sql
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configs DISABLE ROW LEVEL SECURITY;
-- ... باقي الجداول
```

### خطأ في المصادقة
- تحقق من صحة متغيرات البيئة في `.env.local`
- تأكد من صحة URLs في إعدادات Supabase

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من **Logs** في Supabase Dashboard
2. راجع **Network** tab في Developer Tools
3. تأكد من صحة متغيرات البيئة
