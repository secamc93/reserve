import React, { useState, useEffect } from 'react';
import { useBusinesses } from '../hooks/useBusinesses.js';
import { useBusinessTypes } from '../hooks/useBusinessTypes.js';
import BusinessModal from '../components/Business/BusinessModal';
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
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Cargando negocios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-businesses-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>🏢 Administrar Negocios</h1>
                        <p>Gestiona todos los negocios registrados en el sistema</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn-primary"
                            onClick={handleCreateNew}
                            disabled={loading}
                        >
                            ✨ Crear Negocio
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                </div>
            )}

            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Buscar negocios</label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Filtrar por estado</label>
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
            </div>

            <div className="businesses-table-container">
                {filteredBusinesses.length === 0 ? (
                    <div className="empty-state">
                        <p>
                            {searchTerm || filterStatus !== 'all'
                                ? 'No se encontraron negocios con los filtros aplicados'
                                : 'Aún no hay negocios registrados en el sistema'
                            }
                        </p>
                        {!searchTerm && filterStatus === 'all' && (
                            <button className="btn-primary" onClick={handleCreateNew}>
                                Crear el primer negocio
                            </button>
                        )}
                    </div>
                ) : (
                    <table className="businesses-table">
                        <thead>
                            <tr>
                                <th>Negocio</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Funcionalidades</th>
                                <th>Creado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBusinesses.map(business => (
                                <tr key={business.id}>
                                    <td>
                                        <div>
                                            <strong>{business.name}</strong>
                                            <br />
                                            <small style={{ color: '#718096', fontFamily: 'monospace' }}>
                                                {business.code}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="business-type-badge">
                                            {business.getBusinessTypeText()}
                                        </span>
                                    </td>
                                    <td>
                                        {getStatusBadge(business.isActive)}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {business.enableDelivery && (
                                                <span style={{
                                                    background: '#667eea',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    Delivery
                                                </span>
                                            )}
                                            {business.enablePickup && (
                                                <span style={{
                                                    background: '#48bb78',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    Pickup
                                                </span>
                                            )}
                                            {business.enableReservations && (
                                                <span style={{
                                                    background: '#ed8936',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    Reservas
                                                </span>
                                            )}
                                            {!business.enableDelivery && !business.enablePickup && !business.enableReservations && (
                                                <span style={{ color: '#718096', fontSize: '0.8rem' }}>
                                                    Sin funcionalidades
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {business.createdAt ? business.createdAt.toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEditBusiness(business)}
                                                disabled={loading}
                                                title="Editar negocio"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteBusiness(business)}
                                                disabled={loading}
                                                title="Eliminar negocio"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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