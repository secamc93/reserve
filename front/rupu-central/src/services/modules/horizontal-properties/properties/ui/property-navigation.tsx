/**
 * Navegación para una propiedad horizontal
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';

interface PropertyNavigationProps {
  businessId: number;
  propertyName?: string;
}

export function PropertyNavigation({ businessId, propertyName }: PropertyNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    { href: `/properties/${businessId}`, label: 'Resumen' },
    { href: `/properties/${businessId}/units`, label: 'Unidades' },
    { href: `/properties/${businessId}/residents`, label: 'Residentes' },
    { href: `/properties/${businessId}/voting-groups`, label: 'Votaciones' },
    { href: `/properties/${businessId}/fees`, label: 'Cuotas' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Propiedad</p>
          <p className="text-lg font-semibold text-gray-900">
            {propertyName || `Propiedad #${businessId}`}
          </p>
        </div>
        <nav className="flex gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
