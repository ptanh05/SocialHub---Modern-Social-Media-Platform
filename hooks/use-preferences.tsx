import useSWR from 'swr';
import { useCallback } from 'react';

interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  notificationSettings: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    messages: boolean;
  };
  updatedAt: string;
}

export function usePreferences() {
  const { data, error, mutate } = useSWR<UserPreferences>(
    '/api/auth/preferences',
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch preferences');
      return res.json();
    }
  );

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        const res = await fetch('/api/auth/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error('Failed to update preferences');
        const updated = await res.json();
        mutate(updated);
        return updated;
      } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
      }
    },
    [mutate]
  );

  const updateTheme = useCallback(
    async (theme: 'light' | 'dark' | 'system') => {
      return updatePreferences({ theme } as any);
    },
    [updatePreferences]
  );

  const updateNotificationSettings = useCallback(
    async (settings: Partial<UserPreferences['notificationSettings']>) => {
      const current = data?.notificationSettings || {};
      return updatePreferences({
        notificationSettings: { ...current, ...settings },
      } as any);
    },
    [data, updatePreferences]
  );

  return {
    preferences: data,
    isLoading: !error && !data,
    isError: !!error,
    updatePreferences,
    updateTheme,
    updateNotificationSettings,
  };
}
