'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Button } from './ui/button';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect non-admin users after auth check is complete
    if (!loading && (!user || user.role !== 'admin')) {
      const timer = setTimeout(() => {
        router.push('/home');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Checking access permissions</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-background border border-dashed rounded-lg p-8 shadow-lg text-center">
            <h1 className="text-3xl font-bold mb-2">🔒 Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel. Only administrators can view this page.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Redirecting to home page in 2 seconds...
              </p>
              <Link href="/home">
                <Button className="w-full">Go to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render admin content for authorized users
  return <>{children}</>;
}
