'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Compass, Settings, LogOut, Search, Mail } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { SearchBar } from '@/components/search-bar';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/feed" className="font-bold text-lg text-primary whitespace-nowrap">
          SocialHub
        </Link>

        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/feed">
            <Button
              variant={isActive('/feed') ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">Feed</span>
            </Button>
          </Link>
          <Link href="/explore">
            <Button
              variant={isActive('/explore') ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span className="hidden md:inline">Explore</span>
            </Button>
          </Link>

          <NotificationBell />

          <Link href="/messages">
            <Button variant="ghost" size="icon">
              <Mail className="w-5 h-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
