'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/use-notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationText = (notification: any) => {
    const typeTexts: Record<string, string> = {
      like: 'đã thích bài viết của bạn',
      comment: 'đã bình luận bài viết của bạn',
      follow: 'đã theo dõi bạn',
      message: 'đã gửi tin nhắn cho bạn',
    };
    return typeTexts[notification.type] || 'đã tương tác với bạn';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Thông báo</h3>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllAsRead} className="text-xs">
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Chưa có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="p-3 flex gap-3 items-start border-b border-border/40 last:border-b-0 cursor-pointer"
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Người dùng</span> {getNotificationText(notification)}
                </p>
                {notification.content && (
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{notification.content}</p>
                )}
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
