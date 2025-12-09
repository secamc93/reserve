'use client';

import Link from 'next/link';
import { HomeIcon, ChevronRightIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { RolesTable } from '@/services/auth/roles/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IAMRolesPage() {
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
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Roles Table */}
        <RolesTable token={token || ''} />
      </div>
    </div>
  );
}