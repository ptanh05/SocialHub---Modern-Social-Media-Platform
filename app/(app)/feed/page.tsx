'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { CreatePost } from '@/components/create-post';
import { PostCard } from '@/components/post-card';
import { Spinner } from '@/components/ui/spinner';

export default function FeedPage() {
  const { user } = useAuth();
  const { posts, isLoading, deletePost } = usePosts();

  const handleDeletePost = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-foreground mb-6">Your Feed</h1>

      <div className="space-y-4">
        <CreatePost />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              author={post.author || { name: 'Unknown', username: 'unknown', avatar: '' }}
              onDelete={handleDeletePost}
              isOwner={post.userId === user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
