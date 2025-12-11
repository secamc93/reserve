'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { LogsViewer } from '@/services/auth/logs';
import { Spinner } from '@shared/ui';

export default function LogsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación y obtener token
    const sessionToken = TokenStorage.getSessionToken();
    const userData = TokenStorage.getUser();

    if (!sessionToken || !userData) {
      router.push('/login');
      return;
    }

    // Verificar que sea super admin
    const isSuperAdmin = userData.is_super_admin || false;
    if (!isSuperAdmin) {
      router.push('/iam');
      return;
    }

    setToken(sessionToken);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" color="primary" text="Cargando..." />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Logs</h1>
        <p className="text-sm text-gray-600 mt-1">
          Visualiza los logs del sistema en tiempo real
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <LogsViewer token={token} maxLogs={1000} />
      </div>
    </div>
  );
}
