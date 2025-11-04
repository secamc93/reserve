'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input, Select } from '@shared/ui';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function CreateRolePage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: '',
    isSystem: false,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
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

    if (!formData.level) {
      newErrors.level = 'El nivel es requerido';
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
      // Aquí iría la lógica para crear el rol
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a la lista de roles
      router.push('/iam/roles');
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const levelOptions = [
    { value: '', label: 'Seleccionar nivel' },
    { value: '1', label: 'Nivel 1 - Básico' },
    { value: '2', label: 'Nivel 2 - Intermedio' },
    { value: '3', label: 'Nivel 3 - Avanzado' },
    { value: '4', label: 'Nivel 4 - Administrador' },
    { value: '5', label: 'Nivel 5 - Super Administrador' },
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
            <ShieldCheckIcon className="w-8 h-8 mr-2" />
            Crear Rol
          </h1>
          <p className="mt-2 text-gray-600">
            Define un nuevo rol con sus permisos y configuraciones.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-6">Información del Rol</h2>
                
                <div className="space-y-6">
                  {/* Nombre */}
                  <Input
                    label="Nombre del rol"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    placeholder="Ej: Administrador de Ventas"
                    required
                  />

                  {/* Código */}
                  <Input
                    label="Código del rol"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={errors.code}
                    placeholder="Ej: ADMIN_SALES"
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
                      placeholder="Describe las responsabilidades y permisos de este rol..."
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Nivel */}
                  <Select
                    label="Nivel del rol"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    error={errors.level}
                    options={levelOptions}
                    required
                  />

                  {/* Es sistema */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isSystem"
                      checked={formData.isSystem}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Rol del sistema (no se puede eliminar)
                    </label>
                  </div>
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
                {isSubmitting ? 'Creando...' : 'Crear Rol'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
