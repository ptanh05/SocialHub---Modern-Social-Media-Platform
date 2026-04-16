import useSWR from 'swr';
import { useCallback, useState } from 'react';

interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
}

interface SearchResults {
  posts: Post[];
  users: User[];
}

export function useSearch(query: string, type: 'all' | 'posts' | 'users' = 'all') {
  const [searchQuery, setSearchQuery] = useState(query);

  const { data, error, mutate } = useSWR<SearchResults>(
    searchQuery && searchQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to search');
      return res.json();
    }
  );

  const search = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  return {
    results: data,
    isLoading: searchQuery && !error && !data,
    isError: !!error,
    search,
  };
}

export function useTrendingHashtags() {
  const { data, error } = useSWR(
    '/api/hashtags?trending=true',
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch trending hashtags');
      return res.json();
    }
  );

  return {
    hashtags: data || [],
    isLoading: !error && !data,
    isError: !!error,
  };
}

export function useHashtag(tag: string) {
  const { data, error } = useSWR(
    tag ? `/api/hashtags?q=${encodeURIComponent(tag)}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch hashtag');
      return res.json();
    }
  );

  return {
    hashtag: data?.hashtag,
    posts: data?.posts || [],
    isLoading: tag && !error && !data,
    isError: !!error,
  };
}
