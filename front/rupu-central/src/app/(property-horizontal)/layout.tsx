/**
 * Layout para paginas de Propiedad Horizontal
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner, Alert, MobileTopBar, useActiveProperty, useMediaQuery, DESKTOP_MEDIA_QUERY } from '@shared/ui';
import { BusinessDropdown } from '@/shared/ui/business-dropdown';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';

export default function PropertyHorizontalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string; is_super_admin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: permissionsError } = usePermissions();
  const activeProperty = useActiveProperty();
  // El selector de propiedad se monta una sola vez: en la barra superior (escritorio) o en el
  // menú de módulos (teléfono). Así no carga la lista dos veces.
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

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
      {/* Teléfono (< md): sin barra lateral; barra inferior + menú de módulos (con el selector de propiedad). */}
      <Sidebar user={user} mobileNav mobileSheetExtra={isDesktop ? undefined : <BusinessDropdown />} />
      <main
        className="flex-1 min-w-0 min-h-screen bg-gray-50 transition-all duration-300 md:ml-20 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        <MobileTopBar property={activeProperty} />
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 hidden md:flex items-center justify-end">
          {isDesktop && <BusinessDropdown />}
        </div>
        {permissionsError && <div className="p-4"><Alert type="error" onClose={() => {}}>{permissionsError}</Alert></div>}
        {children}
      </main>
    </div>
  );
}
