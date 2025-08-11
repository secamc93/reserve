'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/ui/hooks/useAuth';
import Layout from '@/shared/ui/components/Layout';
import Calendar from '@/features/reservations/ui/components/Calendar';

export default function CalendarPage() {
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
      <Calendar />
    </Layout>
  );
} 