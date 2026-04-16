'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useNotifications } from '@/hooks/use-notifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Activity, Bell, Heart, MessageSquare, UserPlus, Mail } from 'lucide-react';

export default function ActivityPage() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'message': return <Mail className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'message': return 'sent you a message';
      default: return 'interacted with you';
    }
  };

  const ActivitySection = ({ title, items, delay = 0 }: { title: string; items: any[]; delay?: number }) => (
    <div
      className={`mb-6 transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {items.length > 0 && (
        <>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full inline-block" />
            {title}
          </h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 border border-border/40 rounded-lg hover:bg-muted/60 transition-all duration-200 hover-lift cursor-pointer group`}
                style={{ animationDelay: `${(delay + index) * 40}ms` }}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-border">
                    {getIcon(item.type)}
                  </div>
                </div>
                <div className="flex-1 text-sm">
                  <p className="text-foreground">
                    <span className="font-semibold group-hover:text-primary transition-colors duration-200">User</span>{' '}
                    {getActionText(item.type)}
                  </p>
                  {item.content && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-1">
                      {item.content}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const totalNotifications = notifications.length;
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div
        className={`flex items-center justify-between mb-8 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10 animate-pulse-glow">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Activity</h1>
            <p className="text-sm text-muted-foreground">
              {totalNotifications === 0
                ? 'No activity yet'
                : `${totalNotifications} ${totalNotifications === 1 ? 'event' : 'events'} · ${unreadCount} unread`}
            </p>
          </div>
        </div>
      </div>

      {totalNotifications === 0 ? (
        <Card
          className={`animate-fade-in transition-all duration-500 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-medium text-foreground mb-1">No activity yet</p>
            <p className="text-sm text-muted-foreground">
              When someone interacts with your content, it will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <CardContent className="p-6">
            <ActivitySection title="Today" items={groupedActivity.today} delay={0} />
            <ActivitySection title="This Week" items={groupedActivity.thisWeek} delay={100} />
            <ActivitySection title="Older" items={groupedActivity.older} delay={200} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}