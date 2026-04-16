'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: results = [] } = useSWR<User[]>(
    searchQuery ? `/api/users/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Explore</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results */}
      {searchQuery && results.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No users found</p>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((user) => (
            <Link key={user.id} href={`/profile/${user.username}`}>
              <Card className="hover:border-primary/50 transition cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-foreground mt-1">{user.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">Search for users to get started</p>
        </Card>
      )}
    </div>
  );
}
