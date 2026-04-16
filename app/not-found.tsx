import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground max-w-sm">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/feed">
          <Button>Go back home</Button>
        </Link>
      </div>
    </div>
  );
}
