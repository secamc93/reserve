/**
 * Sidebar de navegacion
 * Muestra items dinamicos segun el tipo de negocio activo
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

interface SidebarProps {
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    is_super_admin?: boolean;
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { hasResource } = usePermissions();

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

  // Resolver {businessId} en los hrefs
  const dynamicItems: SidebarItemConfig[] = (typeConfig?.sidebarItems || []).map(item => ({
    ...item,
    href: activeBizId !== null && activeBizId !== 0
      ? item.href.replace('{businessId}', String(activeBizId))
      : item.href.replace('/{businessId}', ''),
  }));

  // Permisos IAM
  const canAccessIAM = hasResource('Usuarios') || hasResource('Roles') || hasResource('Permisos') || hasResource('Recursos') || hasResource('Tipos de Negocio') || hasResource('Negocios');
  const canAccessLogs = user?.is_super_admin || false;

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
      <aside
        className="fixed left-0 top-0 h-full transition-all duration-300 z-30"
        style={{
          width: sidebarExpanded ? '250px' : '80px',
          backgroundColor: 'var(--color-primary)'
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Usuario */}
          <div
            className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setShowUserModal(true)}
          >
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-white/20" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              {sidebarExpanded && (
                <div className="text-white overflow-hidden">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-white/70 truncate">{user.email}</p>
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
              {dynamicItems.length > 0 && (canAccessIAM || canAccessLogs) && (
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

              {/* Logs */}
              {canAccessLogs && renderNavItem(
                '/iam/logs',
                'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                'Logs'
              )}
            </ul>
          </nav>

          {/* Footer: Cambiar modulo + Logout */}
          <div className="p-3 border-t border-white/10 space-y-1">
            {/* Cambiar modulo */}
            <button
              onClick={() => router.push('/select-type')}
              className="w-full flex items-center gap-3 text-white/60 hover:bg-white/10 hover:text-white p-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {sidebarExpanded && <span className="text-sm">Cambiar Modulo</span>}
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

      <UserInfoModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onLogout={handleLogout}
        user={user}
      />
    </>
  );
}
