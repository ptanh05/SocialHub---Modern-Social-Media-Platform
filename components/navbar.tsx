'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Compass, Settings, LogOut, Search, Mail, Menu, X } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { SearchBar } from '@/components/search-bar';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  const NavLinks = () => (
    <>
      <Link href="/feed" onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive('/feed') ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </Button>
      </Link>
      <Link href="/explore" onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive('/explore') ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Khám phá</span>
        </Button>
      </Link>
      <Link href="/activity" onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive('/activity') ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Search className="w-4 h-4" />
          <span>Hoạt động</span>
        </Button>
      </Link>
      <Link href="/messages" onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive('/messages') ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Mail className="w-4 h-4" />
          <span>Tin nhắn</span>
        </Button>
      </Link>
      <Link href="/settings" onClick={() => setMobileOpen(false)}>
        <Button
          variant={isActive('/settings') ? 'default' : 'ghost'}
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt</span>
        </Button>
      </Link>
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link href="/feed" className="font-bold text-lg text-primary whitespace-nowrap">
            SocialHub
          </Link>

          <div className="hidden sm:flex flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLinks />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden md:block">
              <NotificationBell />
            </div>
            <Link href="/messages" className="hidden md:block">
              <Button variant="ghost" size="icon">
                <Mail className="w-5 h-5" />
              </Button>
            </Link>

            <div className="hidden md:block">
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
                      <span>Trang cá nhân</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Cài đặt</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Mở menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`md:hidden fixed inset-0 z-40 flex flex-col animate-fade-in-scale origin-top-right transition-all duration-200 ease-out ${
          mobileOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ top: '60px', pointerEvents: mobileOpen ? 'auto' : 'none' }}
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div className="relative z-50 w-full bg-background border-b border-border shadow-lg animate-fade-in-scale">
          <div className="px-4 py-3 space-y-1">
            <div className="sm:hidden mb-3">
              <SearchBar />
            </div>

            <NavLinks />

            <div className="pt-2 border-t border-border/40">
              <NotificationBell />
            </div>

            <div className="pt-2 border-t border-border/40">
              <Link href={`/profile/${user.username}`} onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>Trang cá nhân</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
