'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActionsAction } from '../../infrastructure/actions';

interface ActionItem {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface UseActionsParams {
    token: string;
    page?: number;
    pageSize?: number;
    name?: string;
}

interface UseActionsReturn {
    actions: ActionItem[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    refetch: () => Promise<void>;
}

export function useActions({
    token,
    page = 1,
    pageSize = 10,
    name,
}: UseActionsParams): UseActionsReturn {
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchActions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getActionsAction({
                token,
                page,
                page_size: pageSize,
                name: name || undefined,
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
    }, [token, page, pageSize, name]);

    useEffect(() => {
        fetchActions();
    }, [fetchActions]);

    return {
        actions,
        loading,
        error,
        total,
        totalPages,
        refetch: fetchActions,
    };
}
