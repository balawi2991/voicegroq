# 🤝 دليل المساهمة في مشروع سند بوت

## 🎯 مرحباً بك في مجتمع سند بوت!

نحن نرحب بجميع أنواع المساهمات، سواء كانت إصلاح أخطاء، إضافة ميزات جديدة، تحسين التوثيق، أو حتى اقتراح أفكار جديدة.

## 🚀 البدء السريع

### 1. إعداد البيئة المحلية

```bash
# استنساخ المشروع
git clone https://github.com/your-username/sanad-bot.git
cd sanad-bot

# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.local.example .env.local

# إعداد قاعدة البيانات
npm run setup-db

# تشغيل المشروع
npm run dev
```

### 2. متطلبات النظام

- **Node.js** 18.0.0 أو أحدث
- **npm** 9.0.0 أو أحدث
- **PostgreSQL** (أو حساب Neon)
- **Git** للتحكم في الإصدارات

## 📋 أنواع المساهمات

### 🐛 إصلاح الأخطاء
- ابحث في [Issues](https://github.com/your-username/sanad-bot/issues) عن الأخطاء المعروفة
- أنشئ issue جديد إذا وجدت خطأ غير مسجل
- اتبع قالب تقرير الأخطاء

### ✨ ميزات جديدة
- ناقش الفكرة أولاً في [Discussions](https://github.com/your-username/sanad-bot/discussions)
- أنشئ Feature Request في Issues
- انتظر الموافقة قبل البدء في التطوير

### 📚 تحسين التوثيق
- إصلاح الأخطاء الإملائية
- إضافة أمثلة وشروحات
- ترجمة التوثيق
- تحديث الأدلة القديمة

### 🎨 تحسين التصميم
- تحسين واجهة المستخدم
- إضافة حركات وانتقالات
- تحسين تجربة المستخدم
- دعم الوضع المظلم

## 🛠️ معايير التطوير

### 📝 معايير الكود

#### TypeScript
```typescript
// ✅ جيد
interface UserConfig {
  name: string;
  email: string;
  agentId: string;
}

const createUser = async (config: UserConfig): Promise<User> => {
  // implementation
};

// ❌ سيء
const createUser = (config: any) => {
  // implementation
};
```

#### React Components
```tsx
// ✅ جيد
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### API Routes
```typescript
// ✅ جيد
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // التحقق من صحة البيانات
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }
    
    // المنطق الرئيسي
    const result = await processRequest(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('خطأ في API:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
```

### 🎨 معايير التصميم

#### Tailwind CSS
```tsx
// ✅ جيد - استخدام فئات منطقية ومنظمة
<div className="
  flex items-center justify-between
  p-4 bg-white rounded-lg shadow-sm
  border border-gray-200
  hover:shadow-md transition-shadow
">

// ❌ سيء - فئات عشوائية وغير منظمة
<div className="flex p-4 bg-white items-center rounded-lg justify-between border-gray-200 shadow-sm border hover:shadow-md transition-shadow">
```

#### متغيرات CSS
```css
/* استخدم متغيرات Tailwind */
:root {
  --primary-color: theme('colors.blue.600');
  --secondary-color: theme('colors.gray.600');
}
```

### 🧪 الاختبارات

```typescript
// مثال على اختبار وحدة
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🔄 سير العمل (Workflow)

### 1. إنشاء Branch جديد
```bash
# للميزات الجديدة
git checkout -b feature/add-voice-commands

# لإصلاح الأخطاء
git checkout -b fix/audio-playback-issue

# للتوثيق
git checkout -b docs/update-api-guide
```

### 2. تطوير التغييرات
```bash
# تأكد من تشغيل الاختبارات
npm run test

# تحقق من جودة الكود
npm run lint
npm run type-check

# تنسيق الكود
npm run format
```

### 3. Commit Messages
```bash
# ✅ جيد
git commit -m "feat: add voice command recognition"
git commit -m "fix: resolve audio playback delay issue"
git commit -m "docs: update API documentation"
git commit -m "style: improve button hover effects"

# ❌ سيء
git commit -m "update stuff"
git commit -m "fix bug"
git commit -m "changes"
```

### 4. إنشاء Pull Request

#### قالب Pull Request
```markdown
## 📋 الوصف
وصف مختصر للتغييرات المقترحة

## 🔗 Issue المرتبط
Closes #123

## 🧪 كيفية الاختبار
1. خطوة 1
2. خطوة 2
3. النتيجة المتوقعة

## 📸 لقطات الشاشة (إن وجدت)
![Screenshot](url)

## ✅ Checklist
- [ ] تم اختبار التغييرات محلياً
- [ ] تم تحديث التوثيق
- [ ] تم إضافة اختبارات جديدة
- [ ] تم التحقق من جودة الكود
```

## 🎯 أولويات التطوير

### 🔥 عالية الأولوية
- إصلاح الأخطاء الحرجة
- تحسين الأداء
- مشاكل الأمان
- مشاكل إمكانية الوصول

### 📈 متوسطة الأولوية
- ميزات جديدة مطلوبة
- تحسين تجربة المستخدم
- تحسين التوثيق
- إعادة هيكلة الكود

### 💡 منخفضة الأولوية
- ميزات تجريبية
- تحسينات تصميمية
- أدوات تطوير إضافية

## 🏷️ نظام التصنيف (Labels)

- `bug` - أخطاء تحتاج إصلاح
- `enhancement` - ميزات جديدة
- `documentation` - تحسين التوثيق
- `good first issue` - مناسب للمبتدئين
- `help wanted` - نحتاج مساعدة
- `priority: high` - أولوية عالية
- `priority: low` - أولوية منخفضة

## 🤔 أسئلة شائعة

### كيف أختبر التغييرات محلياً؟
```bash
npm run dev
# افتح http://localhost:3000
```

### كيف أختبر التضمين؟
```bash
# افتح ملف external-test.html في المتصفح
# أو استخدم Live Server في VS Code
```

### كيف أحدث قاعدة البيانات؟
```bash
npm run setup-db
```

### كيف أحدث إصدار التضمين؟
```bash
npm run update-embed
```

## 📞 التواصل والدعم

- **GitHub Issues** - للأخطاء والميزات
- **GitHub Discussions** - للأسئلة والنقاشات
- **Email** - للاستفسارات الخاصة

## 🙏 شكر خاص

نشكر جميع المساهمين الذين يساعدون في تطوير سند بوت:

- [@contributor1](https://github.com/contributor1) - تطوير الميزات الأساسية
- [@contributor2](https://github.com/contributor2) - تحسين التوثيق
- [@contributor3](https://github.com/contributor3) - إصلاح الأخطاء

---

**💡 نصيحة**: ابدأ بـ "good first issue" إذا كنت مساهماً جديداً!

*آخر تحديث: ديسمبر 2024*