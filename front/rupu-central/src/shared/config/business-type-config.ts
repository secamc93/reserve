/**
 * Configuracion de tipos de negocio
 * Define sidebar items y rutas por tipo
 */

export interface SidebarItemConfig {
  label: string;
  href: string; // Puede contener {businessId} como placeholder
  iconPath: string; // SVG path for stroke icon
}

export interface BusinessTypeConfig {
  label: string;
  description: string;
  icon: string; // emoji
  homeRoute: string;
  sidebarItems: SidebarItemConfig[];
}

export const BUSINESS_TYPE_CONFIG: Record<string, BusinessTypeConfig> = {
  horizontal_property: {
    label: 'Propiedad Horizontal',
    description: 'Condominios, unidades, residentes, parqueaderos',
    icon: '🏢',
    homeRoute: '/properties',
    sidebarItems: [
      {
        label: 'Resumen',
        href: '/properties/{businessId}',
        iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      },
      {
        label: 'Unidades',
        href: '/properties/{businessId}/units',
        iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      },
      {
        label: 'Residentes',
        href: '/properties/{businessId}/residents',
        iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      },
      {
        label: 'Visitas',
        href: '/properties/{businessId}/visits',
        iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
      },
      {
        label: 'Paqueteria',
        href: '/properties/{businessId}/packages',
        iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      },
      {
        label: 'Zonas Comunes',
        href: '/properties/{businessId}/common-areas',
        iconPath: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      },
      {
        label: 'Parqueaderos',
        href: '/properties/{businessId}/parking',
        iconPath: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M3 16h10m-7 0h8m2-8h3l3 4v4h-2',
      },
      {
        label: 'Votaciones',
        href: '/properties/{businessId}/voting-groups',
        iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      },
    ],
  },
};

/**
 * Obtiene la config de un tipo de negocio o undefined si no existe
 */
export function getBusinessTypeConfig(typeCode: string): BusinessTypeConfig | undefined {
  return BUSINESS_TYPE_CONFIG[typeCode];
}
