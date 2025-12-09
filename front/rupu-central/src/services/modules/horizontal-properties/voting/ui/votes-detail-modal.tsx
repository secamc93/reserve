/**
 * Modal: Ver Votos de una Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Spinner, Badge, Table, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getVotesAction } from '../infrastructure/actions';

interface Vote {
  id: number;
  votingId: number;
  votingOptionId: number;
  propertyUnitId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
}

interface VotesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  groupId: number;
  votingId: number;
  votingTitle: string;
  options: Array<{ id: number; optionText: string; optionCode: string }>;
}

export function VotesDetailModal({
  isOpen,
  onClose,
  businessId,
  groupId,
  votingId,
  votingTitle,
  options,
}: VotesDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadVotes();
    }
  }, [isOpen, votingId]);

  const loadVotes = async () => {
    setLoading(true);
    try {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        console.error('❌ No se encontró el token');
        return;
      }

      const result = await getVotesAction({ token, businessId, groupId, votingId });

      if (result.success && result.data) {
        setVotes(result.data);
      }
    } catch (error) {
      console.error('❌ Error al cargar votos:', error);
    }
    setLoading(false);
  };

  // Calcular resumen
  const summary = options.map(option => {
    const count = votes.filter(v => v.votingOptionId === option.id).length;
    const percentage = votes.length > 0 ? ((count / votes.length) * 100).toFixed(1) : '0';
    return { option, count, percentage };
  });

  const getOptionById = (optionId: number) => {
    const option = options.find(o => o.id === optionId);
    return option ? option.optionText : 'Desconocida';
  };

  const columns: TableColumn<Vote>[] = [
    { key: 'id', label: 'ID', width: '80px', align: 'center' },
    {
      key: 'propertyUnitId',
      label: 'Residente',
      width: '120px',
      render: (value) => `Residente #${value}`,
    },
    {
      key: 'votingOptionId',
      label: 'Opción Votada',
      width: '200px',
      render: (value) => getOptionById(value as number),
    },
    {
      key: 'votedAt',
      label: 'Fecha de Voto',
      width: '180px',
      render: (value) =>
        new Date(String(value)).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      key: 'notes',
      label: 'Notas',
      render: (value) => (
        <span className="text-sm text-gray-600">{value ? String(value) : '-'}</span>
      ),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Votos: ${votingTitle}`} size="full">
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Resumen - Fijo arriba */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
          <h3 className="font-bold text-blue-900 mb-4 text-lg">📊 Resumen de Votación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-blue-700 mb-1">Total de votos</p>
              <p className="text-3xl font-bold text-blue-900">{votes.length}</p>
            </div>
            {summary.map(({ option, count, percentage }) => (
              <div key={option.id} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">{option.optionText}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                  <Badge type="primary">{percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Votos - Con scroll */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="font-bold text-gray-900 mb-3 text-lg flex-shrink-0">📋 Detalle de Votos</h3>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size="lg" />
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No hay votos registrados aún</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 shadow-sm">
              <Table
                columns={columns}
                data={votes}
                loading={loading}
                emptyMessage="No hay votos registrados"
                keyExtractor={(row) => row.id}
              />
            </div>
          )}
        </div>

        {/* Botón Cerrar - Fijo abajo */}
        <div className="flex-shrink-0 flex justify-end pt-4 mt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

