'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/shared/contexts/AppContext';
import Layout from '@/shared/ui/components/Layout';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isInitialized } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, isInitialized, router]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
} 