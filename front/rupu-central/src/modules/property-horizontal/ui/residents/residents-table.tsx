'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Spinner } from '@shared/ui';
import { getResidentsAction, deleteResidentAction } from '../../infrastructure/actions';
import { Resident } from '../../domain';
import { TokenStorage } from '@/modules/auth/infrastructure/storage';
import { CreateResidentModal } from './create-resident-modal';
import { EditResidentModal } from './edit-resident-modal';

export function ResidentsTable({ hpId }: { hpId: number }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const loadResidents = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      const data = await getResidentsAction({
        hpId,
        token,
        page: currentPage,
        pageSize: 10,
      });

      setResidents(data.residents);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error al cargar residentes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResidents();
  }, [currentPage]);

  const handleDelete = async (residentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este residente?')) return;

    try {
      const token = TokenStorage.getToken();
      if (!token) throw new Error('No token found');

      await deleteResidentAction({ hpId, residentId, token });
      await loadResidents();
    } catch (error) {
      console.error('Error al eliminar residente:', error);
      alert('Error al eliminar el residente');
    }
  };

  const handleEdit = (resident: Resident) => {
    setSelectedResident(resident);
    setShowEditModal(true);
  };

  const columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'unit', label: 'Unidad' },
    { key: 'type', label: 'Tipo' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'isMain', label: 'Principal' },
    { key: 'isActive', label: 'Estado' },
    { key: 'actions', label: 'Acciones' },
  ];

  const data = residents.map(resident => ({
    name: resident.name,
    unit: resident.propertyUnitNumber,
    type: resident.residentTypeName,
    email: resident.email,
    phone: resident.phone || '-',
    isMain: (
      <Badge type={resident.isMainResident ? 'success' : 'primary'}>
        {resident.isMainResident ? 'Sí' : 'No'}
      </Badge>
    ),
    isActive: (
      <Badge type={resident.isActive ? 'success' : 'error'}>
        {resident.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(resident)} className="btn btn-sm btn-outline">
          ✏️ Editar
        </button>
        <button onClick={() => handleDelete(resident.id)} className="btn btn-sm btn-error">
          🗑️
        </button>
      </div>
    ),
  }));

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Residentes</h2>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          ➕ Agregar Residente
        </button>
      </div>

      <Table columns={columns} data={data} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn btn-sm"
          >
            Anterior
          </button>
          <span className="py-2 px-4">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateResidentModal
          hpId={hpId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadResidents();
          }}
        />
      )}

      {showEditModal && selectedResident && (
        <EditResidentModal
          hpId={hpId}
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
    </div>
  );
}
