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

interface PostEditModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: string, image?: string) => Promise<void>;
}

export function PostEditModal({
  post,
  open,
  onOpenChange,
  onSave,
}: PostEditModalProps) {
  const [content, setContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      await onSave(content, post.image);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update your post content. Posted on {new Date(post.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="What's on your mind?"
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
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saving || content === post.content}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
