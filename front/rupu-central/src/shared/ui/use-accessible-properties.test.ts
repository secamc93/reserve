import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const get = vi.hoisted(() => vi.fn());
vi.mock('@/services/auth/businesses/infrastructure/actions/get-businesses.action', () => ({ getBusinessesAction: get }));
vi.mock('@shared/config', () => ({
  TokenStorage: { getUser: () => ({ is_super_admin: true }), getBusinessToken: () => 'T', getSessionToken: () => null, getBusinessesData: () => [] },
}));

import { useAccessibleProperties } from './use-accessible-properties';

const page = (names: string[]) => ({ success: true, data: { businesses: names.map((name, i) => ({ id: i + 1, name, business_type_id: 1 })) } });

describe('useAccessibleProperties', () => {
  it('reload vuelve a pedir la lista (la caché no esconde una propiedad recién creada)', async () => {
    get.mockResolvedValueOnce(page(['A'])).mockResolvedValueOnce(page(['A', 'Nueva']));
    const { result } = renderHook(() => useAccessibleProperties());
    await waitFor(() => expect(result.current.properties.map((p) => p.name)).toEqual(['A']));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.properties.map((p) => p.name)).toEqual(['A', 'Nueva']));
    expect(get).toHaveBeenCalledTimes(2);
  });
});
