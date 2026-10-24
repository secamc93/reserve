'use client';

import { ResourcesTable } from '@/services/auth/resources/ui';
import { useAuthSimple as useAuth } from '@/services/auth/users/ui/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RupuLoader } from '@/shared/ui/rupu-loader';
import { IamPage, IamPageHeader } from '@/shared/ui/iam-navigation';

export default function IAMResourcesPage() {
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
      <IamPageHeader title="Recursos" description="Los módulos de Rupü a los que se aplican los permisos." />
      <ResourcesTable token={token || ''} />
    </IamPage>
  );
}