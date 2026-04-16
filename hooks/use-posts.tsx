'use client';

import useSWR from 'swr';

interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePosts() {
  const { data: posts = [], isLoading, error, mutate } = useSWR('/api/posts', fetcher);

  const createPost = async (content: string, image?: string) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, image }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create post');
    }

    const newPost = await response.json();
    await mutate([newPost, ...posts], false);
    return newPost;
  };

  const deletePost = async (id: string) => {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete post');
    }

    await mutate(
      posts.filter((post: Post) => post.id !== id),
      false
    );
  };

  return {
    posts,
    isLoading,
    error,
    createPost,
    deletePost,
    mutate,
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
