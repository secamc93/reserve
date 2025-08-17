'use client';

import React, { useState } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/entities/Business';
import Layout from '@/shared/ui/components/Layout';
import BusinessTypeModal from '../components/BusinessTypeModal';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import './BusinessTypePage.css';

export default function BusinessTypePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<any>(null);

  const {
    businessTypes,
    loading,
    error,
    createBusinessType,
    updateBusinessType,
    deleteBusinessType,
    clearError,
    clearSelectedBusiness
  } = useBusiness();

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openEditModal = (businessType: any) => {
    setSelectedBusinessType(businessType);
    setShowEditModal(true);
  };

  const openDeleteModal = (businessType: any) => {
    if (window.confirm(`¿Eliminar el tipo de negocio "${businessType.name}"?`)) {
      handleDeleteBusinessType(businessType.id);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedBusinessType(null);
    clearSelectedBusiness();
    clearError();
  };

  const handleCreateBusinessType = async (data: CreateBusinessTypeRequest | UpdateBusinessTypeRequest) => {
    try {
      await createBusinessType(data as CreateBusinessTypeRequest);
      setShowCreateModal(false);
    } catch (error) {
      // El error se maneja en el modal
      throw error;
    }
  };

  const handleEditBusinessType = async (data: UpdateBusinessTypeRequest) => {
    if (!selectedBusinessType) return;
    
    try {
      await updateBusinessType(selectedBusinessType.id, data);
      setShowEditModal(false);
      setSelectedBusinessType(null);
    } catch (error) {
      // El error se maneja en el modal
      throw error;
    }
  };

  const handleDeleteBusinessType = async (id: number) => {
    try {
      await deleteBusinessType(id);
    } catch (error: any) {
      alert(`Error al eliminar tipo de negocio: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="business-type-page min-h-screen bg-gray-50">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>🏷️ Tipos de Negocio</h1>
            <p>Administra las categorías de negocios del sistema</p>
          </div>
          <button 
            className="btn btn-primary create-btn"
            onClick={openCreateModal}
          >
            ➕ Crear Tipo
          </button>
        </div>

        {/* Contenido principal */}
        <div className="business-type-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensaje de error */}
          {error && (
            <ErrorMessage 
              message={error} 
              title="Error al cargar los tipos de negocio"
              variant="error"
              dismissible={true}
              onDismiss={clearError}
              className="mb-6"
            />
          )}

          {/* Loading state */}
          {loading && (
            <div className="loading-state text-center py-12">
              <LoadingSpinner />
              <p className="text-gray-600 mt-4">Cargando tipos de negocio...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && businessTypes.length === 0 && (
            <div className="empty-state text-center py-12">
              <div className="empty-state-icon mb-4">🏷️</div>
              <h3 className="empty-state-title mb-2">No hay tipos de negocio registrados</h3>
              <p className="empty-state-description mb-6">
                Comienza creando el primer tipo de negocio del sistema
              </p>
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
              >
                Crear Primer Tipo
              </button>
            </div>
          )}

          {/* Lista de tipos de negocio */}
          {!loading && !error && businessTypes.length > 0 && (
            <div className="business-types-grid">
              {businessTypes.map((businessType) => (
                <div key={businessType.id} className="business-type-card">
                  <div className="business-type-card-header">
                    <div className="business-type-icon">
                      <span className="icon-text">{businessType.icon}</span>
                    </div>
                    <div className="business-type-info">
                      <h3 className="business-type-name">{businessType.name}</h3>
                      <p className="business-type-code">{businessType.code}</p>
                    </div>
                    <div className="business-type-status">
                      <span className={`status-badge ${businessType.isActive ? 'active' : 'inactive'}`}>
                        {businessType.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="business-type-card-body">
                    <p className="business-type-description">{businessType.description}</p>
                  </div>

                  <div className="business-type-card-actions">
                    <button
                      onClick={() => openEditModal(businessType)}
                      className="btn btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => openDeleteModal(businessType)}
                      className="btn btn-danger btn-sm"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <BusinessTypeModal
          isOpen={showCreateModal}
          onClose={closeModals}
          onSubmit={handleCreateBusinessType}
          mode="create"
        />
        
        <BusinessTypeModal
          isOpen={showEditModal}
          onClose={closeModals}
          onSubmit={handleEditBusinessType}
          businessType={selectedBusinessType}
          mode="edit"
        />
      </div>
    </Layout>
  );
} 