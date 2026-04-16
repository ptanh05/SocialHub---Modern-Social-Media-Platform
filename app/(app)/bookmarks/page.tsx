'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PostCard } from '@/components/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, Trash2 } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';

export default function BookmarksPage() {
  const { user } = useAuth();
  const { posts, isLoading, removeBookmark } = useBookmarks();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div
        className={`flex items-center gap-3 mb-8 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="p-2 rounded-full bg-primary/10">
          <Bookmark className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bài viết đã lưu</h1>
          <p className="text-muted-foreground text-sm">
            {posts.length > 0 ? `${posts.length} bài viết` : 'Danh sách trống'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card
          className={`text-center py-16 transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">Chưa có bài viết nào được lưu</p>
            <p className="text-sm text-muted-foreground">
              Nhấn biểu tượng bookmark trên bài viết để lưu lại
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any, index: number) => (
            <div
              key={post.id}
              className={`relative transition-all duration-500 ease-out group ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${100 + index * 60}ms` }}
            >
              <PostCard
                post={post}
                author={post.author || { name: 'Không rõ', username: 'unknown', avatar: '' }}
                animationDelay={0}
              />
              {/* Quick remove button */}
              <button
                onClick={async () => {
                  if (confirm('Xóa bài viết khỏi danh sách đã lưu?')) {
                    await removeBookmark(post.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-destructive/10 text-destructive/60 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Xóa khỏi danh sách đã lưu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}