'use client';

import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export default function ActivityPage() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  if (!user) return null;

  const groupedActivity = {
    today: notifications.filter((n) => {
      const date = new Date(n.createdAt);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }),
    thisWeek: notifications.filter((n) => {
      const date = new Date(n.createdAt);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date > oneWeekAgo && date.toDateString() !== new Date().toDateString();
    }),
    older: notifications.filter((n) => {
      const date = new Date(n.createdAt);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date <= oneWeekAgo;
    }),
  };

  const ActivitySection = ({ title, items }: { title: string; items: any[] }) => (
    <>
      {items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-3">{title}</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border border-border/40 rounded-lg hover:bg-muted transition"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <p className="text-foreground">
                    <span className="font-semibold">User</span>{' '}
                    {item.type === 'like' && 'liked your post'}
                    {item.type === 'comment' && 'commented on your post'}
                    {item.type === 'follow' && 'started following you'}
                    {item.type === 'message' && 'sent you a message'}
                  </p>
                  {item.content && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                      {item.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Activity</h1>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <ActivitySection title="Today" items={groupedActivity.today} />
            <ActivitySection title="This Week" items={groupedActivity.thisWeek} />
            <ActivitySection title="Older" items={groupedActivity.older} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
