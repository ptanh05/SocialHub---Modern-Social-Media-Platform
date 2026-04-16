'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Post {
  id: string;
  content: string;
  image?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function PostEditModal({
  post,
  open,
  onOpenChange,
  onSave,
}: {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string, image?: string) => Promise<void>;
}) {
  const [content, setContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      await onSave(content, post.image);
      onOpenChange(false);
    } catch (error) {
      console.error('Lưu bài viết thất bại:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          <DialogDescription>
            Cập nhật nội dung bài viết. Đã đăng ngày {new Date(post.createdAt).toLocaleDateString('vi-VN')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            className="min-h-[200px] resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {content.length} / 5000
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saving || content === post.content}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
