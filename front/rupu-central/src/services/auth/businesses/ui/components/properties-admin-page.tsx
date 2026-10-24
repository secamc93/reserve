/**
 * Propiedades en Accesos (rediseño IAM): una tarjeta por conjunto con su estado y cuántos
 * usuarios tiene, y un panel para encender o apagar sus módulos. Búsqueda y tipo en la URL
 * (?q=&tipo=), paginación en ?page=&page_size=.
 */

'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import {
  DsCard,
  DsEyebrow,
  DsSearch,
  DsSidePanel,
  DsStatus,
  VtNotice,
  VtSwitch,
  dsSelect,
  useDebouncedValue,
  useUrlFilters,
  vtBtn,
} from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { getUsersAction } from '@/services/auth/users/infrastructure/actions';
import { useBusinessTypes } from '../../../business-types/ui/hooks';
import { activateResourceAction, deactivateResourceAction, getBusinessConfiguredResourcesAction } from '../../infrastructure/actions';
import { useBusinesses } from '../hooks';

interface PropertyRow {
  id: number;
  name: string;
  description?: string;
  address: string;
  logo_url?: string;
  is_active: boolean;
  business_type_id: number;
  business_type?: string;
}

const FILTER_KEYS = ['q', 'tipo'] as const;

function PropertyLogo({ property, size = 44 }: { property: Pick<PropertyRow, 'name' | 'logo_url'>; size?: number }) {
  if (property.logo_url) {
    return <img src={property.logo_url} alt="" className="rounded-xl object-cover shrink-0 bg-[#f5f5f4]" style={{ width: size, height: size }} />;
  }
  const initials = property.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  return (
    <span aria-hidden="true" className="rounded-xl shrink-0 inline-flex items-center justify-center font-bold bg-[#E3F5F5] text-[#0C6B76]" style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}>
      {initials || '?'}
    </span>
  );
}

/** Módulos de una propiedad: interruptor por módulo (activar / desactivar). */
function PropertyModulesPanel({ property, onClose }: { property: PropertyRow; onClose: () => void }) {
  const token = TokenStorage.getBusinessToken() ?? '';
  const [modules, setModules] = useState<{ resource_id: number; resource_name: string; is_active: boolean }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setModules(null);
    getBusinessConfiguredResourcesAction({ token, businessId: property.id }).then((r) => {
      if (cancelled) return;
      if (r.success && r.data) setModules([...r.data.resources].sort((a, b) => a.resource_name.localeCompare(b.resource_name, 'es')));
      else setError(r.error ?? 'No se pudieron leer los módulos');
    });
    return () => {
      cancelled = true;
    };
  }, [token, property.id]);

  const toggle = async (resourceId: number, next: boolean) => {
    setBusyId(resourceId);
    setError(null);
    const params = { token, resourceId, businessId: property.id };
    const r = next ? await activateResourceAction(params) : await deactivateResourceAction(params);
    setBusyId(null);
    if (!r.success) {
      setError(r.error ?? 'No se pudo cambiar el módulo');
      return;
    }
    setModules((prev) => prev?.map((m) => (m.resource_id === resourceId ? { ...m, is_active: next } : m)) ?? prev);
  };

  const active = modules?.filter((m) => m.is_active).length ?? 0;

  return (
    <DsSidePanel
      open
      onClose={onClose}
      width={440}
      eyebrow="Propiedad"
      title={property.name}
      subtitle={property.address || property.business_type}
      footer={
        <>
          <Link href={`/iam/users?propiedad=${property.id}`} className={vtBtn.secondary}>Ver sus usuarios</Link>
          <Link href={`/properties/${property.id}`} className={vtBtn.primary}>Abrir propiedad</Link>
        </>
      }
    >
      <section aria-label="Módulos" className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <DsEyebrow>Módulos</DsEyebrow>
          {modules && (
            <span className="text-xs text-[#6b6660]">
              <span className={dsMono}>{active}</span> de <span className={dsMono}>{modules.length}</span> activos
            </span>
          )}
        </div>
        <p className="m-0 text-[13px] text-[#4b4a46]">Un módulo apagado desaparece del menú de la propiedad para todos sus usuarios.</p>
        {error && <VtNotice>{error}</VtNotice>}
        {!modules && !error && <span className="text-[13px] text-[#8a8580]">Cargando módulos…</span>}
        {modules?.length === 0 && <span className="text-[13px] text-[#8a8580]">Este tipo de propiedad no tiene módulos configurados.</span>}
        {modules?.map((m) => (
          <div key={m.resource_id} className="flex items-center justify-between gap-3 border border-[#e4e2dd] rounded-xl px-3.5 py-2.5">
            <span className="text-sm font-medium">{m.resource_name}</span>
            <VtSwitch
              checked={m.is_active}
              onChange={(v) => toggle(m.resource_id, v)}
              label={`${m.resource_name} en ${property.name}`}
              disabled={busyId !== null}
              busy={busyId === m.resource_id}
            />
          </div>
        ))}
      </section>
    </DsSidePanel>
  );
}

function PropertyCard({ property, users, onOpen }: { property: PropertyRow; users: number | null; onOpen: () => void }) {
  return (
    <DsCard className="p-4 flex flex-col gap-3.5">
      <div className="flex gap-3 items-start min-w-0">
        <PropertyLogo property={property} />
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="m-0 text-[15px] font-semibold truncate">{property.name}</h2>
          <span className="text-[13px] text-[#6b6660] truncate">{property.address || property.description || 'Sin dirección'}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px]">
        <DsStatus label={property.is_active ? 'Activa' : 'Inactiva'} color={property.is_active ? '#1f8a4c' : '#8a8580'} />
        {property.business_type && <span className="px-2 py-0.5 rounded-md bg-[#f0eeeb] text-[#3d3c39] text-xs">{property.business_type}</span>}
        <Link href={`/iam/users?propiedad=${property.id}`} className="text-[#0F7F8A] hover:text-[#0C6B76] font-medium">
          {users === null ? '… usuarios' : users === 1 ? '1 usuario' : `${users} usuarios`}
        </Link>
      </div>
      <div className="flex gap-2 mt-auto pt-1">
        <button type="button" className={`${vtBtn.secondary} flex-1`} onClick={onOpen} aria-label={`Módulos de ${property.name}`}>
          Módulos
        </button>
        <Link href={`/properties/${property.id}`} className={`${vtBtn.ghost} flex-1`}>Abrir</Link>
      </div>
    </DsCard>
  );
}

export function PropertiesAdminPage() {
  const token = TokenStorage.getBusinessToken() ?? '';
  const { values, setFilters } = useUrlFilters(FILTER_KEYS);
  const { page, pageSize } = usePaginationParams();
  const [search, setSearch] = useDebouncedValue(values.q, (q) => setFilters({ q }));
  const { allBusinessTypes } = useBusinessTypes({ autoLoad: true });
  const { businesses, loading, error, total, totalPages, refetch } = useBusinesses({
    token,
    page,
    pageSize,
    name: values.q || undefined,
    businessTypeId: Number(values.tipo) > 0 ? Number(values.tipo) : undefined,
  });
  const [userCounts, setUserCounts] = useState<Record<number, number>>({});
  const [openId, setOpenId] = useState<number | null>(null);

  const rows = (businesses as PropertyRow[]).filter(Boolean);
  const ids = rows.map((b) => b.id).join(',');

  const loadCounts = useCallback(async () => {
    if (!token || !ids) return;
    const entries = await Promise.all(
      ids.split(',').map(async (id) => {
        const r = await getUsersAction({ token, business_id: Number(id), page: 1, page_size: 1 });
        return [Number(id), r.success && r.data ? r.data.count : 0] as const;
      }),
    );
    setUserCounts(Object.fromEntries(entries));
  }, [token, ids]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const open = rows.find((b) => b.id === openId) ?? null;

  return (
    <IamPage>
      <IamPageHeader title="Propiedades" description="Los conjuntos que administra Rupü: su estado, sus usuarios y los módulos que tienen encendidos." counts={{ '/iam/businesses': total || null }} />

      <div className="flex flex-wrap items-center gap-2.5">
        <DsSearch value={search} onChange={setSearch} placeholder="Buscar propiedad por nombre" className="md:w-80" />
        {allBusinessTypes.length > 1 && (
          <select aria-label="Filtrar por tipo" className={dsSelect} value={values.tipo} onChange={(e) => setFilters({ tipo: e.target.value })}>
            <option value="">Tipo: todos</option>
            {allBusinessTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <VtNotice>
          No se pudieron cargar las propiedades: {error}{' '}
          <button type="button" className="underline" onClick={() => refetch()}>Reintentar</button>
        </VtNotice>
      )}

      {loading && rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-[#8a8580]">Cargando propiedades…</div>
      ) : rows.length === 0 ? (
        <DsCard className="py-10 px-5 text-center text-sm text-[#8a8580]">No hay propiedades con estos filtros.</DsCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map((b) => (
            <PropertyCard key={b.id} property={b} users={userCounts[b.id] ?? null} onOpen={() => setOpenId(b.id)} />
          ))}
        </div>
      )}

      <DsCard className="px-[22px] py-2">
        <Pagination total={total} totalPages={totalPages} disabled={loading} />
      </DsCard>

      {open && <PropertyModulesPanel property={open} onClose={() => setOpenId(null)} />}
    </IamPage>
  );
}
