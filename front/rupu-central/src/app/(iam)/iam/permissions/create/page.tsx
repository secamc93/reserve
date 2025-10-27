'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input, Select, Modal } from '@shared/ui';
import { KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useBusinessTypes } from '@modules/auth/ui/hooks/use-business-types';
import { useResources } from '@modules/auth/ui/hooks/use-resources';

export default function CreatePermissionPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    scopeId: '',
    businessTypeId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch business types and resources
  const { businessTypes } = useBusinessTypes();
  const { resources, loading: resourcesLoading } = useResources(
    formData.businessTypeId ? parseInt(formData.businessTypeId) : undefined
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Si cambia el tipo de negocio, limpiar el recurso seleccionado
      if (name === 'businessTypeId') {
        newData.resource = '';
      }
      return newData;
    });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.resource.trim()) {
      newErrors.resource = 'El recurso es requerido';
    }

    if (!formData.action.trim()) {
      newErrors.action = 'La acción es requerida';
    }

    if (!formData.scopeId) {
      newErrors.scopeId = 'El scope es requerido';
    }

    if (!formData.businessTypeId) {
      newErrors.businessTypeId = 'El tipo de negocio es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { createPermissionAction } = await import('@modules/auth/infrastructure/actions');
      
      const result = await createPermissionAction(
        {
          name: formData.name,
          description: formData.description,
          resource_id: parseInt(formData.resource),
          action_id: parseInt(formData.action), // TODO: Pendiente - implementar lista de acciones
          scope_id: parseInt(formData.scopeId),
          business_type_id: formData.businessTypeId ? parseInt(formData.businessTypeId) : undefined,
        },
        token || ''
      );
      
      if (result.success) {
        router.back();
      } else {
        console.error('Error creating permission:', result.error);
        setErrors({ general: result.error || 'Error al crear el permiso' });
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      setErrors({ general: 'Error inesperado al crear el permiso' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionOptions = [
    { value: '', label: 'Seleccionar acción' },
    { value: 'create', label: 'Crear' },
    { value: 'read', label: 'Leer' },
    { value: 'update', label: 'Actualizar' },
    { value: 'delete', label: 'Eliminar' },
    { value: 'manage', label: 'Gestionar' },
  ];

  const scopeOptions = [
    { value: '', label: 'Seleccionar scope' },
    { value: '1', label: 'Plataforma' },
    { value: '2', label: 'Negocio' },
  ];

  const businessTypeOptions = [
    { value: '', label: 'Seleccionar tipo de negocio' },
    ...(businessTypes?.map((bt) => ({
      value: bt.id.toString(),
      label: `${bt.icon} ${bt.name}`,
    })) || []),
  ];

  const resourceOptions = [
    { value: '', label: 'Seleccionar recurso' },
    ...(resources?.map((r) => ({
      value: r.id.toString(),
      label: r.name,
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        router.back();
      }}
      title="Crear Permiso"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Nombre */}
        <Input
          label="Nombre del permiso"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Ej: Crear usuarios"
          required
        />

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white min-h-[100px] resize-none"
            placeholder="Describe qué permite este permiso..."
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Tipo de Negocio */}
        <Select
          label="Tipo de Negocio *"
          name="businessTypeId"
          value={formData.businessTypeId}
          onChange={handleInputChange}
          error={errors.businessTypeId}
          options={businessTypeOptions}
          required
        />

        {/* Recurso */}
        <Select
          label="Recurso *"
          name="resource"
          value={formData.resource}
          onChange={handleInputChange}
          error={errors.resource}
          options={resourceOptions}
          required
        />

        {/* Acción */}
        <Select
          label="Acción"
          name="action"
          value={formData.action}
          onChange={handleInputChange}
          error={errors.action}
          options={actionOptions}
          required
        />

        {/* Scope */}
        <Select
          label="Scope"
          name="scopeId"
          value={formData.scopeId}
          onChange={handleInputChange}
          error={errors.scopeId}
          options={scopeOptions}
          required
        />

        {/* Botones */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              router.back();
            }}
            disabled={isSubmitting}
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Permiso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
