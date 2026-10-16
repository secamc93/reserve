/**
 * Layout para paginas de Propiedad Horizontal
 */
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner, Alert, MobileTopBar, useActiveProperty } from '@shared/ui';
import { HORIZONTAL_PROPERTY_TYPE, PROPERTY_PICKER_PATH, mustPickProperty } from '@/shared/utils/properties';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';

export default function PropertyHorizontalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string; is_super_admin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: permissionsError } = usePermissions();
  const activeProperty = useActiveProperty();

  useEffect(() => {
    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    const userData = TokenStorage.getUser();

    if (!token || !userData) { router.push('/login'); return; }

    // El producto es solo de propiedad horizontal: no hay selector de módulo.
    if (TokenStorage.getActiveBusinessType() !== HORIZONTAL_PROPERTY_TYPE) TokenStorage.setActiveBusinessType(HORIZONTAL_PROPERTY_TYPE);

    // Sin propiedad elegida, primero hay que elegirla (super admin o usuario con varias).
    if (mustPickProperty(pathname, TokenStorage.getActiveBusiness())) { router.replace(PROPERTY_PICKER_PATH); return; }

    setUser({
      userId: String(userData.id), name: userData.name, email: userData.email,
      role: userData.role || '', avatarUrl: userData.avatarUrl, is_super_admin: userData.is_super_admin,
    });
    setLoading(false);
  }, [router, pathname]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" color="primary" text="Cargando..." /></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Teléfono (< md): sin barra lateral; barra inferior + menú de módulos. La propiedad se cambia
          con "Cambiar propiedad" (solo si el usuario tiene dos o más). */}
      <Sidebar user={user} mobileNav />
      <main
        className="flex-1 min-w-0 min-h-screen bg-gray-50 transition-all duration-300 md:ml-20 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0"
      >
        <MobileTopBar property={activeProperty} />
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 hidden md:flex items-center justify-end">
          {user?.is_super_admin && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
              SUPER ADMIN
            </span>
          )}
        </div>
        {permissionsError && <div className="p-4"><Alert type="error" onClose={() => {}}>{permissionsError}</Alert></div>}
        {children}
      </main>
    </div>
  );
}
