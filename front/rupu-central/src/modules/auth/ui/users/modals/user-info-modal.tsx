/**
 * Modal de información del usuario
 * Componente específico del módulo auth
 */

'use client';

import { useEffect, useState } from 'react';
import { Modal, Badge } from '@shared/ui';
import { TokenStorage } from '@shared/config';

interface BusinessData {
  id: number;
  name: string;
  code: string;
  logo_url: string;
  is_active: boolean;
  primary_color?: string;
  secondary_color?: string;
  tertiary_color?: string;
  quaternary_color?: string;
}

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Información del Usuario"
      glass={true}
      size="lg"
    >
      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          {user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4"
              style={{ borderColor: 'var(--color-primary)' }}
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
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

        {/* Botones */}
        <div className="pt-4 space-y-2">
          <button 
            className="btn btn-danger w-full"
            onClick={handleLogout}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>

          <button 
            className="btn btn-secondary w-full"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

