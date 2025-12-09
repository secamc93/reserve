'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBusinessesAction } from '../../infrastructure/actions';

interface Business {
    id: number;
    name: string;
    description?: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo_url?: string;
    is_active: boolean;
    business_type_id: number;
    business_type?: string;
    created_at: string;
    updated_at: string;
}

interface UseBusinessesParams {
    token: string;
    page?: number;
    pageSize?: number;
    name?: string;
    businessTypeId?: number;
}

interface UseBusinessesReturn {
    businesses: Business[];
    loading: boolean;
    error: string | null;
    total: number;
    totalPages: number;
    refetch: () => Promise<void>;
}

export function useBusinesses({
    token,
    page = 1,
    pageSize = 10,
    name,
    businessTypeId,
}: UseBusinessesParams): UseBusinessesReturn {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchBusinesses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getBusinessesAction({
                token,
                page,
                per_page: pageSize,
                name: name || undefined,
                business_type_id: businessTypeId,
            });

            if (result.success && result.data) {
                setBusinesses(result.data.businesses);
                setTotal(result.data.pagination.total);
                setTotalPages(result.data.pagination.last_page);
            } else {
                setError(result.error || 'Error al cargar negocios');
            }
        } catch (err) {
            setError('Error inesperado al cargar negocios');
            console.error('Error loading businesses:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, pageSize, name, businessTypeId]);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);

    return {
        businesses,
        loading,
        error,
        total,
        totalPages,
        refetch: fetchBusinesses,
    };
}
