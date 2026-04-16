'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Ban } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BlockedPage() {
  const { user } = useAuth();

  const { data: blockedUsers = [], mutate } = useSWR(user ? '/api/blocked' : null, fetcher);

  if (!user) return null;

  const handleUnblock = async (blockedId: string) => {
    if (!confirm('Bỏ chặn người dùng này?')) return;
    try {
      await fetch('/api/blocked', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: blockedId }),
      });
      mutate((prev: any[]) => prev.filter((u: any) => u.id !== blockedId), false);
    } catch (error) {
      console.error('Bỏ chặn thất bại:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Ban className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Người đã chặn</h1>
      </div>

      {blockedUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Bạn chưa chặn ai</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border">
            {blockedUsers.map((blockedUser: any) => (
              <div key={blockedUser.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={blockedUser.avatar} alt={blockedUser.name} />
                    <AvatarFallback>{blockedUser.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{blockedUser.name}</p>
                    <p className="text-sm text-muted-foreground">@{blockedUser.username}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(blockedUser.id)}
                >
                  Bỏ chặn
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
