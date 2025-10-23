'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input } from '@shared/ui';
import { CubeTransparentIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function CreateResourcePage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Aquí iría la lógica para crear el recurso
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a la lista de recursos
      router.push('/iam/resources');
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <CubeTransparentIcon className="w-8 h-8 mr-2" />
            Crear Recurso
          </h1>
          <p className="mt-2 text-gray-600">
            Define un nuevo recurso del sistema al que se pueden aplicar permisos.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-6">Información del Recurso</h2>
                
                <div className="space-y-6">
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

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="input min-h-[120px] resize-none"
                      placeholder="Describe qué representa este recurso en el sistema..."
                      required
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Información adicional */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      Información sobre recursos
                    </h3>
                    <p className="text-sm text-blue-700">
                      Los recursos representan entidades o funcionalidades del sistema a las que se pueden aplicar permisos. 
                      Por ejemplo: "usuarios", "órdenes", "productos", "reportes", etc.
                    </p>
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
                {isSubmitting ? 'Creando...' : 'Crear Recurso'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
