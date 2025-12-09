/**
 * Componente de filtros para usuarios
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { Badge } from '@shared/ui/badge';

interface UsersFiltersProps {
  filters: {
    name?: string;
    email?: string;
    phone?: string;
    is_active?: boolean;
    role_id?: number;
    business_id?: number;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function UsersFilters({ filters, onFiltersChange, onClearFilters }: UsersFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sincronizar filtros locales con los props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Manejar cambios en filtros
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  // Contar filtros activos
  const activeFiltersCount = Object.values(localFilters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  // Opciones de estado
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' }
  ];

  // Opciones de roles (esto debería venir de una API)
  const roleOptions = [
    { value: '', label: 'Todos los roles' },
    { value: '1', label: 'Administrador' },
    { value: '2', label: 'Usuario' },
    { value: '3', label: 'Gerente' },
    { value: '4', label: 'Visualizador' }
  ];

  // Opciones de negocios (esto debería venir de una API)
  const businessOptions = [
    { value: '', label: 'Todos los negocios' },
    { value: '1', label: 'Negocio 1' },
    { value: '2', label: 'Negocio 2' },
    { value: '3', label: 'Negocio 3' }
  ];

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Filtros básicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 inline mr-2" />
              Buscar por nombre
            </label>
            <Input
              type="text"
              value={localFilters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Nombre del usuario"
              className="input"
            />
          </div>

          {/* Búsqueda por email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <EnvelopeIcon className="w-4 h-4 inline mr-2" />
              Buscar por email
            </label>
            <Input
              type="email"
              value={localFilters.email || ''}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="input"
            />
          </div>

          {/* Búsqueda por teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="w-4 h-4 inline mr-2" />
              Buscar por teléfono
            </label>
            <Input
              type="tel"
              value={localFilters.phone || ''}
              onChange={(e) => handleFilterChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
              className="input"
            />
          </div>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <Select
                value={localFilters.is_active?.toString() || ''}
                onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                options={statusOptions}
                className="input"
              />
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol
              </label>
              <Select
                value={localFilters.role_id?.toString() || ''}
                onChange={(e) => handleFilterChange('role_id', e.target.value === '' ? undefined : parseInt(e.target.value))}
                options={roleOptions}
                className="input"
              />
            </div>

            {/* Negocio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Negocio
              </label>
              <Select
                value={localFilters.business_id?.toString() || ''}
                onChange={(e) => handleFilterChange('business_id', e.target.value === '' ? undefined : parseInt(e.target.value))}
                options={businessOptions}
                className="input"
              />
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {/* Botón de filtros avanzados */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-outline btn-sm"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avanzados
            </Button>

            {/* Contador de filtros activos */}
            {activeFiltersCount > 0 && (
              <Badge type="secondary" className="text-xs">
                {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} activo{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Botón de limpiar filtros */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Filtros activos como badges */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {localFilters.name && (
              <Badge type="secondary" className="text-xs">
                Nombre: {localFilters.name}
                <button
                  onClick={() => handleFilterChange('name', '')}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.email && (
              <Badge type="secondary" className="text-xs">
                Email: {localFilters.email}
                <button
                  onClick={() => handleFilterChange('email', '')}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.phone && (
              <Badge type="secondary" className="text-xs">
                Teléfono: {localFilters.phone}
                <button
                  onClick={() => handleFilterChange('phone', '')}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.is_active !== undefined && (
              <Badge type="secondary" className="text-xs">
                Estado: {localFilters.is_active ? 'Activo' : 'Inactivo'}
                <button
                  onClick={() => handleFilterChange('is_active', undefined)}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.role_id && (
              <Badge type="secondary" className="text-xs">
                Rol: {roleOptions.find(r => r.value === localFilters.role_id?.toString())?.label}
                <button
                  onClick={() => handleFilterChange('role_id', undefined)}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {localFilters.business_id && (
              <Badge type="secondary" className="text-xs">
                Negocio: {businessOptions.find(b => b.value === localFilters.business_id?.toString())?.label}
                <button
                  onClick={() => handleFilterChange('business_id', undefined)}
                  className="ml-2 hover:text-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

