'use client';

import useSWR from 'swr';
import { useAuth } from './useAuth';

interface ConversationMessage {
  content: string;
  timestamp: string;
}

interface ConversationItem {
  id: string;
  sessionId: string;
  createdAt: string;
  endedAt?: string;
  messageCount: number;
  firstMessage?: ConversationMessage;
  lastBotMessage?: ConversationMessage;
  duration: number; // بالدقائق
  satisfaction?: number;
  isActive: boolean;
}

interface ConversationDetails {
  id?: string;
  sessionId?: string;
  createdAt?: string;
  endedAt?: string;
  duration?: number;
  messageCount?: number;
  messages: {
    id: string;
    session_id: string;
    message_type: 'user' | 'bot';
    content: string;
    timestamp: string;
  }[];
}

interface ConversationsResponse {
  success: boolean;
  data?: ConversationItem[] | ConversationDetails;
  error?: string;
}

const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url);
  const result: ConversationsResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'فشل في جلب المحادثات');
  }
  
  return result.data!;
};

export function useConversations() {
  const { user } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR(
    user?.agentId ? `/api/conversations?agentId=${user.agentId}` : null,
    fetcher,
    {
      refreshInterval: 60000, // تحديث كل دقيقة
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    conversations: data as ConversationItem[],
    isLoading,
    error,
    refetch: mutate,
  };
}

export function useConversationDetails(sessionId: string | null) {
  const { user } = useAuth();
  
  const { data, error, isLoading, mutate } = useSWR(
    user?.agentId && sessionId ? `/api/conversations?agentId=${user.agentId}&conversationId=${sessionId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    conversationDetails: data as ConversationDetails,
    isLoading,
    error,
    refetch: mutate,
  };
}