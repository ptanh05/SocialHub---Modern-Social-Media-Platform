'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { CreatePost } from '@/components/create-post';
import { PostCard } from '@/components/post-card';
import { Spinner } from '@/components/ui/spinner';
import { Newspaper } from 'lucide-react';

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, isLoading, deletePost } = usePosts();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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
          <div className={`text-center py-12 transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: '150ms' }}>
            <Newspaper className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">Chưa có bài viết nào</p>
            <p className="text-xs text-muted-foreground mt-1">Hãy chia sẻ điều gì đó trước tiên!</p>
          </div>
        ) : (
          posts.map((post: any, index: number) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.author || { name: 'Không rõ', username: 'unknown', avatar: '' }}
              onDelete={handleDeletePost}
              isOwner={post.userId === user?.id}
              animationDelay={100 + index * 80}
            />
          ))
        )}
      </div>
    </div>
  );
}
