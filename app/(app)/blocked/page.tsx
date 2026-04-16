'use client';

import { useAuth } from '@/hooks/use-auth';
import { getBlockedUsers, unblockUser } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { Ban } from 'lucide-react';

export default function BlockedPage() {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState(user ? getBlockedUsers(user.id) : []);

  if (!user) return null;

  const handleUnblock = (userId: string) => {
    if (confirm('Unblock this user?')) {
      unblockUser(user.id, userId);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Ban className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Blocked Users</h1>
      </div>

      {blockedUsers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>You haven't blocked anyone</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-border">
            {blockedUsers.map((blockedUser) => (
              <div key={blockedUser.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={blockedUser.avatar} alt={blockedUser.name} />
                    <AvatarFallback>{blockedUser.name.charAt(0)}</AvatarFallback>
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
                  Unblock
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
