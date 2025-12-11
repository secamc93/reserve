/**
 * Modal de información del usuario
 * Componente específico del módulo auth
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Modal, Badge } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { ChangePasswordModal } from '@/services/auth/login/ui';

// Usar el tipo de TokenStorage en lugar de definir uno local
import type { BusinessData } from '@shared/config';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  } | null;
}

export function UserInfoModal({ isOpen, onClose, onLogout, user }: UserInfoModalProps) {
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<number | null>(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Cargar businesses del localStorage
      const businessesData = TokenStorage.getBusinessesData() || [];
      const activeBusiness = TokenStorage.getActiveBusiness();
      setBusinesses(businessesData);
      setActiveBusinessId(activeBusiness);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleImageClick = () => {
    setShowImageFullscreen(true);
  };

  const handleImageEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Aquí puedes agregar la lógica para subir la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        // Aquí puedes actualizar el avatar del usuario
        console.log('Nueva imagen seleccionada:', reader.result);
        // TODO: Implementar subida de imagen al backend
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Usuario"
      glass={true}
      size="lg"
    >
      <div className="space-y-4">
        {/* Avatar - Más grande y clickeable */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            {user.avatarUrl ? (
              <div 
                className="relative cursor-pointer"
                onClick={handleImageClick}
              >
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 transition-transform group-hover:scale-105"
                  style={{ borderColor: 'var(--color-primary)' }}
                />
                {/* Overlay para editar */}
                <div 
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={handleImageEdit}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ) : (
              <div 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center text-white text-5xl md:text-6xl font-bold cursor-pointer transition-transform group-hover:scale-105 relative"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onClick={handleImageClick}
              >
                {user.name.charAt(0).toUpperCase()}
                {/* Overlay para editar */}
                <div 
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  onClick={handleImageEdit}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
            {/* Input oculto para seleccionar archivo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Información del usuario - 2 columnas simple */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Nombre</p>
            <p className="text-gray-900 font-semibold">{user.name}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Email</p>
            <p className="text-gray-900 truncate">{user.email}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Rol</p>
            <p className="text-gray-900 font-semibold">{user.role}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">ID</p>
            <p className="text-gray-900 font-mono text-sm">{user.userId}</p>
          </div>
        </div>

        {/* Negocios asociados */}
        {businesses.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <label className="text-sm font-medium text-gray-600 mb-3 block">
              Negocios Asociados
            </label>
            <div className="space-y-2">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="relative rounded-lg overflow-hidden h-24 cursor-pointer group"
                  style={{
                    backgroundImage: `url(${business.logo_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Overlay oscuro */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                  
                  {/* Contenido */}
                  <div className="relative h-full flex items-center justify-between px-4">
                    <div className="text-white">
                      <p className="font-semibold text-sm">{business.name}</p>
                      <p className="text-xs text-white/80">{business.code}</p>
                    </div>
                    
                    {/* Badge de activo */}
                    {business.id === activeBusinessId && (
                      <Badge type="success">Activo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botones - Más pequeños */}
        <div className="pt-4 flex flex-wrap gap-2 justify-center">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowChangePasswordModal(true)}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Cambiar Contraseña
          </button>

          <button 
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          console.log('Contraseña cambiada exitosamente');
        }}
      />

      {/* Modal de imagen en pantalla completa */}
      {showImageFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageFullscreen(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="w-96 h-96 rounded-full flex items-center justify-center text-white text-9xl font-bold"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Botón para cerrar */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setShowImageFullscreen(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Botón para editar */}
            <button
              className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowImageFullscreen(false);
                fileInputRef.current?.click();
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Cambiar Imagen
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

