/**
 * Modal para ver detalles del usuario
 * Aplica estilos globales y usa componentes reutilizables
 */

'use client';

import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { Badge } from '@shared/ui/badge';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
}

export function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">ID: {user.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <EnvelopeIcon className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 inline mr-2" />
                Teléfono
              </label>
              <p className="text-gray-900">{user.phone || 'No especificado'}</p>
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
              Estado
            </label>
            <Badge 
              variant={user.is_active ? "success" : "error"}
              className="text-sm"
            >
              {user.is_active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Último acceso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-2" />
              Último acceso
            </label>
            <p className="text-gray-900">
              {user.last_login_at ? formatDateTime(user.last_login_at) : 'Nunca'}
            </p>
          </div>

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ShieldCheckIcon className="w-4 h-4 inline mr-2" />
                Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role: any) => (
                  <Badge key={role.id} variant="secondary" className="text-sm">
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Negocios */}
          {user.businesses && user.businesses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="w-4 h-4 inline mr-2" />
                Negocios
              </label>
              <div className="space-y-2">
                {user.businesses.map((business: any) => (
                  <div key={business.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {business.logo_url ? (
                      <img 
                        src={business.logo_url} 
                        alt={business.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-300 flex items-center justify-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{business.name}</p>
                      <p className="text-sm text-gray-500">{business.business_type_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de creación
              </label>
              <p className="text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Última actualización
              </label>
              <p className="text-gray-900">{formatDate(user.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="btn-outline"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
