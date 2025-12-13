'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge, Spinner, Alert, ConfirmModal, Button } from '@shared/ui';
import { Table, TableColumn, PaginationProps, TableFiltersProps, FilterOption, ActiveFilter } from '@shared/ui/table';
import { getResidentsAction, deleteResidentAction } from '../infrastructure/actions';
import { Resident } from '../domain/entities';
import { TokenStorage } from '@shared/config';
import { CreateResidentModal } from './create-resident-modal';
import { EditResidentModal } from './edit-resident-modal';
import { ImportResidentsModal } from './import-residents-modal';
import { BulkEditResidentsModal } from './bulk-edit-residents-modal';
import { PlusIcon } from '@heroicons/react/24/outline';

export function ResidentsTable({ businessId }: { businessId: number }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResidents, setTotalResidents] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  // Estados para alertas y confirmación
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<number | null>(null);

  // Estados para filtros (formato compatible con API)
  const [filters, setFilters] = useState({
    name: undefined as string | undefined,
    propertyUnitId: undefined as number | undefined,
    residentTypeId: undefined as number | undefined,
    isActive: undefined as boolean | undefined,
    isMainResident: undefined as boolean | undefined,
    dni: undefined as string | undefined,
  });

  // Estados para opciones de filtros
  const [units, setUnits] = useState<Array<{ id: number; number: string }>>([]);
  const [unitOptions, setUnitOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Cargar opciones de unidades para el filtro
  const fetchUnits = useCallback(async () => {
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;
      const { getPropertyUnitsAction } = await import('../../units/infrastructure/actions');
      const data = await getPropertyUnitsAction({
        businessId,
        token,
        page: 1,
        pageSize: 100, // Cargar más unidades para el filtro
      });
      const unitsList = data.units.map(u => ({ id: u.id, number: u.number }));
      setUnits(unitsList);
      setUnitOptions(unitsList.map(u => ({ value: u.id.toString(), label: u.number })));
    } catch (error) {
      console.error('Error loading units:', error);
      setUnits([]);
      setUnitOptions([]);
    }
  }, [businessId]);

  // Cargar unidades al montar el componente
  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const loadResidents = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('No token found');

      const data = await getResidentsAction({
        businessId,
        token,
        page: currentPage,
        pageSize: pageSize,
        ...filters, // Aplicar filtros activos
      });

      setResidents(data.residents);
      setTotalPages(data.totalPages);
      setTotalResidents(data.total);
    } catch (error) {
      console.error('Error al cargar residentes:', error);
      setAlert({ type: 'error', message: 'Error al cargar los residentes' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, [currentPage, pageSize, filters]);

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'isActive') {
      newFilters.isActive = value === true;
    } else if (filterKey === 'isMainResident') {
      newFilters.isMainResident = value === true;
    } else if (filterKey === 'propertyUnitId') {
      newFilters.propertyUnitId = parseInt(value);
    } else if (filterKey === 'residentTypeId') {
      newFilters.residentTypeId = parseInt(value);
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'isActive') {
      delete newFilters.isActive;
    } else if (filterKey === 'isMainResident') {
      delete newFilters.isMainResident;
    } else if (filterKey === 'propertyUnitId') {
      delete newFilters.propertyUnitId;
    } else if (filterKey === 'residentTypeId') {
      delete newFilters.residentTypeId;
    } else {
      delete (newFilters as any)[filterKey];
    }
    
    setFilters(newFilters);
  };

  const handleDeleteClick = (residentId: number) => {
    setResidentToDelete(residentId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!residentToDelete) return;

    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) throw new Error('No token found');

      await deleteResidentAction({ businessId, residentId: residentToDelete, token });
      await loadResidents();

      setAlert({ type: 'success', message: 'Residente eliminado correctamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error al eliminar residente:', error);
      setAlert({ type: 'error', message: 'Error al eliminar el residente' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setShowDeleteConfirm(false);
      setResidentToDelete(null);
    }
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  // Convertir filtros a ActiveFilter[]
  const activeFilters: ActiveFilter[] = [];
  if (filters.name) {
    activeFilters.push({
      key: 'name',
      label: 'Nombre',
      value: filters.name,
      type: 'text',
    });
  }
  if (filters.dni) {
    activeFilters.push({
      key: 'dni',
      label: 'DNI',
      value: filters.dni,
      type: 'text',
    });
  }
  if (filters.propertyUnitId) {
    const unit = units.find(u => u.id === filters.propertyUnitId);
    activeFilters.push({
      key: 'propertyUnitId',
      label: 'Unidad',
      value: filters.propertyUnitId.toString(),
      type: 'select',
    });
  }
  if (filters.residentTypeId) {
    activeFilters.push({
      key: 'residentTypeId',
      label: 'Tipo',
      value: filters.residentTypeId.toString(),
      type: 'select',
    });
  }
  if (filters.isActive !== undefined) {
    activeFilters.push({
      key: 'isActive',
      label: 'Estado',
      value: filters.isActive,
      type: 'boolean',
    });
  }
  if (filters.isMainResident !== undefined) {
    activeFilters.push({
      key: 'isMainResident',
      label: 'Principal',
      value: filters.isMainResident,
      type: 'boolean',
    });
  }

  // Definir filtros disponibles
  const availableFilters: FilterOption[] = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre',
    },
    {
      key: 'dni',
      label: 'DNI',
      type: 'text',
      placeholder: 'Buscar por DNI',
    },
    {
      key: 'propertyUnitId',
      label: 'Unidad',
      type: 'select',
      options: unitOptions,
    },
    {
      key: 'residentTypeId',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: '1', label: 'Propietario' },
        { value: '2', label: 'Arrendatario' },
        { value: '3', label: 'Familiar' },
        { value: '4', label: 'Invitado' },
      ],
    },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'boolean',
    },
    {
      key: 'isMainResident',
      label: 'Principal',
      type: 'boolean',
    },
  ];

  // Definir columnas de la tabla
  const columns: TableColumn<Resident>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (_, resident) => (
        <div className="font-semibold text-gray-900">{resident.name}</div>
      ),
    },
    {
      key: 'propertyUnitNumber',
      label: 'Unidad',
      render: (_, resident) => (
        <span className="text-gray-700">{resident.propertyUnitNumber || '-'}</span>
      ),
    },
    {
      key: 'residentTypeName',
      label: 'Tipo',
      render: (_, resident) => (
        <span className="text-gray-700">{resident.residentTypeName}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (_, resident) => (
        <span className="text-gray-700">{resident.email || '-'}</span>
      ),
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (_, resident) => (
        <span className="text-gray-700">{resident.phone || '-'}</span>
      ),
    },
    {
      key: 'isMainResident',
      label: 'Principal',
      render: (_, resident) => (
        <Badge type={resident.isMainResident ? 'success' : 'primary'}>
          {resident.isMainResident ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (_, resident) => (
        <Badge type={resident.isActive ? 'success' : 'error'}>
          {resident.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center',
      render: (_, resident) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(resident)}
            className="p-2 hover:bg-green-50 hover:text-green-600"
            title="Editar residente"
          >
            ✏️
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(resident.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600"
            title="Eliminar residente"
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  // Configuración de paginación
  const pagination: PaginationProps = {
    currentPage,
    totalPages,
    totalItems: totalResidents,
    itemsPerPage: pageSize,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: setPageSize,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  // Configuración de filtros
  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
    headerActions: (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImportModal(true)}
          className="btn-outline btn-sm"
        >
          📊 Importar Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBulkEditModal(true)}
          className="btn-outline btn-sm"
        >
          ✏️ Edición Masiva
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary btn-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Agregar Residente
        </Button>
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Residentes</h2>
      </div>

      {/* Alertas */}
      {alert && (
        <div>
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Tabla con filtros y paginación integrados */}
      <Table
        columns={columns}
        data={residents}
        loading={loading}
        emptyMessage="No hay residentes disponibles"
        keyExtractor={(resident) => resident.id.toString()}
        pagination={pagination}
        filters={tableFilters}
      />

      {showCreateModal && (
        <CreateResidentModal
          businessId={businessId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadResidents();
          }}
        />
      )}

      {showEditModal && selectedResident && (
        <EditResidentModal
          businessId={businessId}
          resident={selectedResident}
          onClose={() => {
            setShowEditModal(false);
            setSelectedResident(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedResident(null);
            loadResidents();
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setResidentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este residente? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de importación */}
      <ImportResidentsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadResidents}
        businessId={businessId}
      />

      {/* Modal de edición masiva */}
      <BulkEditResidentsModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onSuccess={loadResidents}
        businessId={businessId}
      />
    </div>
  );
}
