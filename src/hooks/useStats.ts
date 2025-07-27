'use client';

import useSWR from 'swr';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface StatsData {
  totalConversations: number;
  todayConversations: number;
  avgResponseTime: number;
  satisfaction: number;
}

interface StatsResponse {
  success: boolean;
  data?: StatsData;
  error?: string;
}

const fetcher = async (url: string): Promise<StatsData> => {
  // إضافة timestamp لمنع الكاش في المتصفح
  const urlWithTimestamp = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  
  const response = await fetch(urlWithTimestamp, {
    cache: 'no-store', // منع الكاش
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  
  const result: StatsResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'فشل في جلب الإحصائيات');
  }
  
  return result.data!;
};

export function useStats() {
  const { user } = useAuth();
  const router = useRouter();
  
  const { data, error, isLoading, mutate } = useSWR(
    user?.agentId ? `/api/stats?agentId=${user.agentId}` : null,
    fetcher,
    {
      // إعدادات التحديث في الوقت الفعلي
      refreshInterval: 5000, // تحديث كل 5 ثواني
      revalidateOnFocus: true, // تحديث عند التركيز على النافذة
      revalidateOnReconnect: true, // تحديث عند إعادة الاتصال
      revalidateOnMount: true, // تحديث فوري عند التحميل
      revalidateIfStale: true, // تحديث إذا كانت البيانات قديمة
      
      // إعدادات الكاش - بيانات طازجة دائماً
      dedupingInterval: 0, // عدم منع الطلبات المتكررة
      focusThrottleInterval: 0, // عدم تأخير التحديث عند التركيز
      loadingTimeout: 3000, // مهلة زمنية للتحميل
      errorRetryInterval: 2000, // إعادة المحاولة كل ثانيتين
      errorRetryCount: 3, // عدد محاولات إعادة التجربة
      
      // ضمان البيانات الطازجة
      keepPreviousData: false, // عدم الاحتفاظ بالبيانات السابقة
    }
  );

  // مراقبة أحداث التنقل لضمان التحديث الفوري
  useEffect(() => {
    // تحديث فوري عند تحميل المكون
    if (user?.agentId) {
      mutate();
    }
  }, [user?.agentId, mutate]);

  // مراقبة تغييرات المسار للتحديث الفوري
  useEffect(() => {
    const handleRouteChange = () => {
      if (user?.agentId) {
        // تأخير قصير للسماح للصفحة بالتحميل ثم التحديث
        setTimeout(() => {
          mutate();
        }, 100);
      }
    };

    // مراقبة تغييرات localStorage للتحديث عند حدوث تغييرات في البيانات
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'stats_updated' || e.key?.includes('conversation_')) {
        mutate();
      }
    };

    // مراقبة الأحداث المخصصة للتحديث
    const handleCustomUpdate = () => {
      mutate();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statsUpdate', handleCustomUpdate);
    window.addEventListener('conversationUpdate', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statsUpdate', handleCustomUpdate);
      window.removeEventListener('conversationUpdate', handleCustomUpdate);
    };
  }, [user?.agentId, mutate]);

  // دالة لإعادة جلب البيانات فوراً
  const forceRefresh = async () => {
    try {
      await mutate(); // إعادة جلب البيانات
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // دالة لتحديث الإحصائيات عند حدوث تغيير في البيانات
  const triggerUpdate = () => {
    // إشعار جميع مكونات useStats بالتحديث
    window.dispatchEvent(new CustomEvent('statsUpdate'));
    localStorage.setItem('stats_updated', Date.now().toString());
  };

  return {
    stats: data,
    isLoading,
    error,
    refetch: mutate,
    forceRefresh, // دالة للتحديث الفوري
    triggerUpdate, // دالة لإشعار التحديث عند تغيير البيانات
  };
}