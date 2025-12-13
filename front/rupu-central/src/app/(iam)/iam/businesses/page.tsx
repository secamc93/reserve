'use client';

import { BusinessesTable } from '@/services/auth/businesses/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RupuLoader } from '@/shared/ui/rupu-loader';

export default function IAMBusinessesPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <RupuLoader size={128} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      <BusinessesTable token={token || ''} />
    </div>
  );
}

