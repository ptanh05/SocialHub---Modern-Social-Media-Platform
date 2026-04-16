'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePosts } from '@/hooks/use-posts';
import { useMentions } from '@/hooks/use-mentions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MentionDropdown } from '@/components/mention-dropdown';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export function CreatePost({ onPostCreated }: { onPostCreated?: () => void }) {
  const { user } = useAuth();
  const { createPost } = usePosts();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart } = textarea;
    const textBefore = textarea.value.substring(0, selectionStart);
    const lastAt = textBefore.lastIndexOf('@');
    const textAfter = textarea.value.substring(selectionStart);
    const newValue = textBefore.substring(0, lastAt) + `@${username} ` + textAfter;
    setContent(newValue);
    setCharCount(newValue.length);
    // Restore cursor after inserted text
    const newCursor = lastAt + username.length + 2;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const mentions = useMentions({ onMention: handleMention });

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
      setError(err instanceof Error ? err.message : 'Tạo bài viết thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ảnh quá lớn (tối đa 5MB)');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }
      const { url } = await res.json();
      setImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload ảnh thất bại');
    } finally {
      setUploadingImage(false);
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
              ref={textareaRef}
              placeholder="Bạn đang nghĩ gì?"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setCharCount(e.target.value.length);
                mentions.handleInputChange(e.target.value);
              }}
              onKeyDown={(e) => mentions.handleKeyDown(e, content)}
              className="w-full min-h-24 p-3 pr-16 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
              disabled={loading}
              maxLength={500}
            />
            <MentionDropdown
              suggestions={mentions.suggestions}
              selectedIndex={mentions.selectedIndex}
              onSelect={mentions.selectMention}
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
                alt="Xem trước bài viết"
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
                disabled={loading || uploadingImage}
                className="hidden"
              />
              <div className="flex items-center gap-2 text-primary hover:opacity-80 transition-all duration-200 group-hover:scale-105">
                {uploadingImage ? (
                  <>
                    <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm">Đang tải ảnh...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Thêm ảnh</span>
                  </>
                )}
              </div>
            </label>
            <Button
              type="submit"
              disabled={!content.trim() || loading || uploadingImage}
              className="transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng...
                </span>
              ) : uploadingImage ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tải ảnh...
                </span>
              ) : (
                'Đăng bài'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
