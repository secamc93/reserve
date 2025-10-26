/**
 * Componente: Formulario para Business Type
 */

'use client';

import { useState } from 'react';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface BusinessTypeFormData {
  name: string;
  code: string;
  description: string;
  icon: string;
  is_active: boolean;
}

export interface BusinessTypeFormProps {
  onSubmit: (data: BusinessTypeFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: Partial<BusinessTypeFormData>;
  mode?: 'create' | 'edit';
}

export function BusinessTypeForm({ 
  onSubmit, 
  onCancel, 
  loading = false, 
  initialData = {},
  mode = 'create'
}: BusinessTypeFormProps) {
  const [formData, setFormData] = useState<BusinessTypeFormData>({
    name: initialData.name || '',
    code: initialData.code || '',
    description: initialData.description || '',
    icon: initialData.icon || 'building',
    is_active: initialData.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
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
      newErrors.name = 'El nombre del tipo de negocio es requerido';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'El código del tipo de negocio es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción del tipo de negocio es requerida';
    }

    if (!formData.icon.trim()) {
      newErrors.icon = 'El icono del tipo de negocio es requerido';
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
      console.error('Error submitting business type:', error);
    }
  };

  const iconOptions = [
    { value: 'building', label: '🏢 Edificio' },
    { value: 'utensils', label: '🍽️ Restaurante' },
    { value: 'coffee', label: '☕ Café' },
    { value: 'wine', label: '🍺 Bar' },
    { value: 'bed', label: '🏨 Hotel' },
    { value: 'spa', label: '💆 Spa' },
    { value: 'scissors', label: '💇 Salón' },
    { value: 'heart', label: '🏥 Clínica' },
    { value: 'dumbbell', label: '💪 Gimnasio' },
    { value: 'camera', label: '📸 Estudio' },
    { value: 'briefcase', label: '💼 Oficina' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Crear Nuevo Tipo de Negocio' : 'Editar Tipo de Negocio'}
          </h3>
          <p className="text-sm text-gray-600">
            {mode === 'create' ? 'Define las características del nuevo tipo de negocio' : 'Modifica la información del tipo de negocio'}
          </p>
        </div>
      </div>

      {/* Información básica */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Información Básica</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre del Tipo de Negocio"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Ej: Restaurante"
            required
          />

          <Input
            label="Código"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            error={errors.code}
            placeholder="Ej: restaurant"
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
            placeholder="Describe las características de este tipo de negocio"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <Select
          label="Icono"
          name="icon"
          value={formData.icon}
          onChange={handleInputChange}
          error={errors.icon}
          options={iconOptions}
          required
        />
      </div>

      {/* Configuración avanzada */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Configuración</h4>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="text-sm text-gray-700">
            Tipo de negocio activo
          </label>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Información importante
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• El código debe ser único y en minúsculas</li>
              <li>• El icono se mostrará en la interfaz de usuario</li>
              <li>• Los tipos inactivos no aparecerán en las listas de selección</li>
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
          <BuildingOfficeIcon className="w-4 h-4 mr-2" />
          {loading ? (mode === 'create' ? 'Creando...' : 'Actualizando...') : (mode === 'create' ? 'Crear Tipo' : 'Actualizar Tipo')}
        </Button>
      </div>
    </form>
  );
}
