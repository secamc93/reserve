/**
 * Layout para páginas de IAM (Identity & Access Management)
 * Incluye el sidebar de navegación y protección de autenticación
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner } from '@shared/ui';
import { IAMNavigation } from '@modules/auth/ui';

export default function IamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const token = TokenStorage.getToken();
    const userData = TokenStorage.getUser();

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" color="primary" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <main 
        className="flex-1 transition-all duration-300 w-full"
        style={{ 
          marginLeft: sidebarExpanded ? '250px' : '80px' 
        }}
        onMouseEnter={() => setSidebarExpanded(false)}
      >
        {/* Navegación IAM horizontal */}
        <IAMNavigation />
        
        {/* Contenido de las páginas */}
        {children}
      </main>
    </div>
  );
}
