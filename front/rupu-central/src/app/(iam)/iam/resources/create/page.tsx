'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input, Modal, Select } from '@shared/ui';
import { CubeTransparentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useBusinessTypes } from '@modules/auth/ui/hooks/use-business-types';

export default function CreateResourcePage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_type_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener tipos de negocio para el filtro
  const { businessTypes } = useBusinessTypes();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
      const { createResourceAction } = await import('@modules/auth/infrastructure/actions');
      
      const result = await createResourceAction({
        name: formData.name,
        description: formData.description,
        business_type_id: formData.business_type_id ? parseInt(formData.business_type_id) : undefined,
        token: token || '',
      });
      
      if (result.success) {
        router.back();
      } else {
        console.error('Error creating resource:', result.error);
      }
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const businessTypeOptions = [
    { value: '', label: 'Todos' },
    ...(businessTypes?.map((bt) => ({
      value: bt.id.toString(),
      label: `${bt.icon} ${bt.name}`
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        router.back();
      }}
      title="Crear Recurso"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <Input
          label="Nombre del recurso"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Ej: Usuarios, Órdenes, Productos"
          required
        />

        {/* Tipo de Negocio */}
        <Select
          label="Tipo de Negocio (Opcional)"
          name="business_type_id"
          value={formData.business_type_id}
          onChange={handleInputChange}
          error={errors.business_type_id}
          options={businessTypeOptions}
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
            placeholder="Describe qué representa este recurso en el sistema..."
            required
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

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
            {isSubmitting ? 'Creando...' : 'Crear Recurso'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
