'use client';

import { useHashtag } from '@/hooks/use-search';
import { PostCard } from '@/components/post-card';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HashtagPage({ params }: { params: { tag: string } }) {
  const decodedTag = decodeURIComponent(params.tag);
  const { hashtag, posts, isLoading } = useHashtag(decodedTag);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/explore" className="flex items-center gap-2 text-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại khám phá
      </Link>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải hashtag...</div>
      ) : !hashtag ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Không tìm thấy hashtag</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-8 p-4 border border-border rounded-lg bg-muted/50">
            <h1 className="text-3xl font-bold text-primary">#{decodedTag}</h1>
            <p className="text-muted-foreground mt-2">{hashtag.count} bài viết</p>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Chưa có bài viết nào với hashtag này</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={{
                    name: 'Người dùng',
                    username: 'user',
                    avatar: '',
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
