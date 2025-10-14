/**
 * Modal: Ver Votos de una Votación
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Spinner, Badge, Table, type TableColumn } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getVotesAction } from '../../infrastructure/actions';

interface Vote {
  id: number;
  votingId: number;
  votingOptionId: number;
  residentId: number;
  votedAt: string;
  ipAddress: string;
  userAgent: string;
  notes?: string;
}

interface VotesDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  hpId: number;
  groupId: number;
  votingId: number;
  votingTitle: string;
  options: Array<{ id: number; optionText: string; optionCode: string }>;
}

export function VotesDetailModal({
  isOpen,
  onClose,
  hpId,
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
      const token = TokenStorage.getToken();
      if (!token) {
        console.error('❌ No se encontró el token');
        return;
      }

      const result = await getVotesAction({ token, hpId, groupId, votingId });

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
      key: 'residentId',
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Votos: ${votingTitle}`} size="xl">
      <div className="space-y-6">
        {/* Resumen */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Resumen de Votación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700">Total de votos:</p>
              <p className="text-2xl font-bold text-blue-900">{votes.length}</p>
            </div>
            <div className="space-y-2">
              {summary.map(({ option, count, percentage }) => (
                <div key={option.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">
                    {option.optionText}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-900">{count}</span>
                    <Badge type="primary">{percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de Votos */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Detalle de Votos</h3>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No hay votos registrados aún</p>
            </div>
          ) : (
            <Table
              columns={columns}
              data={votes}
              loading={loading}
              emptyMessage="No hay votos registrados"
              keyExtractor={(row) => row.id}
            />
          )}
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-4 border-t">
          <button onClick={onClose} className="btn btn-outline">
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

