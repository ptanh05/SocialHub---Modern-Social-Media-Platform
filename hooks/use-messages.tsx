import useSWR from 'swr';
import { useCallback, useEffect } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  lastMessage: Message;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useConversations() {
  const { data, error, mutate } = useSWR<{
    conversations: Conversation[];
    unreadCount: number;
  }>('/api/messages', fetcher);

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId, content }),
        });
        if (!res.ok) throw new Error('Failed to send message');
        mutate();
        return await res.json();
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [mutate]
  );

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mutate();
    }, 3000);

    return () => clearInterval(interval);
  }, [mutate]);

  return {
    conversations: data?.conversations || [],
    unreadCount: data?.unreadCount || 0,
    isLoading: !error && !data,
    isError: !!error,
    sendMessage,
    mutate,
  };
}

export function useConversation(userId: string) {
  const { data, error, mutate } = useSWR<Message[]>(
    userId ? `/api/messages/${userId}` : null,
    fetcher
  );

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ receiverId: userId, content }),
        });
        if (!res.ok) throw new Error('Failed to send message');
        mutate();
        return await res.json();
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [userId, mutate]
  );

  // Poll for new messages every 2 seconds when conversation is open
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      mutate();
    }, 2000);

    return () => clearInterval(interval);
  }, [userId, mutate]);

  return {
    messages: data || [],
    isLoading: !error && !data,
    isError: !!error,
    sendMessage,
    mutate,
  };
}
