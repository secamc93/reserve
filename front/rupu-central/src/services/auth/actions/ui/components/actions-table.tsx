'use client';

import { useState, useEffect } from 'react';
import { getActionsAction, deleteActionAction } from '../../infrastructure/actions';
import { Table, TableColumn, Button, Input, ConfirmModal, Badge } from '@shared/ui';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ActionsTableProps {
    token: string;
    onEdit?: (action: ActionItem) => void;
    onCreate?: () => void;
}

interface ActionItem {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export function ActionsTable({ token, onEdit, onCreate }: ActionsTableProps) {
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionToDelete, setActionToDelete] = useState<ActionItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

    const loadActions = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getActionsAction({
                token,
                page,
                page_size: pageSize,
                name: searchTerm || undefined,
            });

            if (result.success && result.data) {
                setActions(result.data.actions);
                setTotal(result.data.total);
                setTotalPages(result.data.total_pages);
            } else {
                setError(result.error || 'Error al cargar acciones');
            }
        } catch (err) {
            setError('Error inesperado al cargar acciones');
            console.error('Error loading actions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActions();
    }, [token, page, searchTerm]);

    const handleDeleteClick = (action: ActionItem) => {
        setActionToDelete(action);
    };

    const handleDeleteConfirm = async () => {
        if (!actionToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteActionAction({
                token,
                actionId: actionToDelete.id,
            });

            if (result.success) {
                setActions(actions.filter(a => a.id !== actionToDelete.id));
                setActionToDelete(null);
            } else {
                setError(result.error || 'Error al eliminar acción');
            }
        } catch (err) {
            setError('Error inesperado al eliminar acción');
            console.error('Error deleting action:', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: TableColumn<ActionItem>[] = [
        {
            key: 'name',
            label: 'Nombre',
            render: (_, action) => (
                <div className="font-medium text-gray-900">{action.name}</div>
            ),
        },
        {
            key: 'description',
            label: 'Descripción',
            render: (description) => (
                <div className="text-sm text-gray-600">{description as string}</div>
            ),
        },
        {
            key: 'created_at',
            label: 'Creado',
            render: (created_at) => (
                <div className="text-sm text-gray-500">{formatDate(created_at as string)}</div>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            render: (_, action) => (
                <div className="flex gap-2">
                    <Button
                        className="btn-outline btn-sm"
                        onClick={() => onEdit?.(action)}
                    >
                        <PencilIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        className="btn-outline btn-sm hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteClick(action)}
                        disabled={isDeleting}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    if (error) {
        return (
            <div className="alert alert-error">
                <div>
                    <h3 className="font-semibold">Error</h3>
                    <p>{error}</p>
                </div>
                <Button onClick={() => loadActions()} className="btn-primary btn-sm">
                    Reintentar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            {/* Filtros */}
            <div className="card w-full">
                <div className="card-body">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Acciones del Sistema</h3>
                        {onCreate && (
                            <Button onClick={onCreate} className="btn-primary" title="Nueva Acción">
                                <PlusIcon className="w-5 h-5" />
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por nombre..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <Button onClick={() => setSearchTerm('')} className="btn-outline">
                            Limpiar
                        </Button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        Mostrando {actions.length} de {total} acciones
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <Table
                columns={columns}
                data={actions}
                loading={loading}
                keyExtractor={(action) => action.id}
                emptyMessage={searchTerm ? "No se encontraron acciones." : "No hay acciones disponibles."}
            />

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                        Página {page} de {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="btn-outline btn-sm"
                        >
                            ← Anterior
                        </Button>
                        <Button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="btn-outline btn-sm"
                        >
                            Siguiente →
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal de eliminación */}
            <ConfirmModal
                isOpen={!!actionToDelete}
                onClose={() => setActionToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Acción"
                message={`¿Estás seguro de que quieres eliminar la acción "${actionToDelete?.name}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
}
