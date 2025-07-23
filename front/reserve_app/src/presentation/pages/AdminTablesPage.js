import React, { useState, useEffect } from 'react';
import { useTables } from '../hooks/useTables.js';
import { useBusinesses } from '../hooks/useBusinesses.js';
import TableModal from '../components/TableModal.js';
import './AdminTablesPage.css';

const AdminTablesPage = () => {
    const {
        tables,
        loading,
        error,
        selectedTable,
        fetchTables,
        createTable,
        updateTable,
        deleteTable,
        selectTable,
        clearSelection,
        clearError
    } = useTables();

    const { businesses } = useBusinesses();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBusiness, setFilterBusiness] = useState('all');

    const handleCreateTable = async (tableData) => {
        try {
            await createTable(tableData);
            setIsModalOpen(false);
            clearSelection();
        } catch (error) {
            console.error('Error creando mesa:', error);
        }
    };

    const handleUpdateTable = async (tableData) => {
        try {
            await updateTable(selectedTable.id, tableData);
            setIsModalOpen(false);
            clearSelection();
            setIsEditing(false);
        } catch (error) {
            console.error('Error actualizando mesa:', error);
        }
    };

    const handleDeleteTable = async (table) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la mesa ${table.number} del negocio "${table.getBusinessName()}"?`)) {
            try {
                await deleteTable(table.id);
            } catch (error) {
                console.error('Error eliminando mesa:', error);
            }
        }
    };

    const handleEditTable = (table) => {
        selectTable(table);
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

    // Filtrar mesas
    const filteredTables = tables.filter(table => {
        const matchesSearch = table.number.toString().includes(searchTerm) ||
                             table.getBusinessName().toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesBusiness = filterBusiness === 'all' || 
                               table.businessId.toString() === filterBusiness;
        
        return matchesSearch && matchesBusiness;
    });

    const getStatusBadge = (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Activa' : 'Inactiva'}
        </span>
    );

    const getCapacityBadge = (capacity) => {
        let color = '#10b981'; // Verde para capacidad normal
        if (capacity > 8) color = '#f59e0b'; // Amarillo para capacidad alta
        if (capacity > 12) color = '#ef4444'; // Rojo para capacidad muy alta
        
        return (
            <span className="capacity-badge" style={{ backgroundColor: color }}>
                {capacity} {capacity === 1 ? 'persona' : 'personas'}
            </span>
        );
    };

    if (loading && tables.length === 0) {
        return (
            <div className="admin-tables-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando mesas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-tables-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>Administrar Mesas</h1>
                    <p>Gestiona todas las mesas registradas en el sistema</p>
                </div>
                <button 
                    className="btn-create" 
                    onClick={handleCreateNew}
                    disabled={loading}
                >
                    + Crear Mesa
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
                        placeholder="Buscar por número de mesa o negocio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={filterBusiness} 
                        onChange={(e) => setFilterBusiness(e.target.value)}
                    >
                        <option value="all">Todos los negocios</option>
                        {businesses.map(business => (
                            <option key={business.id} value={business.id.toString()}>
                                {business.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="tables-grid">
                {filteredTables.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🪑</div>
                        <h3>No hay mesas</h3>
                        <p>
                            {searchTerm || filterBusiness !== 'all' 
                                ? 'No se encontraron mesas con los filtros aplicados'
                                : 'Aún no hay mesas registradas en el sistema'
                            }
                        </p>
                        {!searchTerm && filterBusiness === 'all' && (
                            <button className="btn-create" onClick={handleCreateNew}>
                                Crear la primera mesa
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTables.map(table => (
                        <div key={table.id} className="table-card">
                            <div className="table-header">
                                <div className="table-info">
                                    <h3>Mesa {table.number}</h3>
                                    <p className="table-business">{table.getBusinessName()}</p>
                                </div>
                                {getStatusBadge(table.isActive)}
                            </div>

                            <div className="table-details">
                                <div className="detail-item">
                                    <span className="label">Capacidad:</span>
                                    {getCapacityBadge(table.capacity)}
                                </div>
                                
                                <div className="detail-item">
                                    <span className="label">Negocio:</span>
                                    <span className="value">{table.getBusinessName()}</span>
                                </div>
                                
                                {table.createdAt && (
                                    <div className="detail-item">
                                        <span className="label">Creada:</span>
                                        <span className="value">
                                            {table.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="table-actions">
                                <button 
                                    className="btn-edit"
                                    onClick={() => handleEditTable(table)}
                                    disabled={loading}
                                >
                                    Editar
                                </button>
                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeleteTable(table)}
                                    disabled={loading}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <TableModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={isEditing ? handleUpdateTable : handleCreateTable}
                table={selectedTable}
                businesses={businesses}
                loading={loading}
            />
        </div>
    );
};

export default AdminTablesPage; 