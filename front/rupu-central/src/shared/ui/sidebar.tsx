/**
 * Sidebar de navegacion
 * Muestra items dinamicos segun el tipo de negocio activo.
 * Con `mobileNav` (layouts de propiedad horizontal e IAM): en escritorio (>= md) es la barra
 * lateral de siempre; en teléfono (< md) se oculta y en su lugar se muestra `MobileNav` (barra
 * inferior con el logo de la propiedad y menú de módulos). Sin `mobileNav` se comporta como antes.
 * Con `variant="floating"` en escritorio se muestran `FloatingNav` (barra superior flotante: el
 * logo de la propiedad despliega los módulos como iconos) y `FloatingRail` (riel lateral con los
 * submenús del módulo actual); el contenido deja libre el riel con `md:pl-[84px]`.
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { TokenStorage } from '@shared/config';
import { UserInfoModal } from '@/services/auth';
import { usePermissions } from '@/services/auth/permissions/ui/hooks';
import { BUSINESS_TYPE_CONFIG } from '@/shared/config/business-type-config';
import type { SidebarItemConfig } from '@/shared/config/business-type-config';
import { buildNavItems, filterSidebarItemsByResource, moduleTutorialsHref, resolveBusinessHref } from '@/shared/utils/navigation';
import { MobileNav } from './mobile-nav';
import { FloatingNav } from './floating-nav';
import { FloatingRail } from './floating-rail';
import { useActiveProperty } from './use-active-property';
import { PropertyLogo } from './property-logo';
import { useAccessibleProperties } from './use-accessible-properties';
import { canSwitchProperty, hasActiveProperty } from '../utils/properties';

interface SidebarProps {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    is_super_admin?: boolean;
  } | null;
  /** Muestra la barra inferior en teléfono (< md) y oculta ahí la barra lateral. */
  mobileNav?: boolean;
  /** `floating`: barra superior flotante en escritorio en lugar de la barra lateral. */
  variant?: 'rail' | 'floating';
}

export function Sidebar({ user, mobileNav = false, variant = 'rail' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { hasResource } = usePermissions();
  const activeProperty = useActiveProperty();
  const { properties } = useAccessibleProperties();
  // El super admin siempre puede ir al selector (ahí también crea propiedades), aunque haya una sola.
  const showChangeProperty = canSwitchProperty(properties) || Boolean(TokenStorage.getUser()?.is_super_admin);
  const goToPropertyPicker = () => router.push('/properties');

  const handleLogout = () => {
    TokenStorage.clearSession();
    router.push('/login');
  };

  if (!user) return null;

  const isLinkActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Tipo de negocio activo
  const activeType = TokenStorage.getActiveBusinessType();
  const activeTypeName = TokenStorage.getActiveBusinessTypeName();
  const activeBizId = TokenStorage.getActiveBusiness();
  const typeConfig = activeType ? BUSINESS_TYPE_CONFIG[activeType] : null;

  // Los módulos de la propiedad solo aparecen con una propiedad elegida (si no, el layout lleva al
  // selector). Resolver {businessId} en los hrefs.
  const propertyItems = hasActiveProperty(activeBizId)
    ? filterSidebarItemsByResource(typeConfig?.sidebarItems || [], hasResource)
    : [];
  const dynamicItems: SidebarItemConfig[] = propertyItems.map(item => ({
    ...item,
    href: resolveBusinessHref(item.href, activeBizId),
  }));

  // Tutoriales del módulo actual (solo en los módulos que ya tienen).
  const tutorialsHref = hasActiveProperty(activeBizId) ? moduleTutorialsHref(pathname ?? "", activeBizId) : undefined;

  // Permisos IAM
  const canAccessIAM = hasResource('Usuarios') || hasResource('Roles') || hasResource('Permisos') || hasResource('Recursos') || hasResource('Tipos de Negocio') || hasResource('Negocios');

  // Mismos módulos para la barra inferior y el menú de módulos del teléfono.
  const navItems = buildNavItems({
    sidebarItems: propertyItems,
    activeBusinessId: activeBizId,
    canAccessIAM,
  });

  const renderNavItem = (href: string, iconPath: string, label: string) => {
    const active = isLinkActive(href);
    return (
      <li key={href}>
        <Link
          href={href}
          className={`
            flex items-center gap-3 p-3 rounded-lg transition-all duration-300
            ${active
              ? 'bg-white/20 text-white shadow-lg scale-105'
              : 'text-white/80 hover:bg-white/10 hover:text-white hover:scale-105'
            }
          `}
        >
          {active && (
            <div
              className="absolute left-0 w-1 h-8 rounded-r-full"
              style={{ backgroundColor: 'var(--color-tertiary)' }}
            />
          )}
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
          {sidebarExpanded && (
            <span className="text-sm font-medium transition-opacity duration-300">{label}</span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {variant === 'floating' ? (
      <>
      <FloatingNav
        items={navItems}
        property={activeProperty}
        fallbackName={activeTypeName || undefined}
        user={user}
        onLogout={handleLogout}
        onOpenProfile={() => setShowUserModal(true)}
      />
      <FloatingRail onChangeProperty={showChangeProperty ? goToPropertyPicker : undefined} tutorialsHref={tutorialsHref} />
      </>
      ) : (
      <aside
        className={`fixed left-0 top-0 h-full transition-all duration-300 z-30${mobileNav ? ' hidden md:block' : ''}`}
        style={{
          width: sidebarExpanded ? '250px' : '80px',
          backgroundColor: 'var(--color-primary)'
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Propiedad activa (logo) */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <PropertyLogo name={activeProperty?.name || 'Rupü'} logoUrl={activeProperty?.logoUrl} size={48} />
              {sidebarExpanded && (
                <div className="text-white overflow-hidden">
                  <p className="font-semibold text-sm truncate">{activeProperty?.name || 'Rupü'}</p>
                  <p className="text-xs text-white/70 truncate">{activeProperty ? 'Propiedad horizontal' : 'Elige una propiedad'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tipo de negocio activo */}
          {activeTypeName && sidebarExpanded && (
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-xs text-white/50 uppercase tracking-wider">{activeTypeName}</p>
            </div>
          )}

          {/* Navegacion */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {/* Items dinamicos del tipo de negocio */}
              {dynamicItems.map((item) => renderNavItem(item.href, item.iconPath, item.label))}

              {/* Separador si hay items dinamicos y IAM */}
              {dynamicItems.length > 0 && canAccessIAM && (
                <li className="py-2">
                  <div className="border-t border-white/10" />
                </li>
              )}

              {/* IAM */}
              {canAccessIAM && renderNavItem(
                '/iam',
                'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
                'IAM'
              )}

            </ul>
          </nav>

          {/* Footer: Cambiar propiedad (solo con dos o más) + Logout */}
          <div className="p-3 border-t border-white/10 space-y-1">
            {showChangeProperty && (
            <button
              onClick={goToPropertyPicker}
              title="Cambiar propiedad"
              aria-label="Cambiar propiedad"
              className="w-full flex items-center gap-3 text-white/60 hover:bg-white/10 hover:text-white p-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {sidebarExpanded && <span className="text-sm">Cambiar propiedad</span>}
            </button>
            )}

            {/* Usuario */}
            <button
              type="button"
              onClick={() => setShowUserModal(true)}
              title={user.name}
              aria-label={`Perfil de ${user.name}`}
              className="w-full flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded-lg transition-colors text-left"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white/20" />
              ) : (
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              {sidebarExpanded && (
                <span className="overflow-hidden">
                  <span className="block font-semibold text-sm truncate">{user.name}</span>
                  <span className="block text-xs text-white/70 truncate">{user.email}</span>
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-white hover:bg-white/10 p-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarExpanded && <span className="text-sm">Cerrar Sesion</span>}
            </button>
          </div>
        </div>
      </aside>
      )}

      {mobileNav && (
      <MobileNav
        items={navItems}
        property={activeProperty}
        fallbackName={activeTypeName || undefined}
        user={user}
        onLogout={handleLogout}
        onChangeProperty={showChangeProperty ? goToPropertyPicker : undefined}
        tutorialsHref={tutorialsHref}
        onOpenProfile={() => setShowUserModal(true)}
      />
      )}

      <UserInfoModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onLogout={handleLogout}
        user={user}
      />
    </>
  );
}
