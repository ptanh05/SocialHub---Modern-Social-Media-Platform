'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserPosts } from '@/hooks/use-posts';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/post-card';
import { Spinner } from '@/components/ui/spinner';
import { User, Users } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuth();
  const { posts } = useUserPosts(username);
  const { data: profile, mutate: mutateProfile } = useSWR<UserProfile>(
    `/api/users/${username}`,
    fetcher
  );
  const { data: followStatus } = useSWR(
    `/api/users/${username}/follow`,
    fetcher
  );
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isOwnProfile = currentUser?.username === username;

  const handleFollowToggle = async () => {
    if (!profile) return;

    setIsFollowLoading(true);
    try {
      const method = followStatus?.following ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${username}/follow`, {
        method,
      });

      if (response.ok) {
        mutateProfile(
          {
            ...profile,
            followers: followStatus?.following
              ? profile.followers - 1
              : profile.followers + 1,
          },
          false
        );
      }
    } catch (error) {
      console.error('Theo dõi thất bại:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card
        className={`mb-6 border-border/40 transition-all duration-500 ease-out hover-lift ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Avatar className="h-24 w-24 mx-auto sm:mx-0 transition-transform hover:scale-105">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    variant={followStatus?.following ? 'outline' : 'default'}
                    className="transition-all duration-200 active:scale-95"
                  >
                    {isFollowLoading ? 'Đang...' : followStatus?.following ? 'Đã theo dõi' : 'Theo dõi'}
                  </Button>
                )}
              </div>
              {profile.bio && (
                <p className="mt-3 text-foreground text-sm">{profile.bio}</p>
              )}
              <div className="flex justify-center sm:justify-start gap-6 mt-4">
                <div className="text-center">
                  <p className="font-semibold text-foreground">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Bài viết</p>
                </div>
                <button
                  onClick={() => router.push(`/profile/${username}/followers`)}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <p className="font-semibold text-foreground">{profile.followers}</p>
                  <p className="text-xs text-muted-foreground">Người theo dõi</p>
                </button>
                <button
                  onClick={() => router.push(`/profile/${username}/following`)}
                  className="text-center hover:opacity-80 transition-opacity"
                >
                  <p className="font-semibold text-foreground">{profile.following}</p>
                  <p className="text-xs text-muted-foreground">Đang theo dõi</p>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2
          className={`text-xl font-bold text-foreground transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          Bài viết
        </h2>
        {posts.length === 0 ? (
          <div
            className={`text-center py-12 transition-all duration-500 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-medium">Chưa có bài viết nào</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isOwnProfile ? 'Hãy chia sẻ điều gì đó trước tiên!' : 'Người dùng này chưa đăng bài viết nào.'}
            </p>
          </div>
        ) : (
          posts.map((post: any, index: number) => (
            <PostCard
              key={post.id}
              post={post}
              author={{
                name: profile.name,
                username: profile.username,
                avatar: profile.avatar,
              }}
              isOwner={isOwnProfile}
              animationDelay={150 + index * 80}
            />
          ))
        )}
      </div>
    </div>
  );
}
