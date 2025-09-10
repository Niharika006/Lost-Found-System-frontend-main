'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Define public paths that do not require authentication
    const publicPaths = ['/auth/sign-in', '/auth/sign-up'];

    // If not authenticated and not on a public path, redirect to sign-in
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/auth/sign-in');
    }
  }, [isAuthenticated, pathname, router]);

  // If on a public path, or authenticated and on a non-public path, render children
  // Also, if not authenticated but on a public path, we render children to allow access to sign-in/sign-up
  const isPublicPath = ['/auth/sign-in', '/auth/sign-up'].includes(pathname);

  if (isAuthenticated || isPublicPath) {
    return <>{children}</>;
  }

  // Optionally, render a loading spinner or null while redirecting
  return null;
}
