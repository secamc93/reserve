'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../presentation/hooks/useAuth';
import Layout from '../../presentation/components/Layout';

export default function ReservasPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner-large"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Se redirigirá automáticamente
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">📋 Gestión de Reservas</h1>
        <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
      </div>
    </Layout>
  );
} 