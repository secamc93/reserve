/**
 * Layout para paginas de Propiedad Horizontal
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner, Alert } from '@shared/ui';
import { BusinessDropdown } from '@/shared/ui/business-dropdown';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';

export default function PropertyHorizontalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string; is_super_admin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { error: permissionsError } = usePermissions();

  useEffect(() => {
    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    const userData = TokenStorage.getUser();

    if (!token || !userData) { router.push('/login'); return; }

    // Guard: verificar tipo activo
    const activeType = TokenStorage.getActiveBusinessType();
    if (activeType && activeType !== 'horizontal_property') { router.push('/select-type'); return; }

    setUser({
      userId: String(userData.id), name: userData.name, email: userData.email,
      role: userData.role || '', avatarUrl: userData.avatarUrl, is_super_admin: userData.is_super_admin,
    });
    setLoading(false);
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" color="primary" text="Cargando..." /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <main
        className="flex-1 min-h-screen bg-gray-50 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? '250px' : '80px' }}
        onMouseEnter={() => setSidebarExpanded(false)}
      >
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end">
          <BusinessDropdown />
        </div>
        {permissionsError && <div className="p-4"><Alert type="error" onClose={() => {}}>{permissionsError}</Alert></div>}
        {children}
      </main>
    </div>
  );
}
