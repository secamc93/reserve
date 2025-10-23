'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSimple as useAuth } from '@modules/auth/ui';
import { Button, Input, Select } from '@shared/ui';
import { UserGroupIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function CreateUserPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
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

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
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
      // Aquí iría la lógica para crear el usuario
      // Por ahora solo simulamos el proceso
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirigir a la lista de usuarios
      router.push('/iam/users');
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: '', label: 'Seleccionar rol' },
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'manager', label: 'Gerente' },
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
            <UserGroupIcon className="w-8 h-8 mr-2" />
            Crear Usuario
          </h1>
          <p className="mt-2 text-gray-600">
            Completa la información para crear un nuevo usuario en el sistema.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-xl font-semibold mb-6">Información del Usuario</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <Input
                      label="Nombre completo"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      placeholder="Ingresa el nombre completo"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      placeholder="usuario@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <Input
                      label="Teléfono"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      error={errors.phone}
                      placeholder="+1 234 567 8900"
                      required
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <Select
                      label="Rol"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      error={errors.role}
                      options={roleOptions}
                      required
                    />
                  </div>

                  {/* Contraseña */}
                  <div>
                    <Input
                      label="Contraseña"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <Input
                      label="Confirmar contraseña"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      placeholder="Repite la contraseña"
                      required
                    />
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
                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
