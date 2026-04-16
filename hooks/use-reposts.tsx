'use client';
import useSWR from 'swr';
import { useCallback } from 'react';

export function useReposts(postId: string) {
  const { data, mutate } = useSWR<{ reposted: boolean; count: number }>(
    postId ? `/api/posts/${postId}/repost` : null,
    async (url: string) => {
      const res = await fetch(url);
      return res.json();
    }
  );

  const toggleRepost = useCallback(async () => {
    const method = data?.reposted ? 'DELETE' : 'POST';
    await fetch(`/api/posts/${postId}/repost`, { method });
    mutate();
  }, [postId, data?.reposted, mutate]);

  return {
    reposted: data?.reposted ?? false,
    repostCount: data?.count ?? 0,
    toggleRepost,
  };
}
