/**
 * Layout para paginas de Propiedad Horizontal
 */
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Sidebar, Spinner, Alert, MobileTopBar, useActiveProperty } from '@shared/ui';
import { HORIZONTAL_PROPERTY_TYPE, PROPERTY_PICKER_PATH, hasActiveProperty, mustPickProperty } from '@/shared/utils/properties';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';
import { BUSINESS_TYPE_CONFIG } from '@/shared/config/business-type-config';
import { resolveAllowedPath, resolveBusinessHref } from '@/shared/utils/navigation';

export default function PropertyHorizontalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [user, setUser] = useState<{ userId: string; name: string; email: string; role: string; avatarUrl?: string; is_super_admin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: permissionsError, permissions, hasResource } = usePermissions();
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

  // Guarda de módulos: un rol sin el recurso del módulo se lleva al primero que sí tiene.
  const activeBizId = TokenStorage.getActiveBusiness();
  const moduleItems = (BUSINESS_TYPE_CONFIG[HORIZONTAL_PROPERTY_TYPE]?.sidebarItems ?? []).map((item) => ({
    ...item,
    href: resolveBusinessHref(item.href, activeBizId),
  }));
  const allowedPath = permissions && hasActiveProperty(activeBizId) ? resolveAllowedPath(pathname, moduleItems, hasResource) : pathname;

  useEffect(() => {
    if (allowedPath && allowedPath !== pathname) router.replace(allowedPath);
  }, [allowedPath, pathname, router]);

  if (loading || (allowedPath !== null && allowedPath !== pathname)) return <div className="min-h-screen flex items-center justify-center"><Spinner size="xl" color="primary" text="Cargando..." /></div>;

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      {/* Escritorio: barra superior flotante (el logo despliega los módulos) y riel lateral flotante
          con los submenús del módulo. Teléfono (< md): barra
          inferior + menú de módulos; la propiedad se cambia con "Cambiar propiedad" (solo si el
          usuario tiene dos o más). */}
      <Sidebar user={user} mobileNav variant="floating" />
      <main className="min-w-0 min-h-screen md:pl-[84px] lg:pl-[92px] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <MobileTopBar property={activeProperty} />
        {permissionsError && <div className="p-4"><Alert type="error" onClose={() => {}}>{permissionsError}</Alert></div>}
        {allowedPath === null
          ? <div className="p-4"><Alert type="error" onClose={() => {}}>Tu rol no tiene acceso a ningún módulo de esta propiedad. Contacta al administrador.</Alert></div>
          : children}
      </main>
    </div>
  );
}
