'use client';

import useSWR from 'swr';
import { infinite as useSWRInfinite } from 'swr/infinite';

interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePosts() {
  const { data, isLoading, error, mutate, setSize } = useSWRInfinite(
    (pageIndex) => `/api/posts?page=${pageIndex + 1}`,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );

  const posts: Post[] = data ? data.flatMap((page: any) => page.posts || []) : [];
  const hasMore = data ? data[data.length - 1]?.pagination?.hasMore : false;
  const isLoadingMore = data && typeof data[data.length - 1] === 'undefined';

  const createPost = async (content: string, image?: string) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, image }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create post');
    }

    const newPost = await response.json();
    await mutate();
    return newPost;
  };

  const deletePost = async (id: string) => {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete post');
    }

    await mutate();
  };

  return {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    createPost,
    deletePost,
    mutate,
    setSize,
  };
}

export function useUserPosts(username: string) {
  const { data: posts = [], isLoading, error, mutate } = useSWR(
    username ? `/api/users/${username}/posts` : null,
    fetcher
  );

  return {
    posts,
    isLoading,
    error,
    mutate,
  };
}
