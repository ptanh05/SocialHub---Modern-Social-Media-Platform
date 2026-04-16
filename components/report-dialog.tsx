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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Quấy rối' },
  { value: 'abuse', label: 'Lạm dụng' },
  { value: 'inappropriate', label: 'Nội dung không phù hợp' },
  { value: 'misinformation', label: 'Thông tin sai lệch' },
  { value: 'other', label: 'Khác' },
];

export function ReportDialog({
  open,
  onOpenChange,
  postId,
  userId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId?: string;
  userId?: string;
  onSubmit: (reason: string, description: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason || !description.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(reason, description);
      setReason('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Gửi báo cáo thất bại:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo {postId ? 'bài viết' : 'người dùng'}</DialogTitle>
          <DialogDescription>
            Giúp chúng tôi hiểu vấn đề. Báo cáo của bạn sẽ được đội ngũ kiểm duyệt xem xét.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Lý do</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Mô tả</label>
            <Textarea
              placeholder="Vui lòng cung cấp thêm chi tiết về báo cáo của bạn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              className="min-h-[120px] resize-none"
            />
            <p className="text-xs text-muted-foreground text-right mt-2">
              {description.length} / 1000
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || !description.trim() || submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
