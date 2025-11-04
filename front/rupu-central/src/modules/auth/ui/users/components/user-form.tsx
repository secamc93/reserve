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
  XMarkIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Select } from '@shared/ui/select';
import { FileInput } from '@shared/ui/file-input';
import { FormModal } from '@shared/ui/form-modal';
import { Modal } from '@shared/ui/modal';
import { useUserCrud } from '../hooks/use-user-crud';
import { TokenStorage } from '../../../infrastructure/storage/token.storage';
// Roles y asignaciones removidas del flujo actual

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // Usuario para editar, undefined para crear
  mode: 'create' | 'edit';
}

export function UserForm({ isOpen, onClose, onSuccess, user, mode }: UserFormProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState<{ email?: string; password?: string; message?: string } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const { createUser, updateUser, loading, error, clearError } = useUserCrud({
    onSuccess: (message, data) => {
      if (mode === 'create' && data?.password) {
        // Mostrar modal con contraseña solo al crear
        setCreatedUserData(data);
        setShowPasswordModal(true);
      } else {
        // Para edición, cerrar normalmente
        onSuccess();
        onClose();
      }
    }
  });

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true as boolean,
    avatarFile: null as File | null
  });
  // Negocios (multi-selección -> CSV)
  const [businessOptions, setBusinessOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [selectedBusinesses, setSelectedBusinesses] = useState<Array<{ id: number; name: string }>>([]);

  // Estado de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del usuario si está en modo edición
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        is_active: user.is_active ?? true,
        avatarFile: null
      });
      
      // Función helper para obtener el nombre del negocio
      const getBusinessName = (businessId: number): string => {
        // Primero buscar en businessOptions (si ya está cargado)
        const option = businessOptions.find(b => b.value === String(businessId));
        if (option?.label) {
          return option.label;
        }
        // Si no está en businessOptions, buscar en business_role_assignments
        if (Array.isArray(user.business_role_assignments)) {
          const bra = user.business_role_assignments.find((br: any) => br.business_id === businessId);
          if (bra?.business_name) {
            return bra.business_name;
          }
        }
        // Si no está en ningún lado, buscar en businesses
        if (Array.isArray(user.businesses)) {
          const bus = user.businesses.find((b: any) => b.id === businessId);
          if (bus?.name) {
            return bus.name;
          }
        }
        // Fallback
        return `Negocio ${businessId}`;
      };
      
      // Intentar cargar desde business_role_assignments primero (más confiable)
      if (Array.isArray(user.business_role_assignments) && user.business_role_assignments.length > 0) {
        const pre = user.business_role_assignments
          .map((bra: any) => {
            const businessId = Number(bra?.business_id);
            if (!Number.isFinite(businessId) || businessId <= 0) return null;
            const name = getBusinessName(businessId);
            return {
              id: businessId,
              name: String(name || `Negocio ${businessId}`)
            };
          })
          .filter((b: any) => b !== null && Number.isFinite(b?.id) && b.id > 0) as Array<{ id: number; name: string }>;
        setSelectedBusinesses(pre);
      } else if (Array.isArray(user.businesses) && user.businesses.length > 0) {
        const pre = user.businesses
          .map((b: any) => {
            const businessId = Number(b?.id);
            if (!Number.isFinite(businessId) || businessId <= 0) return null;
            const name = getBusinessName(businessId);
            return {
              id: businessId,
              name: String(name || `Negocio ${businessId}`)
            };
          })
          .filter((b: any) => b !== null && Number.isFinite(b?.id) && b.id > 0) as Array<{ id: number; name: string }>;
        setSelectedBusinesses(pre);
      } else {
        setSelectedBusinesses([]);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        is_active: true,
        avatarFile: null
      });
      setSelectedBusinesses([]);
    }
    setErrors({});
    clearError();
  }, [mode, user, clearError, businessOptions]);

  // Cargar lista de negocios para selección
  useEffect(() => {
    (async () => {
      try {
        const token = TokenStorage.getToken();
        if (!token) return;
        const { getBusinessesAction } = await import('../../../../property-horizontal/infrastructure/actions/businesses/get-businesses.action');
        const res = await getBusinessesAction({ token, page: 1, page_size: 200, name: '' } as any);
        if (res.success && res.data) {
          setBusinessOptions(res.data.businesses.map((b: any) => ({ value: String(b.id), label: b.name })));
        }
      } catch {}
    })();
  }, []);

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

    if (formData.phone && formData.phone.trim().length > 0) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        newErrors.phone = 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    // Sin validación de asignaciones

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

    const token = TokenStorage.getToken() || '';
    const business_ids = selectedBusinesses.map(b => b.id).join(',');
    const userData: any = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      is_active: formData.is_active,
      avatarFile: formData.avatarFile,
      business_ids: business_ids || undefined,
      token,
    };

    let result;
    
    if (mode === 'create') {
      result = await createUser(userData);
      // El modal se mostrará desde el callback onSuccess
    } else if (mode === 'edit' && user) {
      const success = await updateUser({
        ...userData,
        id: user.id
      });
      if (success) {
        onSuccess();
        onClose();
      }
    }
  };

  // (Asignaciones removidas)

  const handleCopyPassword = () => {
    if (createdUserData?.password) {
      navigator.clipboard.writeText(createdUserData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  const handleCopyEmail = () => {
    if (createdUserData?.email) {
      navigator.clipboard.writeText(createdUserData.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setCreatedUserData(null);
    setEmailCopied(false);
    setPasswordCopied(false);
    onSuccess();
    onClose();
  };

  return (
    <>
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

        {/* Negocios (se envían como CSV en business_ids) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Negocios</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
            <Select
              value={selectedBusinessId}
              onChange={(e) => {
                const value = e.target.value;
                console.log('🔍 Select onChange - value:', value);
                setSelectedBusinessId(value);
              }}
              options={[{ value: '', label: 'Selecciona un negocio' }, ...businessOptions]}
              placeholder="Selecciona un negocio"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('🔍 Agregar negocio - selectedBusinessId:', selectedBusinessId);
                console.log('🔍 businessOptions:', businessOptions);
                
                if (!selectedBusinessId || selectedBusinessId === '') {
                  console.log('❌ No hay negocio seleccionado');
                  return;
                }
                
                const businessIdNum = Number(selectedBusinessId);
                console.log('🔍 businessIdNum:', businessIdNum);
                
                if (!Number.isFinite(businessIdNum) || businessIdNum <= 0) {
                  console.log('❌ ID inválido:', businessIdNum);
                  return;
                }
                
                const exists = selectedBusinesses.some(b => b.id === businessIdNum);
                if (exists) {
                  console.log('❌ El negocio ya está agregado');
                  return;
                }
                
                const businessOption = businessOptions.find(b => b.value === selectedBusinessId);
                console.log('🔍 businessOption encontrado:', businessOption);
                
                const name = businessOption?.label ? String(businessOption.label) : `Negocio ${businessIdNum}`;
                console.log('✅ Agregando negocio:', { id: businessIdNum, name });
                
                setSelectedBusinesses(prev => {
                  const newList = [...prev, { 
                    id: businessIdNum, 
                    name: String(name) 
                  }];
                  console.log('✅ Nueva lista de negocios:', newList);
                  return newList;
                });
                setSelectedBusinessId('');
              }}
            >
              Agregar
            </Button>
          </div>
          {selectedBusinesses.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedBusinesses
                .filter((b) => b && Number.isFinite(b.id) && b.id > 0)
                .map((b, idx) => {
                  // Obtener el ID válido
                  const businessId = Number(b.id);
                  if (!Number.isFinite(businessId) || businessId <= 0) {
                    return null;
                  }
                  
                  // Obtener el nombre: buscar primero en businessOptions (más confiable)
                  let businessName = '';
                  const option = businessOptions.find(opt => opt.value === String(businessId));
                  if (option?.label) {
                    businessName = option.label;
                  } else if (b?.name && typeof b.name === 'string' && b.name.trim() !== '' && b.name !== '[object Object]') {
                    businessName = b.name.trim();
                  } else {
                    businessName = `Negocio ${businessId}`;
                  }
                  
                  return (
                    <div key={`${businessId}-${idx}`} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      <span className="font-medium">{businessName} (ID: {businessId})</span>
                      <button 
                        type="button" 
                        className="ml-1 text-blue-700 hover:text-blue-900" 
                        onClick={() => setSelectedBusinesses(prev => prev.filter(x => Number.isFinite(x.id) && x.id !== businessId))}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          )}
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

    {/* Modal para mostrar contraseña generada */}
    <Modal
      isOpen={showPasswordModal}
      onClose={handleClosePasswordModal}
      title="Usuario creado exitosamente"
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-4">
            {createdUserData?.message || 'Usuario creado exitosamente. Guarda esta información de forma segura.'}
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono">
                  {createdUserData?.email || 'N/A'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Copiar email"
                >
                  {emailCopied ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contraseña generada <span className="text-red-600">(solo se muestra una vez)</span>:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-3 py-2 bg-yellow-50 border-2 border-yellow-400 rounded text-sm font-mono font-bold text-gray-900">
                  {createdUserData?.password || 'N/A'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Copiar contraseña"
                >
                  {passwordCopied ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <DocumentDuplicateIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Importante:</strong> Esta contraseña solo se muestra una vez. Asegúrate de copiarla y guardarla de forma segura antes de cerrar este mensaje.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="primary"
            onClick={handleClosePasswordModal}
            className="btn-primary"
          >
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
