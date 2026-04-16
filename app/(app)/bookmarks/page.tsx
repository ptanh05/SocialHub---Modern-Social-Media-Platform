'use client';

import { useAuth } from '@/hooks/use-auth';
import { PostCard } from '@/components/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BookmarksPage() {
  const { user } = useAuth();

  const { data: posts = [], isLoading } = useSWR(user ? '/api/bookmarks' : null, fetcher);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Saved Posts</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Saved Posts</h1>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No saved posts yet</p>
            <p className="text-sm mt-2">Posts you bookmark will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.author || { name: 'Unknown', username: 'unknown', avatar: '' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}