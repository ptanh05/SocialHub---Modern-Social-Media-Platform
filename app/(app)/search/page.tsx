'use client';

import { useSearchParams } from 'next/navigation';
import { useSearch, useTrendingHashtags } from '@/hooks/use-search';
import { PostCard } from '@/components/post-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { results, isLoading } = useSearch(query, 'all');
  const { hashtags } = useTrendingHashtags();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {query && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Results</h1>
          <p className="text-muted-foreground">Results for "{query}"</p>
        </div>
      )}

      {!query && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Explore</h1>

          {/* Trending Hashtags */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Trending Hashtags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {hashtags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/hashtag/${tag.tag}`}
                    className="p-3 border border-border rounded-lg hover:bg-muted transition text-center"
                  >
                    <p className="font-semibold text-primary">#{tag.tag}</p>
                    <p className="text-xs text-muted-foreground">{tag.count} posts</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {query && isLoading && <div className="text-center py-12 text-muted-foreground">Searching...</div>}

      {query && results && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All ({(results.posts?.length || 0) + (results.users?.length || 0)})
            </TabsTrigger>
            <TabsTrigger value="posts">Posts ({results.posts?.length || 0})</TabsTrigger>
            <TabsTrigger value="users">Users ({results.users?.length || 0})</TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {(results.users?.length || 0) > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Users</h2>
                <div className="space-y-2">
                  {results.users?.map((user: any) => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.username}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition"
                    >
                      <Avatar className="h-10 w-10">
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
              <div>
                <h2 className="text-lg font-semibold mb-3">Posts</h2>
                <div className="space-y-4">
                  {results.posts?.map((post: any) => (
                    <PostCard key={post.id} post={post} author={{ name: 'User', username: 'user', avatar: '' }} />
                  ))}
                </div>
              </div>
            )}

            {(!results.posts?.length && !results.users?.length) && (
              <div className="text-center py-12 text-muted-foreground">No results found</div>
            )}
          </TabsContent>

          {/* Posts Only */}
          <TabsContent value="posts" className="space-y-4 mt-6">
            {results.posts?.length ? (
              results.posts.map((post: any) => (
                <PostCard key={post.id} post={post} author={{ name: 'User', username: 'user', avatar: '' }} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">No posts found</div>
            )}
          </TabsContent>

          {/* Users Only */}
          <TabsContent value="users" className="space-y-2 mt-6">
            {results.users?.length ? (
              results.users.map((user: any) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition"
                >
                  <Avatar className="h-10 w-10">
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
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
