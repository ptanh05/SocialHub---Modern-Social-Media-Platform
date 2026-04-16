'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, UserCheck } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FollowingPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const { data: users = [], isLoading } = useSWR<UserItem[]>(
    `/api/users/followers?userId=${username}&type=following`,
    fetcher
  );

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div
        className={`mb-6 flex items-center gap-3 transition-all duration-500 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary" />
            Đang theo dõi
          </h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : users.length === 0 ? (
        <Card
          className={`transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <CardContent className="py-12 text-center text-muted-foreground">
            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Chưa theo dõi ai</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.username}`}
              className={`block transition-all duration-500 ease-out ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${100 + index * 50}ms` }}
            >
              <Card className="hover:border-primary/50 transition-all duration-200 hover-lift">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
