'use client';

import { useAuth } from '@/hooks/use-auth';
import { getBookmarkedPosts } from '@/lib/db';
import { PostCard } from '@/components/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  const { user } = useAuth();

  if (!user) return null;

  const bookmarkedPosts = getBookmarkedPosts(user.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Saved Posts</h1>
      </div>

      {bookmarkedPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No saved posts yet</p>
            <p className="text-sm mt-2">Posts you bookmark will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookmarkedPosts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              author={{
                name: 'User',
                username: 'user',
                avatar: '',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
