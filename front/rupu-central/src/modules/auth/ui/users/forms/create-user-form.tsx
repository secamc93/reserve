'use client';

import { useState } from 'react';
import { Button, Input, Select, FileInput } from '@shared/ui';
import { createUserAction } from '@modules/auth/infrastructure/actions/users/create-user.action';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatarFile?: File | null;
  business_ids: string;
}

export function CreateUserForm({ onSubmit, onCancel, loading = false }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    avatarFile: null,
    business_ids: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    if (!formData.business_ids.trim()) {
      newErrors.business_ids = 'Los IDs de negocio son requeridos';
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
      console.error('Error creating user:', error);
    }
  };

  const roleOptions = [
    { value: '', label: 'Seleccionar rol' },
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'manager', label: 'Gerente' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre completo"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Ingresa el nombre completo"
          required
        />

        {/* Email */}
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

        {/* Teléfono */}
        <Input
          label="Teléfono"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={errors.phone}
          placeholder="+1 234 567 8900"
          required
        />

        {/* Avatar */}
        <FileInput
          label="Avatar (opcional)"
          name="avatarFile"
          accept="image/*"
          onChange={handleInputChange}
          error={errors.avatarFile}
          buttonText="Seleccionar imagen"
          helperText="Formatos soportados: JPG, PNG, GIF (máx. 5MB)"
        />

        {/* Business IDs */}
        <Input
          label="IDs de Negocio"
          name="business_ids"
          value={formData.business_ids}
          onChange={handleInputChange}
          error={errors.business_ids}
          placeholder="1,2,3 (separados por comas)"
          required
        />

        {/* Rol */}
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

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UserGroupIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Información importante
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• La contraseña se generará automáticamente y se enviará al email del usuario.</li>
              <li>• El avatar es opcional. Si no se selecciona, se usará un avatar por defecto.</li>
              <li>• Los IDs de negocio deben ser números separados por comas (ej: 1,2,3).</li>
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
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Usuario'}
        </Button>
      </div>
    </form>
  );
}
