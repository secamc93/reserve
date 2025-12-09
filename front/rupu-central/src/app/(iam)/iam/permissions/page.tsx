'use client';

import Link from 'next/link';
import { HomeIcon, ChevronRightIcon, KeyIcon, PlusIcon } from '@heroicons/react/24/outline';
import { PermissionsTable } from '@/services/auth/permissions/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Actions */}
        <div className="mb-8 flex justify-end">
          <Link href="/iam/permissions/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Permiso
          </Link>
        </div>

        {/* Permissions Table */}
        <PermissionsTable token={token || ''} />
      </div>
    </div>
  );
}