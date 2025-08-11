'use client';

import React, { useState, useEffect } from 'react';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import { CreateUserDTO, Role, Business } from '@/features/users/domain/User';
import './CreateUserModal.css';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: CreateUserDTO) => Promise<any>;
  roles: Role[];
  businesses: Business[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roles, 
  businesses 
}) => {
  const [formData, setFormData] = useState<CreateUserDTO>({
    name: '',
    email: '',
    phone: '',
    businessIds: [],
    roleIds: [],
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCredentials, setUserCredentials] = useState<{ email: string; password: string } | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Ensure roles and businesses are arrays
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  // Clear form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessIds: [],
        roleIds: [],
        isActive: true,
      });
      setErrors({});
      setUserCredentials(null);
      setIsSubmitting(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'businessIds') {
      const businessId = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        businessIds: prev.businessIds.includes(businessId)
          ? prev.businessIds.filter(id => id !== businessId)
          : [...prev.businessIds, businessId]
      }));
    } else if (name === 'roleIds') {
      const roleId = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        roleIds: prev.roleIds.includes(roleId)
          ? prev.roleIds.filter(id => id !== roleId)
          : [...prev.roleIds, roleId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre completo es obligatorio.';
    if (!formData.email.trim()) newErrors.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del correo no es válido.';
    if (formData.roleIds.length === 0) newErrors.roleIds = 'Debe seleccionar al menos un rol.';
    if (formData.businessIds.length === 0) newErrors.businessIds = 'Debe seleccionar al menos un negocio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 CreateUserModal: handleSubmit ejecutándose');
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Prepare data with avatar file
        const submitData: CreateUserDTO = {
          ...formData,
          avatarFile: avatarFile || undefined
        };

        console.log('📤 CreateUserModal: Enviando datos:', submitData);
        
        const result = await onSubmit(submitData);
        
        console.log('✅ CreateUserModal: Respuesta recibida:', result);

        // Si la API devuelve email y password, mostrarlos
        if (result && (result.email || result.password)) {
          setUserCredentials({
            email: result.email || formData.email,
            password: result.password
          });
        }
      } catch (error: any) {
        console.error('❌ CreateUserModal: Error:', error);
        alert(`Error creando usuario: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (userCredentials) {
      setUserCredentials(null);
    } else {
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles!');
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={handleClose}
      title={userCredentials ? 'Usuario Creado' : 'Crear Nuevo Usuario'}
      actions={userCredentials ? (
        <button type="button" className="btn btn-primary" onClick={handleClose}>
          Cerrar
        </button>
      ) : (
        <>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Cancelar</button>
          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={isSubmitting} 
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </button>
        </>
      )}
    >
      {userCredentials ? (
        <div className="credentials-display">
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>¡Usuario Creado Exitosamente!</h3>
            <p>El usuario ha sido creado. Aquí están las credenciales de acceso:</p>
          </div>
          <div className="credentials-box">
            <div className="credential-item">
              <label>Email:</label>
              <div className="credential-value">
                <span>{userCredentials.email}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(userCredentials.email)}
                  title="Copiar email"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="credential-item">
              <label>Contraseña:</label>
              <div className="credential-value">
                <span>{userCredentials.password}</span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(userCredentials.password)}
                  title="Copiar contraseña"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
          <div className="credentials-warning">
            <div className="warning-icon">⚠️</div>
            <p><strong>Importante:</strong> Guarda estas credenciales en un lugar seguro. La contraseña no se mostrará nuevamente.</p>
          </div>
        </div>
      ) : (
        <form id="create-user-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nombre Completo</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Correo</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Teléfono (opcional)</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="role_id">Rol</label>
              <select
                id="role_id"
                name="role_id"
                value={formData.roleIds[0] || ''}
                onChange={(e) => {
                  const roleId = parseInt(e.target.value, 10);
                  setFormData(prev => ({
                    ...prev,
                    roleIds: roleId ? [roleId] : []
                  }));
                }}
                className={errors.roleIds ? 'error' : ''}
              >
                <option value="">Seleccionar rol</option>
                {safeRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleIds && <p className="error-text">{errors.roleIds}</p>}
              {safeRoles.length === 0 && <p className="no-data">Cargando roles...</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="business_id">Negocio</label>
              <select
                id="business_id"
                name="business_id"
                value={formData.businessIds[0] || ''}
                onChange={(e) => {
                  const businessId = parseInt(e.target.value, 10);
                  setFormData(prev => ({
                    ...prev,
                    businessIds: businessId ? [businessId] : []
                  }));
                }}
                className={errors.businessIds ? 'error' : ''}
              >
                <option value="">Seleccionar negocio</option>
                {safeBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              {errors.businessIds && <p className="error-text">{errors.businessIds}</p>}
              {safeBusinesses.length === 0 && <p className="no-data">Cargando negocios...</p>}
            </div>

            <div className="form-group">
              <label htmlFor="avatar">Avatar (opcional)</label>
              <div className="avatar-upload">
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
                <label htmlFor="avatar" className="avatar-label">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                  ) : (
                    <div className="avatar-placeholder">
                      <span>📷</span>
                      <span>Seleccionar imagen</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            <div className="form-group-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                <span>Activar usuario</span>
              </label>
            </div>
          </div>
          
          <div className="info-box">
            <div className="info-content">
              <span className="info-icon">🔐</span>
              <p>La contraseña se generará automáticamente y se mostrará una vez creado el usuario.</p>
            </div>
          </div>
        </form>
      )}
    </ModalBase>
  );
};

export default CreateUserModal; 