'use client';
import { useEffect, useRef, useCallback } from 'react';

export interface RealtimeEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface UseRealtimeOptions {
  onNotification?: (event: RealtimeEvent) => void;
  onMessage?: (event: RealtimeEvent) => void;
  /** Interval in ms between event polls. Defaults to 3000ms. */
  interval?: number;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { onNotification, onMessage, interval = 3000 } = options;
  const lastEventIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const url = lastEventIdRef.current
        ? `/api/events?since=${encodeURIComponent(lastEventIdRef.current)}`
        : '/api/events';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        // 401 means not logged in — stop polling silently
        if (res.status === 401) {
          if (pollRef.current !== null) clearInterval(pollRef.current);
        }
        return;
      }
      const events: RealtimeEvent[] = await res.json();
      if (events.length > 0) {
        lastEventIdRef.current = events[events.length - 1].id;
        for (const event of events) {
          if (event.eventType.startsWith('notification:')) {
            onNotification?.(event);
          } else if (event.eventType.startsWith('message:')) {
            onMessage?.(event);
          }
        }
      }
    } catch {
      /* ignore network errors */
    }
  }, [onNotification, onMessage]);

  useEffect(() => {
    fetchEvents();
    pollRef.current = setInterval(fetchEvents, interval);
    return () => {
      if (pollRef.current !== null) clearInterval(pollRef.current);
    };
  }, [fetchEvents, interval]);

  return { fetchEvents };
}
