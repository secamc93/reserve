/**
 * Componente: Formulario para Crear Rol
 */

'use client';

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useBusinessTypes } from '../hooks/use-business-types';

export interface CreateRoleFormData {
  name: string;
  description: string;
  level: number;
  is_system: boolean;
  scope_id: number;
  business_type_id: number;
}

export interface CreateRoleFormProps {
  onSubmit: (data: CreateRoleFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CreateRoleForm({ onSubmit, onCancel, loading = false }: CreateRoleFormProps) {
  const { businessTypes, loading: businessTypesLoading, error: businessTypesError } = useBusinessTypes();
  
  const [formData, setFormData] = useState<CreateRoleFormData>({
    name: '',
    description: '',
    level: 1,
    is_system: false,
    scope_id: 1,
    business_type_id: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'level') {
      processedValue = parseInt(value) || 1;
    } else if (name === 'scope_id' || name === 'business_type_id') {
      processedValue = parseInt(value) || 1;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del rol es requerida';
    }

    if (formData.level < 1 || formData.level > 10) {
      newErrors.level = 'El nivel debe estar entre 1 y 10';
    }

    if (!formData.scope_id) {
      newErrors.scope_id = 'El scope es requerido';
    }

    if (!formData.business_type_id) {
      newErrors.business_type_id = 'El tipo de negocio es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const levelOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Nivel ${i + 1}`,
  }));

  const scopeOptions = [
    { value: '1', label: 'Plataforma' },
    { value: '2', label: 'Negocio' },
  ];

  const businessTypeOptions = businessTypes.map(bt => ({
    value: bt.id.toString(),
    label: `${bt.icon} ${bt.name}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Rol</h3>
          <p className="text-sm text-gray-600">Define los permisos y características del rol</p>
        </div>
      </div>

      {/* Información básica */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Información Básica</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Rol"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Ej: Administrador"
            required
          />

          <Select
            label="Nivel Jerárquico"
            name="level"
            value={formData.level.toString()}
            onChange={handleInputChange}
            error={errors.level}
            options={levelOptions}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe las responsabilidades y permisos de este rol"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Configuración avanzada */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Configuración Avanzada</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Scope/Ámbito"
            name="scope_id"
            value={formData.scope_id.toString()}
            onChange={handleInputChange}
            error={errors.scope_id}
            options={scopeOptions}
            required
          />

          <Select
            label="Tipo de Negocio"
            name="business_type_id"
            value={formData.business_type_id.toString()}
            onChange={handleInputChange}
            error={errors.business_type_id}
            options={businessTypeOptions}
            required
            disabled={businessTypesLoading}
            placeholder={businessTypesLoading ? "Cargando tipos de negocio..." : "Seleccionar tipo"}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_system"
            name="is_system"
            checked={formData.is_system}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_system" className="text-sm text-gray-700">
            Rol del sistema (no se puede eliminar)
          </label>
        </div>
      </div>

      {/* Error de business types */}
      {businessTypesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700">
              Error cargando tipos de negocio: {businessTypesError}
            </span>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Información importante
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El nivel jerárquico determina la prioridad del rol (1 = más alto)</li>
              <li>• Los roles del sistema no se pueden eliminar</li>
              <li>• El scope determina si es un rol de plataforma o de negocio</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <XMarkIcon className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          <ShieldCheckIcon className="w-4 h-4 mr-2" />
          {loading ? 'Creando...' : 'Crear Rol'}
        </Button>
      </div>
    </form>
  );
}
