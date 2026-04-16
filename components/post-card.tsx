'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLikes, useComments } from '@/hooks/use-interactions';
import { useReposts } from '@/hooks/use-reposts';
import { useMentions } from '@/hooks/use-mentions';
import { useBookmarkStatus } from '@/hooks/use-bookmarks';
import { MentionDropdown } from '@/components/mention-dropdown';
import { Heart, MessageCircle, Share2, Trash2, Repeat2, Bookmark, BadgeCheck } from 'lucide-react';
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
    isVerified?: boolean;
    badge?: string;
  };
  onDelete?: (id: string) => void;
  isOwner?: boolean;
  animationDelay?: number;
}

function getBadgeEmoji(badge: string) {
  const map: Record<string, string> = {
    creator: '✨', early_adopter: '🚀', contributor: '🏆',
    verified: '✅', staff: '💼',
  };
  return map[badge] || '';
}

export function PostCard({ post, author, onDelete, isOwner, animationDelay = 0 }: PostCardProps) {
  return <PostCardComponent {...{ post, author, onDelete, isOwner, animationDelay }} />;
}

function PostCardComponent({ post, author, onDelete, isOwner, animationDelay }: PostCardProps) {
  const { likeCount, liked, toggleLike } = useLikes(post.id);
  const { comments } = useComments(post.id);
  const { repostCount, reposted, toggleRepost } = useReposts(post.id);
  const { bookmarked, toggleBookmark } = useBookmarkStatus(post.id);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), animationDelay);
    return () => clearTimeout(timer);
  }, [animationDelay]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <Card className="border-border/40 hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar className="transition-transform hover:scale-105">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-foreground flex items-center gap-1">
                  {author.name}
                  {author.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  )}
                  {author.badge && (
                    <span className="text-xs" title={author.badge}>{getBadgeEmoji(author.badge)}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">@{author.username}</p>
              </div>
            </Link>
            {isOwner && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(post.id)}
                className="text-destructive hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
          {post.image && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted transition-transform hover:scale-[1.02]">
              <Image
                src={post.image}
                alt="Hình ảnh bài viết"
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
                  console.error('Thích thất bại:', error);
                } finally {
                  setLikeLoading(false);
                }
              }}
              disabled={likeLoading}
              className={`transition-all duration-200 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400'}`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${liked ? 'animate-heart-beat' : 'hover:scale-110'}`}
                fill={liked ? 'currentColor' : 'none'}
              />
              <span className="ml-2 text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments((v) => !v)}
              className={`text-muted-foreground transition-all duration-200 hover:text-primary ${showComments ? 'text-primary' : ''}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="ml-2 text-xs">{comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setBookmarkLoading(true);
                try {
                  await toggleBookmark();
                } catch (error) {
                  console.error('Lưu bài viết thất bại:', error);
                } finally {
                  setBookmarkLoading(false);
                }
              }}
              disabled={bookmarkLoading}
              className={`text-muted-foreground transition-all duration-200 hover:text-primary ${bookmarked ? 'text-primary' : ''}`}
            >
              <Bookmark
                className={`w-4 h-4 transition-transform duration-200 ${bookmarked ? 'animate-fade-in-scale' : 'hover:scale-110'}`}
                fill={bookmarked ? 'currentColor' : 'none'}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRepost}
              className={`transition-all duration-200 ${reposted ? 'text-green-500' : 'text-muted-foreground hover:text-green-400'}`}
            >
              <Repeat2 className="w-4 h-4" />
              <span className="ml-2 text-xs">{repostCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showComments ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {showComments && <CommentSection postId={post.id} />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { comments, addComment, mutate } = useComments(postId);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleMention = (username: string) => {
    const input = commentInputRef.current;
    if (!input) return;
    const { selectionStart } = input;
    const textBefore = input.value.substring(0, selectionStart);
    const lastAt = textBefore.lastIndexOf('@');
    const textAfter = input.value.substring(selectionStart);
    const newValue = textBefore.substring(0, lastAt) + `@${username} ` + textAfter;
    setCommentText(newValue);
    const newCursor = lastAt + username.length + 2;
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const mentions = useMentions({ onMention: handleMention });

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;

    setDeletingId(commentId);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Xóa bình luận thất bại');
      }

      await mutate(
        (current: any[] | undefined) =>
          (current || []).filter((c: any) => c.id !== commentId),
        false
      );
    } catch (error) {
      console.error('Xóa bình luận thất bại:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await addComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error('Thêm bình luận thất bại:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mt-4 pt-4 border-t border-border/40 space-y-3 transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <form onSubmit={handleAddComment} className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <textarea
            ref={commentInputRef}
            placeholder="Viết bình luận..."
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              mentions.handleInputChange(e.target.value);
            }}
            onKeyDown={(e) => mentions.handleKeyDown(e, commentText)}
            className="flex-1 text-sm px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none w-full min-h-10"
            disabled={loading}
            rows={1}
          />
          <MentionDropdown
            suggestions={mentions.suggestions}
            selectedIndex={mentions.selectedIndex}
            onSelect={mentions.selectMention}
          />
          <Button type="submit" size="sm" disabled={!commentText.trim() || loading}>
            {loading ? 'Đang...' : 'Gửi'}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        {comments.map((comment: any, index: number) => {
          const isOwner = user?.id === comment.userId;
          return (
            <div
              key={comment.id}
              className={`flex gap-2 text-sm transition-all duration-300 animate-fade-in group`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {comment.author?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded px-3 py-2">
                  <p className="font-semibold text-xs text-foreground">
                    {comment.author?.name || 'Người dùng'}
                  </p>
                  <p className="text-foreground">{comment.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="text-xs text-destructive/60 hover:text-destructive transition-colors disabled:opacity-50"
                    >
                      {deletingId === comment.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
