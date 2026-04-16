'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { CreatePost } from '@/components/create-post';
import { PostCard } from '@/components/post-card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Newspaper, ChevronDown } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, isLoading, isLoadingMore, hasMore, deletePost, setSize } = usePosts();
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Infinite scroll với Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setSize((prev: number) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, setSize]);

  const handleDeletePost = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await deletePost(id);
      } catch (error) {
        console.error('Xóa bài thất bại:', error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div
        className={`mb-6 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h1 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Newspaper className="w-6 h-6 text-primary" />
          </div>
          Bảng tin của bạn
        </h1>
        <p className="text-muted-foreground text-sm">
          {posts.length > 0 ? `${posts.length} bài viết` : 'Xem những gì đang xảy ra'}
        </p>
      </div>

      <div className="space-y-4">
        <CreatePost />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div
            className={`text-center py-12 transition-all duration-500 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">Chưa có bài viết nào</p>
            <p className="text-xs text-muted-foreground mt-1">Hãy chia sẻ điều gì đó trước tiên!</p>
          </div>
        ) : (
          <>
            {posts.map((post: any, index: number) => (
              <PostCard
                key={post.id}
                post={post}
                author={post.author || { name: 'Không rõ', username: 'unknown', avatar: '' }}
                onDelete={handleDeletePost}
                isOwner={post.userId === user?.id}
                animationDelay={100 + index * 80}
              />
            ))}

            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setSize((prev: number) => prev + 1)}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Xem thêm bài viết
                    </>
                  )}
                </Button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Bạn đã xem hết bài viết
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
