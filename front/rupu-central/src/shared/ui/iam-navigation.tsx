/**
 * Navegación horizontal secundaria para IAM
 * Muestra todas las opciones de los módulos dentro de auth
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  KeyIcon, 
  CubeTransparentIcon,
  BuildingOfficeIcon,
  TagIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  href: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  {
    href: '/iam',
    label: 'Dashboard',
    title: 'Dashboard IAM',
    description: 'Panel de control de gestión de identidad y acceso',
    icon: BuildingOfficeIcon,
  },
  {
    href: '/iam/users',
    label: 'Usuarios',
    title: 'Gestión de Usuarios',
    description: 'Administra los usuarios del sistema',
    icon: UsersIcon,
  },
  {
    href: '/iam/roles',
    label: 'Roles',
    title: 'Gestión de Roles',
    description: 'Define y administra los roles de usuario en el sistema',
    icon: ShieldCheckIcon,
  },
  {
    href: '/iam/permissions',
    label: 'Permisos',
    title: 'Gestión de Permisos',
    description: 'Administra los permisos detallados para cada acción en el sistema',
    icon: KeyIcon,
  },
  {
    href: '/iam/resources',
    label: 'Recursos',
    title: 'Gestión de Recursos',
    description: 'Administra los recursos del sistema a los que se aplican los permisos',
    icon: CubeTransparentIcon,
  },
  {
    href: '/iam/business-types',
    label: 'Tipos de Negocio',
    title: 'Gestión de Tipos de Negocio',
    description: 'Administra los tipos de negocio disponibles en el sistema',
    icon: TagIcon,
  },
  {
    href: '/iam/businesses',
    label: 'Negocios',
    title: 'Gestión de Negocios',
    description: 'Administra los negocios del sistema',
    icon: BuildingOfficeIcon,
  },
  {
    href: '/iam/logs',
    label: 'Logs',
    title: 'Monitoreo de Logs',
    description: 'Visualiza los logs del sistema en tiempo real',
    icon: DocumentTextIcon,
  },
];

export function IAMNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Encontrar el módulo actual
  const currentModule = navItems.find(
    (item) => pathname === item.href || 
    (item.href !== '/iam' && pathname.startsWith(item.href))
  ) || navItems[0];

  // Verificar capacidad de scroll
  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [pathname]);

  // Scroll funciones
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Título del módulo actual - Izquierda */}
          <div className="flex-shrink-0 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {currentModule.title}
            </h1>
            {currentModule.description && (
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {currentModule.description}
              </p>
            )}
          </div>

          {/* Navegación de módulos - Derecha con scroll */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Botón scroll izquierda */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Desplazar izquierda"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            )}

            {/* Lista scrolleable de módulos */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <nav className="flex items-center gap-1" aria-label="IAM Navigation">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href !== '/iam' && pathname.startsWith(item.href));

                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`
                        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                        whitespace-nowrap
                        ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Botón scroll derecha */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Desplazar derecha"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


