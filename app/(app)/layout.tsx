'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Spinner } from '@/components/ui/spinner';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="bg-background">
        {children}
      </main>
    </>
  );
}
