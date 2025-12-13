'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Badge, Alert, ConfirmModal, TableColumn } from '@shared/ui';
import type { TableFiltersProps } from '@shared/ui/table';
import type { FilterOption, ActiveFilter } from '@shared/ui/dynamic-filters';
import { PencilIcon, TrashIcon, PlusIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '@shared/ui/button';
import { getPropertyUnitsAction, deletePropertyUnitAction } from '../infrastructure/actions';
import { PropertyUnit, UNIT_TYPE_LABELS } from '../domain';
import { TokenStorage } from '@shared/config';
import { generateBusinessTokenAction } from '@/services/auth/login/infrastructure/actions';
import { CreatePropertyUnitModal } from './create-property-unit-modal';
import { EditPropertyUnitModal } from './edit-property-unit-modal';
import { ImportUnitsModal } from './import-units-modal';

export function PropertyUnitsTable({ businessId }: { businessId: number }) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null);
  const isFirstLoadRef = useRef(true);

  // Estados para alertas y confirmación
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<number | null>(null);

  // Filtros usando el mismo sistema que users
  const [filters, setFilters] = useState<{
    number?: string;
    unitType?: string;
    floor?: number;
    block?: string;
    isActive?: boolean;
  }>({});

  const getBusinessToken = useCallback(async (): Promise<string> => {
    let businessToken = TokenStorage.getBusinessToken();
    if (businessToken) return businessToken;

    const sessionToken = TokenStorage.getSessionToken();
    if (!sessionToken) throw new Error('No session token available');

    const user = TokenStorage.getUser();
    const isSuperAdmin = user?.is_super_admin;
    const business_id = isSuperAdmin ? 0 : businessId;

    const result = await generateBusinessTokenAction({
      business_id,
      session_token: sessionToken,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error || 'No se pudo generar business token');
    }

    TokenStorage.setBusinessToken(result.data.token);
    TokenStorage.setActiveBusiness(business_id);
    return result.data.token;
  }, [businessId]);

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getBusinessToken();

      const data = await getPropertyUnitsAction({
        businessId,
        token,
        page: currentPage,
        pageSize: pageSize,
        ...filters,
      });

      setUnits(data.units);
      setTotalPages(data.totalPages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error al cargar unidades:', error);
      setAlert({ type: 'error', message: 'Error al cargar las unidades' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [businessId, currentPage, pageSize, filters, getBusinessToken]);

  useEffect(() => {
    loadUnits();
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
    }
  }, [loadUnits]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDeleteClick = (unitId: number) => {
    setUnitToDelete(unitId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;

    try {
      const token = await getBusinessToken();
      await deletePropertyUnitAction({ businessId, unitId: unitToDelete, token });
      await loadUnits();

      setAlert({ type: 'success', message: 'Unidad eliminada correctamente' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
      setAlert({ type: 'error', message: 'Error al eliminar la unidad' });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setShowDeleteConfirm(false);
      setUnitToDelete(null);
    }
  };

  const handleEdit = (unit: PropertyUnit) => {
    setSelectedUnit(unit);
    setShowEditModal(true);
  };

  // Convertir filtros a ActiveFilter[]
  const activeFilters: ActiveFilter[] = [];
  if (filters.number) {
    activeFilters.push({
      key: 'number',
      label: 'Número',
      value: filters.number,
      type: 'text',
    });
  }
  if (filters.unitType) {
    activeFilters.push({
      key: 'unitType',
      label: 'Tipo',
      value: filters.unitType,
      type: 'select',
    });
  }
  if (filters.floor !== undefined) {
    activeFilters.push({
      key: 'floor',
      label: 'Piso',
      value: filters.floor.toString(),
      type: 'text',
    });
  }
  if (filters.block) {
    activeFilters.push({
      key: 'block',
      label: 'Bloque',
      value: filters.block,
      type: 'text',
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

  // Definir filtros disponibles
  const availableFilters: FilterOption[] = [
    {
      key: 'number',
      label: 'Número',
      type: 'text',
      placeholder: 'Buscar por número (ej: 101, A-201)',
    },
    {
      key: 'unitType',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 'apartment', label: 'Apartamento' },
        { value: 'house', label: 'Casa' },
        { value: 'office', label: 'Oficina' },
        { value: 'commercial', label: 'Local comercial' },
        { value: 'parking', label: 'Parqueadero' },
        { value: 'storage', label: 'Depósito' },
        { value: 'penthouse', label: 'Penthouse' },
      ],
    },
    {
      key: 'floor',
      label: 'Piso',
      type: 'text',
      placeholder: 'Buscar por piso',
    },
    {
      key: 'block',
      label: 'Bloque',
      type: 'text',
      placeholder: 'Buscar por bloque (A, B, 1, 2...)',
    },
    {
      key: 'isActive',
      label: 'Estado',
      type: 'boolean',
    },
  ];

  // Manejar agregar filtro
  const handleAddFilter = (filterKey: string, value: any) => {
    const newFilters = { ...filters };
    
    if (filterKey === 'isActive') {
      newFilters.isActive = value === true;
    } else if (filterKey === 'floor') {
      newFilters.floor = value ? Number(value) : undefined;
    } else {
      (newFilters as any)[filterKey] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Manejar remover filtro
  const handleRemoveFilter = (filterKey: string) => {
    const newFilters = { ...filters };
    delete (newFilters as any)[filterKey];
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const columns: TableColumn<PropertyUnit>[] = [
    {
      key: 'number',
      label: 'Número',
    },
    {
      key: 'unitType',
      label: 'Tipo',
      render: (_, unit) => UNIT_TYPE_LABELS[unit.unitType] || unit.unitType,
    },
    {
      key: 'floor',
      label: 'Piso',
      render: (_, unit) => unit.floor ?? '-',
    },
    {
      key: 'block',
      label: 'Bloque',
      render: (_, unit) => unit.block || '-',
    },
    {
      key: 'area',
      label: 'Área (m²)',
      render: (_, unit) => unit.area ? `${unit.area} m²` : '-',
    },
    {
      key: 'bedrooms',
      label: 'Habitaciones',
      render: (_, unit) => unit.bedrooms ?? '-',
    },
    {
      key: 'coefficient',
      label: 'Coeficiente',
      render: (_, unit) => unit.coefficient ? unit.coefficient.toFixed(6) : '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      render: (_, unit) => (
        <Badge type={unit.isActive ? 'success' : 'error'}>
          {unit.isActive ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center',
      render: (_, unit) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(unit)}
            className="p-2 hover:bg-blue-50 hover:text-blue-600"
            title="Editar"
          >
            <PencilIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteClick(unit.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    currentPage,
    totalPages,
    totalItems: totalCount,
    itemsPerPage: pageSize,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handlePageSizeChange,
    showItemsPerPageSelector: true,
    itemsPerPageOptions: [5, 10, 25, 50, 100],
  };

  const tableFilters: TableFiltersProps = {
    availableFilters,
    activeFilters,
    onAddFilter: handleAddFilter,
    onRemoveFilter: handleRemoveFilter,
    headerActions: (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowImportModal(true)}
          className="btn-secondary"
        >
          <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
          Importar Excel
        </Button>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Agregar Unidad
        </Button>
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Tabla con filtros y paginación integrada */}
      <Table
        columns={columns}
        data={units}
        loading={loading}
        emptyMessage="No hay unidades disponibles"
        keyExtractor={(unit) => unit.id.toString()}
        pagination={pagination}
        filters={tableFilters}
      />

      {showCreateModal && (
        <CreatePropertyUnitModal
          businessId={businessId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadUnits();
          }}
        />
      )}

      {showEditModal && selectedUnit && (
        <EditPropertyUnitModal
          businessId={businessId}
          unit={selectedUnit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedUnit(null);
            loadUnits();
          }}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUnitToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta unidad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de importación */}
      <ImportUnitsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={loadUnits}
        businessId={businessId}
      />
    </div>
  );
}
