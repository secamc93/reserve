'use client';

import { HomeIcon, ChevronRightIcon, KeyIcon } from '@heroicons/react/24/outline';
import { PermissionsTable } from '@/services/auth/permissions/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RupuLoader } from '@/shared/ui/rupu-loader';

export default function IAMPermissionsPage() {
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
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Permissions Table */}
        <PermissionsTable token={token || ''} />
      </div>
    </div>
  );
}