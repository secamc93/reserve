'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/shared/ui/components/Layout';
import { useTables } from '../hooks/useTables';
import { Table, CreateTableRequest, UpdateTableRequest } from '@/features/tables/domain/Table';
import TablesStats from '../components/TablesStats';
import TablesManagement from '../components/TablesManagement';
import TableModal from '../components/TableModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ErrorMessage from '@/shared/ui/components/ErrorMessage/ErrorMessage';
import './TablesPage.css';

export default function TablesPage() {
  const {
    tables,
    loading,
    error,
    selectedTable,
    loadTables,
    createTable,
    updateTable,
    deleteTable,
    clearError,
    setSelectedTable
  } = useTables();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  // Debug logs
  console.log('🔄 TablesPage renderizado:', { tables, loading, error });

  useEffect(() => {
    console.log('🔄 TablesPage useEffect ejecutado');
    loadTables();
  }, [loadTables]);

  useEffect(() => {
    // Clamp de seguridad: si algún SVG se renderiza gigante, lo reducimos
    if (typeof document !== 'undefined') {
      const svgs = document.querySelectorAll<SVGElement>('.tables-page svg');
      svgs.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        if (rect.width > 200 || rect.height > 200) {
          svg.style.width = '24px';
          svg.style.height = '24px';
          svg.style.maxWidth = '24px';
          svg.style.maxHeight = '24px';
        }
      });
    }
  }, []);

  const handleCreateTable = async (data: CreateTableRequest | UpdateTableRequest) => {
    try {
      await createTable(data as CreateTableRequest);
      setShowCreateModal(false);
    } catch (error) {
      // Propagar al modal para que muestre el mensaje del backend
      throw error;
    }
  };

  const handleEditTable = async (data: UpdateTableRequest) => {
    if (!selectedTable) return;
    
    try {
      await updateTable(selectedTable.id, data);
      setShowEditModal(false);
      setSelectedTable(null);
    } catch (error) {
      // Propagar al modal para que muestre el mensaje del backend
      throw error;
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    
    try {
      await deleteTable(tableToDelete.id);
      setShowDeleteModal(false);
      setTableToDelete(null);
    } catch (error) {
      // Mantener modal abierto y podríamos mostrar un toast a futuro
      throw error;
    }
  };

  const openEditModal = (table: Table) => {
    setSelectedTable(table);
    setShowEditModal(true);
  };

  const openDeleteModal = (table: Table) => {
    setTableToDelete(table);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedTable(null);
    setTableToDelete(null);
    clearError();
  };

  return (
    <Layout>
      <div className="tables-page min-h-screen bg-gray-50">
        <div className="page-header">
          <div className="header-content">
            <h1>🍽️ Gestión de Mesas</h1>
            <p>Administra las mesas de tu restaurante de manera eficiente</p>
          </div>
          <button 
            className="btn btn-primary create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Agregar Mesa
          </button>
        </div>

        {/* Contenido principal */}
        <div className="tables-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          

          {/* Mensaje de error */}
          {error && (
            <ErrorMessage 
              message={error} 
              title="Error al cargar las mesas"
              variant="error"
              dismissible={true}
              onDismiss={clearError}
              className="mb-6"
            />
          )}

          {/* Estado de carga */}
          {loading && (
            <div className="loading-state text-center py-12">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mesas...</p>
            </div>
          )}

          {/* Estado vacío */}
          {!loading && !error && tables.length === 0 && (
            <div className="empty-state text-center py-12">
              <div className="empty-state-icon mb-4">🍽️</div>
              <h3 className="empty-state-title mb-2">No hay mesas registradas</h3>
              <p className="empty-state-description mb-6">
                Comienza creando la primera mesa para tu restaurante
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="add-table-button px-6 py-3 rounded-lg font-semibold"
              >
                Crear Primera Mesa
              </button>
            </div>
          )}

          {/* Estadísticas - solo mostrar si hay mesas */}
          {!loading && !error && tables.length > 0 && (
            <>
              
              <TablesStats tables={tables} />
            </>
          )}

          {/* Tabla de mesas - solo mostrar si hay mesas */}
          {!loading && !error && tables.length > 0 && (
            <>
              
              <TablesManagement
                tables={tables}
                loading={loading}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            </>
          )}
        </div>

        {/* Modal para crear mesa */}
        <TableModal
          isOpen={showCreateModal}
          onClose={closeModals}
          onSubmit={handleCreateTable}
          mode="create"
        />

        {/* Modal para editar mesa */}
        <TableModal
          isOpen={showEditModal}
          onClose={closeModals}
          onSubmit={handleEditTable}
          table={selectedTable}
          mode="edit"
        />

        {/* Modal de confirmación para eliminar */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onClose={closeModals}
          onConfirm={handleDeleteTable}
          table={tableToDelete}
          loading={loading}
        />
      </div>
    </Layout>
  );
}
