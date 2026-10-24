/**
 * Página: elegir propiedad horizontal.
 * Es a donde lleva "Cambiar propiedad" y el login cuando el usuario tiene varias propiedades.
 * - Super admin: ve todas las propiedades y puede crear una nueva ("+ Nueva propiedad").
 * - Demás usuarios: sus propiedades; con una sola, entra directo a ella (el super admin no).
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { Spinner, useAccessibleProperties, selectProperty } from '@shared/ui';
import { vtBtn } from '@shared/ui/ds';
import { CreatePropertyModal } from '@/services/modules/horizontal-properties/properties/ui/create-property-modal';
import { PropertyCards } from '@/services/modules/horizontal-properties/properties/ui/property-cards';

export default function PropertiesPage() {
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const { properties, loading: loadingProperties, error: propertiesError, reload } = useAccessibleProperties();

  useEffect(() => {
    const user = TokenStorage.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    setIsSuperAdmin(Boolean(user.is_super_admin));
    setActiveId(TokenStorage.getActiveBusiness());
  }, [router]);

  // Con una sola propiedad no hay nada que elegir: se entra directo. El super admin se queda, porque
  // aquí también crea propiedades nuevas.
  useEffect(() => {
    if (isSuperAdmin === false && !loadingProperties && properties.length === 1) {
      selectProperty(properties[0]);
    }
  }, [isSuperAdmin, loadingProperties, properties]);

  if (isSuperAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="m-0 text-xl md:text-2xl font-semibold tracking-[-.02em] text-[#1a1a1a]">Propiedades</h1>
            <p className="m-0 mt-1 text-[13px] text-[#8a8580]">
              {loadingProperties ? 'Cargando…' : `${properties.length} ${properties.length === 1 ? 'conjunto' : 'conjuntos'} · elige uno para entrar`}
            </p>
          </div>
          {isSuperAdmin && (
            <button type="button" className={vtBtn.primary} onClick={() => setCreating(true)}>
              + Nueva propiedad
            </button>
          )}
        </div>
        {loadingProperties ? (
          <div className="flex justify-center py-10"><Spinner size="lg" text="Cargando propiedades..." /></div>
        ) : propertiesError ? (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">{propertiesError}</p>
        ) : properties.length === 0 ? (
          <p className="text-gray-600 bg-white border border-gray-200 rounded-lg p-6 text-center">No tienes propiedades asignadas.</p>
        ) : (
          <PropertyCards properties={properties} activeId={activeId} />
        )}
        {isSuperAdmin && <CreatePropertyModal isOpen={creating} onClose={() => setCreating(false)} onSuccess={reload} />}

      </div>
    </div>
  );
}
