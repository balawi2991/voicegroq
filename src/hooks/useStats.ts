'use client';

import useSWR from 'swr';
import { useAuth } from './useAuth';

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
  const response = await fetch(url);
  const result: StatsResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'فشل في جلب الإحصائيات');
  }
  
  return result.data!;
};

export function useStats() {
  const { user } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR(
    user?.agentId ? `/api/stats?agentId=${user.agentId}` : null,
    fetcher,
    {
      refreshInterval: 30000, // تحديث كل 30 ثانية
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    refetch: mutate,
  };
}