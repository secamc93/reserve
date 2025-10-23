'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input, Select } from '@shared/ui';
import { KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function CreatePermissionPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    resource: '',
    action: '',
    scopeId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
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
      // Aquí iría la lógica para crear el permiso
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a la lista de permisos
      router.push('/iam/permissions');
    } catch (error) {
      console.error('Error creating permission:', error);
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
    { value: '1', label: 'Global' },
    { value: '2', label: 'Empresa' },
    { value: '3', label: 'Departamento' },
    { value: '4', label: 'Proyecto' },
  ];

  return (
    <div className="p-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Volver
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <KeyIcon className="w-8 h-8 mr-2" />
            Crear Permiso
          </h1>
          <p className="mt-2 text-gray-600">
            Define un nuevo permiso para controlar el acceso a recursos específicos.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-6">Información del Permiso</h2>
                
                <div className="space-y-6">
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

                  {/* Código */}
                  <Input
                    label="Código del permiso"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={errors.code}
                    placeholder="Ej: users.create"
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
                      className="input min-h-[100px] resize-none"
                      placeholder="Describe qué permite este permiso..."
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Recurso */}
                  <Input
                    label="Recurso"
                    name="resource"
                    value={formData.resource}
                    onChange={handleInputChange}
                    error={errors.resource}
                    placeholder="Ej: users, orders, products"
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
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
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
        </div>
      </div>
    </div>
  );
}
