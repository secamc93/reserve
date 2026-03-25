/**
 * Selector de Tipo de Negocio
 * Despues del login, el usuario elige con que tipo de negocio trabajar
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TokenStorage } from '@shared/config';
import { BUSINESS_TYPE_CONFIG } from '@/shared/config/business-type-config';
import { Spinner } from '@shared/ui';

interface BusinessTypeOption {
  code: string;
  name: string;
  icon: string;
  description: string;
  businessCount: number;
  homeRoute: string;
}

export default function SelectTypePage() {
  const router = useRouter();
  const [types, setTypes] = useState<BusinessTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = TokenStorage.getSessionToken();
    const userData = TokenStorage.getUser();

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const isSuperAdmin = userData.is_super_admin || false;
    const businesses = TokenStorage.getBusinessesData() || [];

    // Agrupar negocios por tipo
    const typeMap = new Map<string, { name: string; icon: string; count: number }>();

    for (const b of businesses) {
      const code = b.business_type_code;
      if (!code) continue;
      if (!typeMap.has(code)) {
        typeMap.set(code, {
          name: b.business_type_name || code,
          icon: b.business_type_icon || '',
          count: 0,
        });
      }
      typeMap.get(code)!.count++;
    }

    // Para super admin: agregar todos los tipos de la config aunque no tenga negocios
    if (isSuperAdmin) {
      for (const [code, config] of Object.entries(BUSINESS_TYPE_CONFIG)) {
        if (!typeMap.has(code)) {
          typeMap.set(code, {
            name: config.label,
            icon: config.icon,
            count: 0,
          });
        }
      }
    }

    const options: BusinessTypeOption[] = [];
    for (const [code, info] of typeMap) {
      const config = BUSINESS_TYPE_CONFIG[code];
      options.push({
        code,
        name: config?.label || info.name,
        icon: config?.icon || info.icon || '📦',
        description: config?.description || '',
        businessCount: info.count,
        homeRoute: config?.homeRoute || '/home',
      });
    }

    setTypes(options);
    setLoading(false);
  }, [router]);

  const handleSelectType = (type: BusinessTypeOption) => {
    TokenStorage.setActiveBusinessType(type.code);
    TokenStorage.setActiveBusinessTypeName(type.name);
    router.push(type.homeRoute);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="xl" text="Cargando..." />
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin tipos de negocio</h2>
          <p className="text-gray-600">No tienes acceso a ningun tipo de negocio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Selecciona un Modulo</h1>
          <p className="text-gray-400 text-lg">Elige el tipo de negocio con el que deseas trabajar</p>
        </div>

        <div className={`grid gap-6 ${types.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : types.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {types.map((type) => (
            <button
              key={type.code}
              onClick={() => handleSelectType(type)}
              className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-left transition-all duration-300 hover:bg-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02]"
            >
              <div className="text-5xl mb-4">{type.icon}</div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {type.name}
              </h2>
              {type.description && (
                <p className="text-gray-400 text-sm mb-4">{type.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-300">
                  {type.businessCount} {type.businessCount === 1 ? 'negocio' : 'negocios'}
                </span>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
