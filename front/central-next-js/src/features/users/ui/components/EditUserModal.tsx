'use client';

import React, { useState, useEffect } from 'react';
import ModalBase from '@/shared/ui/components/ModalBase/ModalBase';
import { UpdateUserDTO, Role, Business, User } from '@/features/users/domain/User';
import './EditUserModal.css';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, userData: UpdateUserDTO) => Promise<any>;
  user: User | null;
  roles: Role[];
  businesses: Business[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  user, 
  roles, 
  businesses 
}) => {
  const [formData, setFormData] = useState<UpdateUserDTO>({
    name: '',
    email: '',
    phone: '',
    businessIds: [],
    roleIds: [],
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Ensure roles and businesses are arrays
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeBusinesses = Array.isArray(businesses) ? businesses : [];

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        businessIds: user.businesses.map(b => b.id),
        roleIds: user.roles.map(r => r.id),
        isActive: user.isActive,
      });
      setAvatarPreview(user.avatarURL || null);
      setErrors({});
      setIsSubmitting(false);
      setAvatarFile(null);
    }
  }, [isOpen, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'businessIds') {
      const businessId = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        businessIds: (prev.businessIds || []).includes(businessId)
          ? (prev.businessIds || []).filter(id => id !== businessId)
          : [...(prev.businessIds || []), businessId]
      }));
    } else if (name === 'roleIds') {
      const roleId = parseInt(value, 10);
      setFormData(prev => ({
        ...prev,
        roleIds: (prev.roleIds || []).includes(roleId)
          ? (prev.roleIds || []).filter(id => id !== roleId)
          : [...(prev.roleIds || []), roleId]
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
    
    if (!formData.name?.trim()) newErrors.name = 'El nombre completo es obligatorio.';
    if (!formData.email?.trim()) newErrors.email = 'El correo es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del correo no es válido.';
    if (formData.roleIds?.length === 0) newErrors.roleIds = 'Debe seleccionar al menos un rol.';
    if (formData.businessIds?.length === 0) newErrors.businessIds = 'Debe seleccionar al menos un negocio.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 EditUserModal: handleSubmit ejecutándose');
    
    if (validateForm() && user) {
      setIsSubmitting(true);
      try {
        // Prepare data with avatar file
        const submitData: UpdateUserDTO = {
          ...formData,
          avatarFile: avatarFile || undefined
        };

        console.log('📤 EditUserModal: Enviando datos:', submitData);
        
        const result = await onSubmit(user.id, submitData);
        
        console.log('✅ EditUserModal: Respuesta recibida:', result);
        
        // Close modal on success
        onClose();
      } catch (error: any) {
        console.error('❌ EditUserModal: Error:', error);
        alert(`Error actualizando usuario: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!user) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            type="button" 
            className="btn btn-primary" 
            disabled={isSubmitting} 
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Actualizando...' : 'Actualizar Usuario'}
          </button>
        </>
      }
    >
      <form id="edit-user-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name || ''} 
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
              value={formData.email || ''} 
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
              value={formData.phone || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role_id">Rol</label>
            <select
              id="role_id"
              name="role_id"
              value={formData.roleIds?.[0] || ''}
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
              value={formData.businessIds?.[0] || ''}
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
                checked={formData.isActive || false}
                onChange={handleChange}
              />
              <span>Usuario Activo</span>
            </label>
          </div>
        </div>
        
        <div className="info-box">
          <div className="info-content">
            <span className="info-icon">ℹ️</span>
            <p>Los cambios se aplicarán inmediatamente al usuario.</p>
          </div>
        </div>
      </form>
    </ModalBase>
  );
};

export default EditUserModal; 