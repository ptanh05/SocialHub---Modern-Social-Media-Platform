'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useUserPosts } from '@/hooks/use-posts';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/post-card';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';

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
        // Update follow status
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
      console.error('Failed to toggle follow:', error);
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
      {/* Profile Header */}
      <Card className="mb-6 border-border/40">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                  <p className="text-muted-foreground">@{profile.username}</p>
                </div>
                {!isOwnProfile && (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                    variant={followStatus?.following ? 'outline' : 'default'}
                  >
                    {followStatus?.following ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
              {profile.bio && (
                <p className="mt-2 text-foreground text-sm">{profile.bio}</p>
              )}
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="font-semibold text-foreground">{posts.length}</p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile.following}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No posts yet</p>
        ) : (
          posts.map((post: any) => (
            <PostCard
              key={post.id}
              post={post}
              author={{
                name: profile.name,
                username: profile.username,
                avatar: profile.avatar,
              }}
              isOwner={isOwnProfile}
            />
          ))
        )}
      </div>
    </div>
  );
}
