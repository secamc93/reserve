/**
 * Componente: Formulario para Editar Rol
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../hooks/use-business-types';

export interface UpdateRoleFormData {
  id: number;
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
  business_type_id: number;
}

export interface UpdateRoleFormProps {
  role: {
    id: number;
    name: string;
    description: string;
    level: number;
    isSystem: boolean;
    scopeId: number;
    code?: string;
  } | null;
  onSubmit: (data: UpdateRoleFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function UpdateRoleForm({ role, onSubmit, onCancel, loading = false }: UpdateRoleFormProps) {
  const { businessTypes, loading: businessTypesLoading, error: businessTypesError } = useBusinessTypes();
  
  // Inicializar el formulario con los datos del rol
  const getInitialFormData = (): UpdateRoleFormData => {
    if (role) {
      return {
        id: role.id,
        name: role.name,
        description: role.description,
        level: role.level,
        is_system: role.isSystem,
        scope_id: role.scopeId,
        business_type_id: businessTypes?.length ? businessTypes[0].id : 1,
      };
    }
    return {
      id: 0,
      name: '',
      description: '',
      level: 1,
      is_system: false,
      scope_id: 1,
      business_type_id: 1,
    };
  };

  const [formData, setFormData] = useState<UpdateRoleFormData>(getInitialFormData());

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar el formulario cuando cambie el rol
  useEffect(() => {
    if (role) {
      setFormData(getInitialFormData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'level') {
      processedValue = parseInt(value, 10);
    } else if (name === 'scope_id' || name === 'business_type_id') {
      processedValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    if (formData.level < 1 || formData.level > 10) {
      newErrors.level = 'El nivel debe estar entre 1 y 10';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Rol <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ej: Administrador"
            error={errors.name}
            required
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe las responsabilidades y permisos de este rol"
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Nivel */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
            Nivel <span className="text-red-500">*</span>
          </label>
          <Input
            id="level"
            name="level"
            type="number"
            value={isNaN(formData.level) ? '' : formData.level}
            onChange={handleInputChange}
            min="1"
            max="10"
            placeholder="1-10"
            error={errors.level}
            required
          />
          <p className="mt-1 text-xs text-gray-500">El nivel determina la jerarquía del rol (1-10)</p>
        </div>

        {/* Ámbito (Scope) */}
        <div>
          <label htmlFor="scope_id" className="block text-sm font-medium text-gray-700 mb-2">
            Ámbito <span className="text-red-500">*</span>
          </label>
          <select
            id="scope_id"
            name="scope_id"
            value={formData.scope_id.toString()}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
              errors.scope_id ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="1">Plataforma</option>
            <option value="2">Negocio</option>
          </select>
        </div>

        {/* Tipo de Negocio */}
        {formData.scope_id === 2 && (
          <div>
            <label htmlFor="business_type_id" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Negocio <span className="text-red-500">*</span>
            </label>
            {businessTypesLoading ? (
              <div className="text-sm text-gray-500">Cargando tipos de negocio...</div>
            ) : businessTypesError ? (
              <div className="text-sm text-red-500">{businessTypesError}</div>
            ) : (
              <select
                id="business_type_id"
                name="business_type_id"
                value={formData.business_type_id.toString()}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                required
              >
                {businessTypes.map(bt => (
                  <option key={bt.id} value={bt.id}>
                    {bt.icon} {bt.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Es Sistema */}
        <div className="flex items-center gap-3">
          <input
            id="is_system"
            name="is_system"
            type="checkbox"
            checked={formData.is_system}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_system" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
            Rol del Sistema
          </label>
        </div>
        <p className="text-xs text-gray-500 ml-7">
          Los roles del sistema no pueden ser modificados o eliminados
        </p>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <XMarkIcon className="w-4 h-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || businessTypesLoading}
          className="flex items-center gap-2"
        >
          {loading ? 'Actualizando...' : 'Actualizar Rol'}
        </Button>
      </div>
    </form>
  );
}

