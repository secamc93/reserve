/**
 * Componente de formulario para crear/editar usuarios
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { FileInput } from '@shared/ui/file-input';
import { FormModal } from '@shared/ui/form-modal';
import { useUserCrud } from '../hooks/use-user-crud';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // Usuario para editar, undefined para crear
  mode: 'create' | 'edit';
}

export function UserForm({ isOpen, onClose, onSuccess, user, mode }: UserFormProps) {
  const { createUser, updateUser, loading, error, clearError } = useUserCrud({
    onSuccess: () => {
      onSuccess();
      onClose();
    }
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    business_ids: '',
    avatarFile: null as File | null
  });

  // Estado de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del usuario si está en modo edición
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.roles?.[0]?.name || '',
        business_ids: user.businesses?.map((b: any) => b.id).join(',') || '',
        avatarFile: null
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        business_ids: '',
        avatarFile: null
      });
    }
    setErrors({});
    clearError();
  }, [mode, user, clearError]);

  // Validar formulario
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

    if (!formData.role.trim()) {
      newErrors.role = 'El rol es requerido';
    }

    if (!formData.business_ids.trim()) {
      newErrors.business_ids = 'Los negocios son requeridos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      ...formData,
      token: 'your-token-here' // Esto debería venir de un contexto de auth
    };

    let success = false;
    
    if (mode === 'create') {
      success = await createUser(userData);
    } else if (mode === 'edit' && user) {
      success = await updateUser({
        ...userData,
        id: user.id
      });
    }

    if (success) {
      onSuccess();
    }
  };

  // Opciones de roles (esto debería venir de una API)
  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'manager', label: 'Gerente' },
    { value: 'viewer', label: 'Visualizador' }
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {formData.avatarFile ? (
              <img 
                src={URL.createObjectURL(formData.avatarFile)} 
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8" />
            )}
          </div>
          <FileInput
            accept="image/*"
            onChange={(file) => handleChange('avatarFile', file)}
            buttonText={formData.avatarFile ? 'Cambiar Avatar' : 'Seleccionar Avatar'}
            icon={<PhotoIcon className="w-4 h-4 mr-2" />}
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="w-4 h-4 inline mr-2" />
            Nombre completo *
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ingresa el nombre completo"
            className={errors.name ? 'input-error' : 'input'}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="usuario@ejemplo.com"
            className={errors.email ? 'input-error' : 'input'}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-2" />
            Teléfono *
          </label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
            className={errors.phone ? 'input-error' : 'input'}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <Select
            value={formData.role}
            onChange={(value) => handleChange('role', value)}
            options={roleOptions}
            placeholder="Selecciona un rol"
            className={errors.role ? 'input-error' : 'input'}
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Negocios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Negocios (IDs separados por comas) *
          </label>
          <Input
            type="text"
            value={formData.business_ids}
            onChange={(e) => handleChange('business_ids', e.target.value)}
            placeholder="1,2,3"
            className={errors.business_ids ? 'input-error' : 'input'}
          />
          {errors.business_ids && (
            <p className="mt-1 text-sm text-red-600">{errors.business_ids}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Ingresa los IDs de los negocios separados por comas
          </p>
        </div>

        {/* Error general */}
        {error && (
          <div className="alert alert-error">
            <XMarkIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 mr-2"></div>
                {mode === 'create' ? 'Creando...' : 'Actualizando...'}
              </>
            ) : (
              mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'
            )}
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
