'use client';

import useSWR from 'swr';
import { mutate as globalMutate } from 'swr';
import { useState } from 'react';

interface Bookmark {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

interface BookmarkedPost {
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

// Hook quản lý danh sách bookmark của người dùng
export function useBookmarks() {
  const { data: posts = [], isLoading, error, mutate } = useSWR<BookmarkedPost[]>(
    '/api/bookmarks',
    fetcher
  );

  const removeBookmark = async (postId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Xóa bài viết đã lưu thất bại');
      }

      await mutate(
        posts.filter((p: BookmarkedPost) => p.id !== postId),
        false
      );
    } catch (error) {
      console.error('Lỗi khi xóa bookmark:', error);
      throw error;
    }
  };

  return {
    posts,
    isLoading,
    error,
    removeBookmark,
    mutate,
    count: posts.length,
  };
}

// Hook kiểm tra trạng thái bookmark của một bài viết cụ thể
export function useBookmarkStatus(postId: string) {
  const { data, mutate } = useSWR<{ bookmarked: boolean }>(
    postId ? `/api/bookmarks/${postId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const toggleBookmark = async () => {
    if (!data) return;

    const wasBookmarked = data.bookmarked;

    try {
      if (wasBookmarked) {
        const response = await fetch(`/api/bookmarks/${postId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Xóa bài viết đã lưu thất bại');
        await mutate({ bookmarked: false }, false);
        await globalMutate('/api/bookmarks', (current: BookmarkedPost[] | undefined) =>
          (current || []).filter((p: BookmarkedPost) => p.id !== postId),
          false
        );
      } else {
        const response = await fetch(`/api/bookmarks/${postId}`, {
          method: 'POST',
        });
        if (!response.ok) throw new Error('Lưu bài viết thất bại');
        await mutate({ bookmarked: true }, false);
      }
    } catch (error) {
      await mutate();
      throw error;
    }
  };

  return {
    bookmarked: data?.bookmarked ?? false,
    toggleBookmark,
    mutate,
  };
}