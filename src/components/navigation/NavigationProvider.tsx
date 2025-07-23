'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  currentPath: string;
  navigate: (path: string) => void;
  prefetchRoute: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCurrentPath(pathname);
    setIsNavigating(false);
  }, [pathname]);

  const navigate = (path: string) => {
    if (path === currentPath) return;

    setIsNavigating(true);

    // تأخير قصير جداً فقط لإظهار skeleton
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  const prefetchRoute = (path: string) => {
    router.prefetch(path);
  };

  // Prefetch dashboard routes عند التحميل مع تحسين الأداء
  useEffect(() => {
    if (pathname.startsWith('/dashboard')) {
      const dashboardRoutes = [
        '/dashboard',
        '/dashboard/appearance',
        '/dashboard/knowledge',
        '/dashboard/faq',
        '/dashboard/conversations'
      ];

      // تأخير prefetch لتحسين الأداء الأولي
      const prefetchTimeout = setTimeout(() => {
        dashboardRoutes.forEach(route => {
          if (route !== pathname) {
            router.prefetch(route);
          }
        });
      }, 1000);

      return () => clearTimeout(prefetchTimeout);
    }
  }, [pathname, router]);

  // إيقاف loading عند تغيير المسار
  useEffect(() => {
    const handleRouteChange = () => {
      setIsNavigating(false);
    };

    // استمع لتغييرات المسار
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const value = {
    isNavigating,
    currentPath,
    navigate,
    prefetchRoute,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
