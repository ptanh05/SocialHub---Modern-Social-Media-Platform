'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError('');

    try {
      await createPost(content, image || undefined);
      setContent('');
      setImage(null);
      setCharCount(0);
      onPostCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) return null;

  return (
    <Card
      className={`border-border/40 transition-all duration-500 ease-out hover-lift ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="transition-transform hover:scale-105">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          <div className="relative">
            <textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setCharCount(e.target.value.length);
              }}
              className="w-full min-h-24 p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              disabled={loading}
              maxLength={500}
            />
            <p
              className={`absolute bottom-2 right-3 text-xs transition-colors duration-200 ${
                charCount > 450 ? 'text-destructive' : 'text-muted-foreground'
              }`}
            >
              {charCount}/500
            </p>
          </div>

          {image && (
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted animate-fade-in-scale">
              <Image
                src={image}
                alt="Post preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full transition-all duration-200 hover:scale-110 shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
                className="hidden"
              />
              <div className="flex items-center gap-2 text-primary hover:opacity-80 transition-all duration-200 group-hover:scale-105">
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Add image</span>
              </div>
            </label>
            <Button
              type="submit"
              disabled={!content.trim() || loading}
              className="transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}