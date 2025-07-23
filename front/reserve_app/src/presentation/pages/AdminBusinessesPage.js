import React, { useState, useEffect } from 'react';
import { useBusinesses } from '../hooks/useBusinesses.js';
import { useBusinessTypes } from '../hooks/useBusinessTypes.js';
import BusinessModal from '../components/BusinessModal.js';
import './AdminBusinessesPage.css';

const AdminBusinessesPage = () => {
    const {
        businesses,
        loading,
        error,
        selectedBusiness,
        fetchBusinesses,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        selectBusiness,
        clearSelection,
        clearError
    } = useBusinesses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Hook para tipos de negocio
    const { businessTypes, loading: businessTypesLoading } = useBusinessTypes();

    const handleCreateBusiness = async (businessData) => {
        try {
            await createBusiness(businessData);
            setIsModalOpen(false);
            clearSelection();
        } catch (error) {
            console.error('Error creando negocio:', error);
        }
    };

    const handleUpdateBusiness = async (businessData) => {
        try {
            await updateBusiness(selectedBusiness.id, businessData);
            setIsModalOpen(false);
            clearSelection();
            setIsEditing(false);
        } catch (error) {
            console.error('Error actualizando negocio:', error);
        }
    };

    const handleDeleteBusiness = async (business) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el negocio "${business.name}"?`)) {
            try {
                await deleteBusiness(business.id);
            } catch (error) {
                console.error('Error eliminando negocio:', error);
            }
        }
    };

    const handleEditBusiness = (business) => {
        selectBusiness(business);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        clearSelection();
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        clearSelection();
        setIsEditing(false);
    };

    // Filtrar negocios
    const filteredBusinesses = businesses.filter(business => {
        const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             business.code.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || 
                             (filterStatus === 'active' && business.isActive) ||
                             (filterStatus === 'inactive' && !business.isActive);
        
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Activo' : 'Inactivo'}
        </span>
    );

    const getFeaturesBadge = (business) => {
        const features = [];
        if (business.enableDelivery) features.push('Delivery');
        if (business.enablePickup) features.push('Pickup');
        if (business.enableReservations) features.push('Reservas');
        
        if (features.length === 0) return <span className="no-features">Sin funcionalidades</span>;
        
        return (
            <div className="features-badges">
                {features.map(feature => (
                    <span key={feature} className="feature-badge">{feature}</span>
                ))}
            </div>
        );
    };

    if (loading && businesses.length === 0) {
        return (
            <div className="admin-businesses-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando negocios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-businesses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Administrar Negocios</h1>
                    <p>Gestiona todos los negocios registrados en el sistema</p>
                </div>
                <button 
                    className="btn-create" 
                    onClick={handleCreateNew}
                    disabled={loading}
                >
                    + Crear Negocio
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={clearError}>×</button>
                </div>
            )}

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="active">Solo activos</option>
                        <option value="inactive">Solo inactivos</option>
                    </select>
                </div>
            </div>

            <div className="businesses-grid">
                {filteredBusinesses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏪</div>
                        <h3>No hay negocios</h3>
                        <p>
                            {searchTerm || filterStatus !== 'all' 
                                ? 'No se encontraron negocios con los filtros aplicados'
                                : 'Aún no hay negocios registrados en el sistema'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <button className="btn-create" onClick={handleCreateNew}>
                                Crear el primer negocio
                            </button>
                        )}
                    </div>
                ) : (
                    filteredBusinesses.map(business => (
                        <div key={business.id} className="business-card">
                            <div className="business-header">
                                <div className="business-info">
                                    <h3>{business.name}</h3>
                                    <p className="business-code">{business.code}</p>
                                </div>
                                {getStatusBadge(business.isActive)}
                            </div>

                            <div className="business-details">
                                <div className="detail-item">
                                    <span className="label">Tipo:</span>
                                    <span className="value">{business.getBusinessTypeText()}</span>
                                </div>
                                
                                {business.address && (
                                    <div className="detail-item">
                                        <span className="label">Dirección:</span>
                                        <span className="value">{business.address}</span>
                                    </div>
                                )}
                                
                                {business.timezone && (
                                    <div className="detail-item">
                                        <span className="label">Zona horaria:</span>
                                        <span className="value">{business.timezone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="business-features">
                                <span className="label">Funcionalidades:</span>
                                {getFeaturesBadge(business)}
                            </div>

                            {business.description && (
                                <div className="business-description">
                                    <p>{business.description}</p>
                                </div>
                            )}

                            <div className="business-actions">
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEditBusiness(business)}
                                    disabled={loading}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteBusiness(business)}
                                    disabled={loading}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BusinessModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditing ? handleUpdateBusiness : handleCreateBusiness}
                business={selectedBusiness}
                businessTypes={businessTypes}
                loading={loading || businessTypesLoading}
            />
        </div>
    );
};

export default AdminBusinessesPage; 