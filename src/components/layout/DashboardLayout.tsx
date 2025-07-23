'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { DashboardSkeleton, AppearanceSkeleton, KnowledgeSkeleton, PageSkeleton } from '@/components/ui/Skeleton';
import { SpaceBackground } from '@/components/space/StarField';
import { GlowButton } from '@/components/space/GlowButton';
import {
  Home,
  Palette,
  Brain,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  TestTube
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'الرئيسية',
    description: 'نظرة عامة'
  },
  {
    href: '/dashboard/appearance',
    icon: Palette,
    label: 'التخصيص',
    description: 'الشكل والصوت'
  },
  {
    href: '/dashboard/knowledge',
    icon: Brain,
    label: 'المعرفة',
    description: 'الملفات والبيانات'
  },
  {
    href: '/dashboard/faq',
    icon: HelpCircle,
    label: 'الأسئلة الشائعة',
    description: 'إجابات سريعة'
  },
  {
    href: '/dashboard/conversations',
    icon: MessageSquare,
    label: 'المحادثات',
    description: 'سجل التفاعلات'
  },
  {
    href: '/dev',
    icon: TestTube,
    label: 'مختبر التطوير',
    description: 'اختبار البوت'
  },
];

function DashboardContent({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading, isAuthenticated } = useAuth();
  const { navigate, isNavigating, prefetchRoute } = useNavigation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // دالة لاختيار skeleton المناسب حسب المسار
  const getSkeletonForPath = (path: string) => {
    switch (path) {
      case '/dashboard':
        return <DashboardSkeleton />;
      case '/dashboard/appearance':
        return <AppearanceSkeleton />;
      case '/dashboard/knowledge':
        return <KnowledgeSkeleton />;
      case '/dashboard/faq':
      case '/dashboard/conversations':
        return <PageSkeleton />;
      case '/dev':
        return <AppearanceSkeleton />; // نفس skeleton التخصيص
      default:
        return <DashboardSkeleton />;
    }
  };

  // إعادة توجيه إذا لم يكن مصادق عليه
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  // عرض loading أثناء التحقق من المصادقة
  if (loading) {
    return (
      <SpaceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">جاري التحميل...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  // عدم عرض شيء إذا لم يكن مصادق عليه
  if (!isAuthenticated) {
    return null;
  }

  return (
      <SpaceBackground>
      <div className="min-h-screen flex">
        {/* Sidebar للشاشات الكبيرة */}
        <aside className="hidden lg:flex lg:w-80 bg-white/5 backdrop-blur-sm border-l border-white/10">
          <div className="flex flex-col w-full p-6">
            {/* الشعار */}
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">سند بوت</h1>
                <p className="text-sm text-gray-400">لوحة التحكم</p>
              </div>
            </div>

            {/* قائمة التنقل */}
            <nav className="flex-1 space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <div
                    key={item.href}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl cursor-pointer',
                      isActive
                        ? 'bg-blue-500/20 border border-blue-500/50 text-white'
                        : 'hover:bg-white/5 text-gray-300 hover:text-white'
                    )}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => prefetchRoute(item.href)}
                  >
                    <item.icon className={cn(
                      'w-5 h-5',
                      isActive ? 'text-blue-400' : 'text-gray-400'
                    )} />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </div>
                );
              })}
            </nav>

            {/* معلومات المستخدم وتسجيل الخروج */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'م'}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {user?.fullName || 'مستخدم'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <GlowButton
                variant="outline"
                className="w-full"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </GlowButton>
            </div>
          </div>
        </aside>

        {/* Sidebar للجوال */}
        {isSidebarOpen && (
          <>
            {/* خلفية شفافة */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={toggleSidebar}
            />

            {/* Sidebar */}
            <aside className="fixed right-0 top-0 h-full w-80 bg-space-dark/95 backdrop-blur-sm border-l border-white/10 z-50 lg:hidden">
                <div className="flex flex-col h-full p-6">
                  {/* رأس الـ sidebar مع زر الإغلاق */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-8 h-8 text-blue-400" />
                      <div>
                        <h1 className="text-xl font-bold text-white">سند بوت</h1>
                        <p className="text-sm text-gray-400">لوحة التحكم</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleSidebar}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>

                  {/* نفس محتوى الـ sidebar */}
                  <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <div
                          key={item.href}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-xl cursor-pointer',
                            isActive
                              ? 'bg-blue-500/20 border border-blue-500/50 text-white'
                              : 'hover:bg-white/5 text-gray-300 hover:text-white'
                          )}
                          onClick={() => {
                            navigate(item.href);
                            toggleSidebar();
                          }}
                        >
                          <item.icon className={cn(
                            'w-5 h-5',
                            isActive ? 'text-blue-400' : 'text-gray-400'
                          )} />
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </nav>

                  {/* معلومات المستخدم */}
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">م</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">مستخدم تجريبي</div>
                          <div className="text-xs text-gray-400">user@example.com</div>
                        </div>
                      </div>
                    </div>
                    
                    <GlowButton
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = '/';
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </GlowButton>
                  </div>
                </div>
              </aside>
            </>
          )}

        {/* المحتوى الرئيسي */}
        <main className="flex-1 flex flex-col">
          {/* شريط علوي للجوال */}
          <div className="lg:hidden bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <h1 className="text-lg font-bold text-white">سند بوت</h1>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* محتوى الصفحة */}
          <div className="flex-1 p-6 lg:p-8">
            {isNavigating ? (
              <div key="skeleton">
                {getSkeletonForPath(pathname)}
              </div>
            ) : (
              <div key={pathname}>
                {children}
              </div>
            )}
          </div>
        </main>
      </div>
    </SpaceBackground>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardContent>{children}</DashboardContent>;
}
