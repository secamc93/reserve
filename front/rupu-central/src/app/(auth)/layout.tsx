/**
 * Layout para páginas autenticadas
 * Incluye el sidebar de navegación
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner } from '@shared/ui';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Páginas que NO deben tener sidebar (login)
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // Verificar autenticación (solo si no es login)
    if (!isLoginPage) {
      const token = TokenStorage.getToken();
      const userData = TokenStorage.getUser();

      if (!token || !userData) {
        router.push('/login');
        return;
      }

      setUser(userData);
    }
    
    setLoading(false);
  }, [router, isLoginPage]);

  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" color="primary" text="Cargando..." />
      </div>
    );
  }

  // Si es la página de login, renderizar sin sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Páginas autenticadas con sidebar
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Contenido principal */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{ 
          marginLeft: sidebarExpanded ? '250px' : '80px' 
        }}
        onMouseEnter={() => setSidebarExpanded(false)}
      >
        {children}
      </main>
    </div>
  );
}

