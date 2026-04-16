'use client';

import useSWR from 'swr';

interface Like {
  likeCount: number;
  liked: boolean;
}

interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLikes(postId: string) {
  const { data, isLoading, error, mutate } = useSWR<Like>(
    `/api/posts/${postId}/likes`,
    fetcher
  );

  const toggleLike = async () => {
    const liked = data?.liked || false;
    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: liked ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle like');
      }

      const result = await response.json();
      await mutate({ liked: !liked, likeCount: result.likeCount }, false);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  };

  return {
    likeCount: data?.likeCount || 0,
    liked: data?.liked || false,
    isLoading,
    error,
    toggleLike,
    mutate,
  };
}

export function useComments(postId: string) {
  const { data: comments = [], isLoading, error, mutate } = useSWR<Comment[]>(
    `/api/posts/${postId}/comments`,
    fetcher
  );

  const addComment = async (content: string) => {
    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add comment');
    }

    const newComment = await response.json();
    await mutate([...comments, newComment], false);
    return newComment;
  };

  return {
    comments,
    isLoading,
    error,
    addComment,
    mutate,
  };
}
