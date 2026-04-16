'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLikes, useComments } from '@/hooks/use-interactions';
import { Heart, MessageCircle, Share2, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface Post {
  id: string;
  userId: string;
  content: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: Post;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  onDelete?: (id: string) => void;
  isOwner?: boolean;
}

export function PostCard({ post, author, onDelete, isOwner }: PostCardProps) {

  return <PostCardComponent {...{ post, author, onDelete, isOwner }} />;
}

function PostCardComponent({ post, author, onDelete, isOwner }: PostCardProps) {
  const { likeCount, liked, toggleLike } = useLikes(post.id);
  const { comments } = useComments(post.id);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${author.username}`} className="flex items-center gap-3 hover:opacity-80 transition">
            <Avatar>
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm text-foreground">{author.name}</p>
              <p className="text-xs text-muted-foreground">@{author.username}</p>
            </div>
          </Link>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <Image
              src={post.image}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
        <div className="flex gap-2 pt-2 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              setLikeLoading(true);
              try {
                await toggleLike();
              } catch (error) {
                console.error('Failed to toggle like:', error);
              } finally {
                setLikeLoading(false);
              }
            }}
            disabled={likeLoading}
            className={liked ? 'text-red-500' : 'text-muted-foreground'}
          >
            <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
            <span className="ml-2 text-xs">{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="ml-2 text-xs">{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {showComments && <CommentSection postId={post.id} />}
      </CardContent>
    </Card>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { comments, addComment } = useComments(postId);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await addComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
      <form onSubmit={handleAddComment} className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <Button type="submit" size="sm" disabled={!commentText.trim() || loading}>
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {comments.map((comment: any) => (
          <div key={comment.id} className="flex gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded px-3 py-2">
                <p className="font-semibold text-xs">User</p>
                <p className="text-foreground">{comment.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
