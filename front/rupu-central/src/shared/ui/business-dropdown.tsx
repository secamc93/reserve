/**
 * Business Dropdown
 * Dropdown persistente para seleccionar negocio dentro del tipo activo
 * Super admin: carga negocios desde API por business_type_id
 * Usuario normal: filtra businesses_data local por tipo
 */
'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { getBusinessesAction } from '@/services/auth/businesses/infrastructure/actions/get-businesses.action';

interface DropdownBusiness {
  id: number;
  name: string;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
}

export function BusinessDropdown() {
  const [businesses, setBusinesses] = useState<DropdownBusiness[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const loadBusinesses = async () => {
      const userData = TokenStorage.getUser();
      const activeType = TokenStorage.getActiveBusinessType();
      const currentBusiness = TokenStorage.getActiveBusiness();
      const isSuper = userData?.is_super_admin || false;

      setIsSuperAdmin(isSuper);
      setActiveBusiness(currentBusiness);

      if (isSuper && activeType) {
        // Super admin: cargar TODOS los negocios del tipo desde API
        const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
        if (token) {
          try {
            // Obtener business_type_id desde businesses_data o config
            const allLocal = TokenStorage.getBusinessesData() || [];
            const sampleBusiness = allLocal.find(b => b.business_type_code === activeType);
            let businessTypeId = sampleBusiness?.business_type_id;

            // Mapeo fallback por code
            if (!businessTypeId) {
              const typeIdMap: Record<string, number> = {
                'horizontal_property': 11,
                'sport_training': 12,
                'restaurants': 1,
              };
              businessTypeId = typeIdMap[activeType];
            }

            if (businessTypeId) {
              const result = await getBusinessesAction({
                token,
                page: 1,
                per_page: 100,
                business_type_id: businessTypeId,
              });

              if (result.success && result.data) {
                setBusinesses(result.data.businesses.map(b => ({
                  id: b.id,
                  name: b.name,
                  primary_color: b.primary_color,
                  secondary_color: b.secondary_color,
                  tertiary_color: b.tertiary_color,
                  quaternary_color: b.quaternary_color,
                })));
              }
            }
          } catch (err) {
            console.error('Error cargando negocios:', err);
          }
        }
      } else if (activeType) {
        // Usuario normal: filtrar desde localStorage
        const allLocal = TokenStorage.getBusinessesData() || [];
        const filtered = allLocal.filter(b => b.business_type_code === activeType);
        setBusinesses(filtered.map(b => ({
          id: b.id,
          name: b.name,
          primary_color: b.primary_color,
          secondary_color: b.secondary_color,
          tertiary_color: b.tertiary_color,
          quaternary_color: b.quaternary_color,
        })));
      }

      setLoadingList(false);
    };

    loadBusinesses();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBusinessId = parseInt(e.target.value);
    if (isNaN(newBusinessId)) return;

    setLoading(true);
    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) { setLoading(false); return; }

    try {
      const result = await generateBusinessTokenAction({
        business_id: newBusinessId,
        session_token: sessionToken,
      });

      if (result.success && result.data) {
        TokenStorage.setBusinessToken(result.data.token);
        TokenStorage.setActiveBusiness(newBusinessId);
        TokenStorage.removeUserPermissions();

        const business = businesses.find(b => b.id === newBusinessId);
        if (business) {
          TokenStorage.setBusinessColors({
            primary: business.primary_color || '#0f172a',
            secondary: business.secondary_color || '#be185d',
            tertiary: business.tertiary_color || '#06b6d4',
            quaternary: business.quaternary_color || '#f59e0b',
          });
        }

        // Para horizontal_property, navegar al detalle de la propiedad
        const activeType = TokenStorage.getActiveBusinessType();
        if (activeType === 'horizontal_property') {
          window.location.href = `/properties/${newBusinessId}`;
        } else {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Error cambiando negocio:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!TokenStorage.getActiveBusinessType()) return null;

  return (
    <div className="flex items-center gap-3">
      {isSuperAdmin && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
          SUPER ADMIN
        </span>
      )}
      <select
        value={activeBusiness !== null && activeBusiness !== 0 ? activeBusiness : ''}
        onChange={handleChange}
        disabled={loading || loadingList}
        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[220px] disabled:opacity-50"
      >
        <option value="">{loadingList ? 'Cargando negocios...' : '-- Selecciona un negocio --'}</option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>{b.name}</option>
        ))}
      </select>
      {(loading || loadingList) && (
        <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
    </div>
  );
}
