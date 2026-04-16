'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  const [inputFocused, setInputFocused] = useState(false);
  const { data: results = [] } = useSWR<User[]>(
    searchQuery ? `/api/users/search?q=${encodeURIComponent(searchQuery)}` : null,
    fetcher
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">Khám phá</h1>
        <p className="text-muted-foreground text-sm">Tìm kiếm người dùng và nội dung</p>
      </div>

      <div className="relative mb-8 animate-fade-in-up">
        <Search
          className={`absolute left-3 top-3 w-5 h-5 transition-colors duration-200 ${
            inputFocused ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          className={`pl-10 transition-all duration-200 ${
            inputFocused ? 'ring-2 ring-primary/50 border-primary' : ''
          }`}
        />
      </div>

      {searchQuery && results.length === 0 ? (
        <div className="animate-fade-in text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy người dùng</p>
          <p className="text-xs text-muted-foreground mt-1">Thử từ khóa khác</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((user, index) => (
            <div
              key={user.id}
              className={`animate-fade-in-up transition-all duration-300 ${
                inputFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <Link href={`/profile/${user.username}`}>
                <Card className="hover:border-primary/50 transition-all duration-200 hover-lift cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="transition-transform hover:scale-105">
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
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 animate-fade-in">
          <div className="mb-4">
            <Search className="w-12 h-12 mx-auto text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground">Tìm kiếm người dùng để bắt đầu</p>
          <p className="text-xs text-muted-foreground mt-1">Tìm theo tên hoặc tên đăng nhập</p>
        </Card>
      )}
    </div>
  );
}
