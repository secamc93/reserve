'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, FileInput } from '@shared/ui';
import { createUserAction } from '@modules/auth/infrastructure/actions/users/create-user.action';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { TokenStorage } from '@shared/config';
import { getRolesAction } from '@modules/auth/infrastructure/actions/roles/get-roles.action';
import { getBusinessesAction } from '@modules/property-horizontal/infrastructure/actions/businesses/get-businesses.action';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface CreateUserData {
  name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  avatarFile?: File | null;
  business_role_assignments_text: string; // textarea JSON
}

export function CreateUserForm({ onSubmit, onCancel, loading = false }: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    phone: '',
    is_active: true,
    avatarFile: null,
    business_role_assignments_text: '[\n  { "business_id": 0, "role_id": 1 }\n]'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [businessOptions, setBusinessOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [assignments, setAssignments] = useState<Array<{ business_id: number; role_id: number; business_name?: string; role_name?: string }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) return;

        // Cargar roles (plataforma y negocio)
        const rolesRes = await getRolesAction(token);
        if (rolesRes.success && rolesRes.data) {
          setRoleOptions([
            { value: '', label: 'Seleccionar rol' },
            ...rolesRes.data.roles.map((r) => ({ value: String(r.id), label: r.name })),
          ]);
        }

        // Cargar businesses sin filtro (paginado por defecto)
        const bizRes = await getBusinessesAction({ token, page: 1, page_size: 100, name: '' } as any);
        if (bizRes.success && bizRes.data) {
          setBusinessOptions([
            { value: '0', label: 'Plataforma (ID 0)' },
            ...bizRes.data.businesses.map((b) => ({ value: String(b.id), label: b.name })),
          ]);
        } else {
          // Al menos opción plataforma
          setBusinessOptions([{ value: '0', label: 'Plataforma (ID 0)' }]);
        }
      } catch (e) {
        // Silenciar errores de carga en UI
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData(prev => ({ ...prev, [name]: file }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
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

    // business_role_assignments es requerido
    if (assignments.length === 0) {
      newErrors.business_role_assignments_text = 'Agrega al menos una asignación negocio-rol';
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
      const payload = {
        ...formData,
        business_role_assignments_text: JSON.stringify(assignments.map(a => ({ business_id: a.business_id, role_id: a.role_id }))),
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Nota: más adelante reemplazaremos el textarea por selects de negocios/roles

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
        />

        {/* Activo */}
        <div className="flex items-center gap-2">
          <input type="checkbox" name="is_active" checked={!!formData.is_active} onChange={handleInputChange} />
          <label className="text-sm text-gray-700">Activo</label>
        </div>

        {/* Avatar */}
        <FileInput
          label="Avatar (opcional)"
          name="avatarFile"
          accept="image/*"
          onChange={(file) => setFormData(prev => ({ ...prev, avatarFile: file }))}
          error={errors.avatarFile}
          buttonText="Seleccionar imagen"
          helperText="Formatos soportados: JPG, PNG, GIF (máx. 5MB)"
        />

        {/* Asignaciones negocio-rol */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select
              label="Negocio"
              name="business"
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              options={businessOptions}
            />
            <Select
              label="Rol"
              name="role"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              options={roleOptions}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (!selectedBusinessId || !selectedRoleId) return;
              const exists = assignments.some(a => a.business_id === Number(selectedBusinessId) && a.role_id === Number(selectedRoleId));
              if (exists) return;
              const bizName = businessOptions.find(b => b.value === selectedBusinessId)?.label;
              const roleName = roleOptions.find(r => r.value === selectedRoleId)?.label;
              setAssignments(prev => [...prev, { business_id: Number(selectedBusinessId), role_id: Number(selectedRoleId), business_name: bizName, role_name: roleName }]);
            }}
          >
            Agregar asignación
          </Button>

          {/* Lista de asignaciones */}
          {assignments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {assignments.map(a => (
                <div key={`${a.business_id}-${a.role_id}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                  <span className="font-medium">{a.business_name || `Negocio ${a.business_id}`}</span>
                  <span className="text-green-600">:</span>
                  <span>{a.role_name || `Rol ${a.role_id}`}</span>
                  <button
                    type="button"
                    className="ml-1 text-green-700 hover:text-green-900"
                    onClick={() => setAssignments(prev => prev.filter(x => !(x.business_id === a.business_id && x.role_id === a.role_id)))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.business_role_assignments_text && (
            <p className="text-sm text-red-500">{errors.business_role_assignments_text}</p>
          )}
        </div>
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
              <li>• Las asignaciones deben ser JSON válido. Ej: [&#123;"business_id":0,"role_id":1&#125;].</li>
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
