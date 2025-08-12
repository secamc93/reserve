'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { CreateBusinessRequest, UpdateBusinessRequest } from '../../domain/Business';
import Layout from '@/shared/ui/components/Layout';
import BusinessModal from '../components/BusinessModal';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import LoadingSpinner from '@/shared/ui/components/LoadingSpinner';
import './BusinessPage.css';

export default function BusinessPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  const {
    businesses,
    businessTypes,
    loading,
    error,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    clearError,
    clearSelectedBusiness
  } = useBusiness();

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const openEditModal = (business: any) => {
    setSelectedBusiness(business);
    setShowEditModal(true);
  };

  const openDeleteModal = (business: any) => {
    if (window.confirm(`¿Eliminar el negocio "${business.name}"?`)) {
      handleDeleteBusiness(business.id);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedBusiness(null);
    clearSelectedBusiness();
    clearError();
  };

  const handleCreateBusiness = async (data: CreateBusinessRequest | UpdateBusinessRequest) => {
    try {
      await createBusiness(data as CreateBusinessRequest);
      setShowCreateModal(false);
    } catch (error) {
      // El error se maneja en el modal
      throw error;
    }
  };

  const handleEditBusiness = async (data: UpdateBusinessRequest) => {
    if (!selectedBusiness) return;
    
    try {
      await updateBusiness(selectedBusiness.id, data);
      setShowEditModal(false);
      setSelectedBusiness(null);
    } catch (error) {
      // El error se maneja en el modal
      throw error;
    }
  };

  const handleDeleteBusiness = async (id: number) => {
    try {
      await deleteBusiness(id);
    } catch (error: any) {
      alert(`Error al eliminar negocio: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="business-page min-h-screen bg-gray-50">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>🏢 Gestión de Negocios</h1>
            <p>Administra los negocios del sistema</p>
          </div>
          <button 
            className="btn btn-primary create-btn"
            onClick={openCreateModal}
          >
            ➕ Crear Negocio
          </button>
        </div>

        {/* Contenido principal */}
        <div className="business-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensaje de error */}
          {error && (
            <ErrorMessage 
              message={error} 
              title="Error al cargar los negocios"
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
              <p className="text-gray-600 mt-4">Cargando negocios...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && businesses.length === 0 && (
            <div className="empty-state text-center py-12">
              <div className="empty-state-icon mb-4">🏢</div>
              <h3 className="empty-state-title mb-2">No hay negocios registrados</h3>
              <p className="empty-state-description mb-6">
                Comienza creando el primer negocio del sistema
              </p>
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
              >
                Crear Primer Negocio
              </button>
            </div>
          )}

          {/* Lista de negocios */}
          {!loading && !error && businesses.length > 0 && (
            <div className="businesses-grid">
              {businesses.map((business) => (
                <div key={business.id} className="business-card">
                  <div className="business-card-header">
                    <div className="business-logo">
                      {business.logoURL ? (
                        <img src={business.logoURL} alt={business.name} />
                      ) : (
                        <div className="business-logo-placeholder">
                          {business.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="business-info">
                      <h3 className="business-name">{business.name}</h3>
                      <p className="business-code">{business.code}</p>
                      <p className="business-address">{business.address}</p>
                    </div>
                    <div className="business-status">
                      <span className={`status-badge ${business.isActive ? 'active' : 'inactive'}`}>
                        {business.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="business-card-body">
                    <p className="business-description">{business.description}</p>
                    
                    <div className="business-features">
                      {business.enableReservations && (
                        <span className="feature-badge">📅 Reservas</span>
                      )}
                      {business.enableDelivery && (
                        <span className="feature-badge">🚚 Delivery</span>
                      )}
                      {business.enablePickup && (
                        <span className="feature-badge">📦 Recogida</span>
                      )}
                    </div>
                  </div>

                  <div className="business-card-actions">
                    <button
                      onClick={() => openEditModal(business)}
                      className="btn btn-secondary btn-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => openDeleteModal(business)}
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
        <BusinessModal
          isOpen={showCreateModal}
          onClose={closeModals}
          onSubmit={handleCreateBusiness}
          mode="create"
          businessTypes={businessTypes}
        />
        
        <BusinessModal
          isOpen={showEditModal}
          onClose={closeModals}
          onSubmit={handleEditBusiness}
          business={selectedBusiness}
          mode="edit"
          businessTypes={businessTypes}
        />
      </div>
    </Layout>
  );
}
