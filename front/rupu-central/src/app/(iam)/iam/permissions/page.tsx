'use client';

import { PermissionsTable } from '@/services/auth/permissions/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RupuLoader } from '@/shared/ui/rupu-loader';
import { IamPage, IamPageHeader } from '@/shared/ui/iam-navigation';

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
    <IamPage>
      <IamPageHeader title="Permisos" description="Cada permiso es una acción sobre un recurso. Los roles los agrupan en Roles y permisos." />
      <PermissionsTable token={token || ''} />
    </IamPage>
  );
}