'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch, useTrendingHashtags } from '@/hooks/use-search';
import { PostCard } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hash, Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, isLoading } = useSearch(query, 'all');
  const { hashtags } = useTrendingHashtags();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {query && (
        <div
          className={`mb-8 transition-all duration-500 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Search className="w-6 h-6 text-primary" />
            Kết quả tìm kiếm
          </h1>
          <p className="text-muted-foreground">Kết quả cho "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="mb-8">
          <div
            className={`mb-8 transition-all duration-500 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Search className="w-7 h-7 text-primary" />
              Khám phá
            </h1>
            <p className="text-muted-foreground">Khám phá các chủ đề và người dùng đang thịnh hành</p>
          </div>

          <Card
            className={`mb-8 transition-all duration-500 ease-out ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                Hashtag thịnh hành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {hashtags.map((tag: any, index: number) => (
                  <Link
                    key={tag.id}
                    href={`/hashtag/${tag.tag}`}
                    className={`p-3 border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all duration-200 hover-lift text-center animate-fade-in-up`}
                    style={{ animationDelay: `${150 + index * 50}ms` }}
                  >
                    <p className="font-semibold text-primary">#{tag.tag}</p>
                    <p className="text-xs text-muted-foreground">{tag.count} bài viết</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {query && isLoading && (
        <div className="text-center py-12 text-muted-foreground animate-pulse">Đang tìm kiếm...</div>
      )}

      {query && results && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Tất cả ({(results.posts?.length || 0) + (results.users?.length || 0)})
            </TabsTrigger>
            <TabsTrigger value="posts" className="text-xs sm:text-sm">
              Bài viết ({results.posts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              Người dùng ({results.users?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {(results.users?.length || 0) > 0 && (
              <div
                className={`transition-all duration-500 ease-out ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '50ms' }}
              >
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  Người dùng
                </h2>
                <div className="space-y-2">
                  {results.users?.map((user: any, index: number) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all duration-200 hover-lift animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(results.posts?.length || 0) > 0 && (
              <div
                className={`transition-all duration-500 ease-out ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Bài viết
                </h2>
                <div className="space-y-4">
                  {results.posts?.map((post: any, index: number) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={{ name: 'Người dùng', username: 'user', avatar: '' }}
                      animationDelay={index * 60}
                    />
                  ))}
                </div>
              </div>
            )}

            {(!results.posts?.length && !results.users?.length) && (
              <div className="text-center py-12 text-muted-foreground animate-fade-in">
                Không tìm thấy kết quả
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {results.posts?.length ? (
              results.posts.map((post: any, index: number) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={{ name: 'Người dùng', username: 'user', avatar: '' }}
                  animationDelay={index * 60}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground animate-fade-in">Không có bài viết nào</div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-2 mt-6">
            {results.users?.length ? (
              results.users.map((user: any, index: number) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted hover:border-primary/50 transition-all duration-200 hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground animate-fade-in">Không tìm thấy người dùng</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
