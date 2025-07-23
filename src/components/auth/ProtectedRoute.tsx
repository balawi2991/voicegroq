'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SpaceBackground } from '@/components/space/StarField';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, error } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to:', redirectTo);
      window.location.href = redirectTo;
    }
  }, [loading, isAuthenticated, redirectTo]);

  useEffect(() => {
    if (error) {
      console.error('Auth error:', error);
    }
  }, [error]);

  if (loading) {
    return (
      <SpaceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-white text-lg">جاري التحميل...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <SpaceBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg">جاري إعادة التوجيه...</p>
          </div>
        </div>
      </SpaceBackground>
    );
  }

  return <>{children}</>;
}
