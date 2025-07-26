# 🏗️ بنية مشروع سند بوت

## 📋 نظرة عامة

سند بوت هو مساعد ذكي صوتي يستخدم تقنيات الذكاء الاصطناعي لتوفير تجربة تفاعلية متقدمة. يدعم المشروع التضمين في المواقع الخارجية ويوفر لوحة تحكم شاملة للإدارة.

## 🛠️ التقنيات المستخدمة

### Frontend
- **Next.js 15.4.2** - إطار عمل React مع App Router
- **React 19.1.0** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة مع الأنواع الثابتة
- **Tailwind CSS 4** - إطار عمل CSS للتصميم
- **Framer Motion** - مكتبة الحركات والانتقالات
- **Lucide React** - مكتبة الأيقونات

### Backend & Database
- **Neon PostgreSQL** - قاعدة بيانات PostgreSQL سحابية
- **Next.js API Routes** - APIs مدمجة
- **pg** - مكتبة الاتصال بقاعدة البيانات
- **bcryptjs** - تشفير كلمات المرور

### AI & Voice Processing
- **Google Gemini AI** - معالجة اللغة الطبيعية والذكاء الاصطناعي
- **Gladia API** - تحويل الكلام إلى نص (Speech-to-Text)
- **Groq TTS API** - تحويل النص إلى كلام (Text-to-Speech)
- **Web Audio API** - معالجة الصوت في المتصفح

## 📁 هيكل المشروع

```
sanad-bot-fresh/
├── docs/                          # التوثيق التقني
│   ├── BROWSER_AUDIO_BEST_PRACTICES.md
│   └── STREAMING_TTS_GUIDE.md
├── public/                        # الملفات العامة
│   ├── embed.js                   # سكريبت التضمين
│   └── next.svg                   # شعار Next.js
├── scripts/                       # سكريبتات الإعداد والصيانة
│   ├── setup-neon-database.js     # إعداد قاعدة البيانات
│   └── update-version.js          # تحديث إصدار التضمين
├── src/
│   ├── app/                       # صفحات التطبيق (App Router)
│   │   ├── api/                   # APIs الخلفية
│   │   │   ├── auth/              # مصادقة المستخدمين
│   │   │   ├── bot/config/        # تكوين البوت
│   │   │   ├── embed/version/     # إصدار التضمين
│   │   │   ├── faq/               # الأسئلة الشائعة
│   │   │   ├── knowledge/         # إدارة المعرفة
│   │   │   └── voice/             # معالجة الصوت
│   │   ├── dashboard/             # لوحة التحكم
│   │   ├── dev/                   # أدوات التطوير
│   │   ├── embed/                 # صفحة التضمين
│   │   ├── login/                 # صفحة تسجيل الدخول
│   │   └── signup/                # صفحة إنشاء الحساب
│   ├── components/                # مكونات React
│   │   ├── auth/                  # مكونات المصادقة
│   │   ├── layout/                # مكونات التخطيط
│   │   ├── navigation/            # مكونات التنقل
│   │   ├── space/                 # مكونات المساحات
│   │   ├── ui/                    # مكونات واجهة المستخدم
│   │   └── voice/                 # مكونات الصوت
│   ├── hooks/                     # React Hooks مخصصة
│   │   └── useAuth.ts             # hook المصادقة
│   ├── lib/                       # مكتبات ومساعدات
│   │   ├── db.ts                  # إدارة قاعدة البيانات
│   │   ├── utils.ts               # دوال مساعدة عامة
│   │   └── streamingTTS.ts        # مكتبة الصوت المتدفق
│   └── types/                     # تعريفات الأنواع
│       └── index.ts               # الأنواع الرئيسية
├── .env.local                     # متغيرات البيئة
├── package.json                   # تبعيات المشروع
├── tailwind.config.ts             # تكوين Tailwind CSS
├── tsconfig.json                  # تكوين TypeScript
├── next.config.ts                 # تكوين Next.js
├── README.md                      # دليل المشروع
├── DEVELOPMENT.md                 # دليل التطوير
└── ARCHITECTURE.md                # هذا الملف
```

## 🔄 تدفق البيانات

### 1. مصادقة المستخدم
```
User → Login/Signup → API Auth → Database → Session → Dashboard
```

### 2. معالجة الصوت
```
User Voice → Gladia API → Text → Gemini AI → Response → Groq TTS → Audio Stream
```

### 3. إدارة المعرفة
```
User Upload → File Processing → Database Storage → RAG Integration → AI Responses
```

## 🗄️ قاعدة البيانات

### الجداول الرئيسية
- **users** - معلومات المستخدمين والمصادقة
- **bot_configs** - تكوينات البوت لكل مستخدم
- **knowledge_files** - ملفات المعرفة المرفوعة
- **faqs** - الأسئلة الشائعة
- **conversations** - سجل المحادثات
- **conversation_messages** - رسائل المحادثات

## 🔌 APIs الخارجية

### 1. Gladia API
- **الغرض**: تحويل الكلام إلى نص
- **الاستخدام**: معالجة إدخال المستخدم الصوتي

### 2. Google Gemini AI
- **الغرض**: معالجة اللغة الطبيعية والذكاء الاصطناعي
- **الاستخدام**: فهم الاستفسارات وتوليد الردود

### 3. Groq TTS API
- **الغرض**: تحويل النص إلى كلام
- **الاستخدام**: تحويل ردود البوت إلى صوت

## 🚀 نظام التضمين

### آلية العمل
1. **embed.js** - سكريبت يتم تحميله في المواقع الخارجية
2. **Version Control** - نظام تحديث تلقائي للإصدارات
3. **Configuration** - جلب التكوين من API حسب agent_id
4. **Real-time Updates** - تحديث التكوين دون إعادة تحميل

### مزايا النظام
- **تحديث تلقائي** - جميع المواقع تحصل على التحديثات
- **تخصيص فردي** - كل موقع له تكوين منفصل
- **أداء عالي** - تحميل سريع وذاكرة محدودة
- **سهولة التضمين** - سطر واحد من الكود

## 🔒 الأمان

### Frontend
- **Input Validation** - التحقق من صحة المدخلات
- **XSS Protection** - حماية من هجمات XSS
- **CORS Configuration** - تكوين CORS آمن

### Backend
- **Password Hashing** - تشفير كلمات المرور باستخدام bcrypt
- **SQL Injection Prevention** - استخدام Prepared Statements
- **Environment Variables** - حماية المفاتيح الحساسة
- **Rate Limiting** - تحديد معدل الطلبات

### Database
- **SSL Connection** - اتصال مشفر مع قاعدة البيانات
- **Access Control** - تحكم في الوصول حسب المستخدم
- **Data Validation** - التحقق من صحة البيانات

## 📈 الأداء والتحسين

### Frontend Optimization
- **Code Splitting** - تقسيم الكود لتحميل أسرع
- **Image Optimization** - تحسين الصور تلقائياً
- **Caching Strategy** - استراتيجية تخزين مؤقت ذكية

### Backend Optimization
- **Database Indexing** - فهرسة قاعدة البيانات للاستعلامات السريعة
- **Connection Pooling** - تجميع اتصالات قاعدة البيانات
- **Streaming APIs** - APIs متدفقة للصوت

### Audio Processing
- **Streaming TTS** - تشغيل الصوت أثناء التوليد
- **Audio Compression** - ضغط الصوت لتوفير البيانات
- **Browser Compatibility** - دعم جميع المتصفحات الحديثة

## 🔮 التطوير المستقبلي

### ميزات مخططة
- **Multi-language Support** - دعم لغات متعددة
- **Advanced Analytics** - تحليلات متقدمة للاستخدام
- **Voice Cloning** - استنساخ الأصوات
- **Mobile App** - تطبيق جوال

### تحسينات تقنية
- **Microservices Architecture** - تحويل إلى بنية الخدمات المصغرة
- **Real-time Collaboration** - تعاون فوري متعدد المستخدمين
- **Advanced Caching** - تخزين مؤقت متقدم
- **Load Balancing** - توزيع الأحمال

---

*آخر تحديث: ديسمبر 2024*