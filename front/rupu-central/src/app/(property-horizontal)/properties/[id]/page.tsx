/**
 * Página: Resumen de la propiedad ("PH - Shell y Resumen").
 * Pestañas: Hoy (S1, qué está pasando hoy) y Ficha (S2, datos de la propiedad).
 */

'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getHorizontalPropertyByIdAction } from '@/services/modules/horizontal-properties/properties/infrastructure/actions';
import { getTodaySummaryAction } from '@/services/modules/horizontal-properties/dashboard/infrastructure/actions';
import { TodayView } from '@/services/modules/horizontal-properties/dashboard/ui/today-view';
import type { TodaySummary } from '@/services/modules/horizontal-properties/dashboard/domain/entities';
import { TokenStorage } from '@shared/config';
import { DsBody, DsCard, DsEyebrow, DsPage, DsSectionHeader, VtNotice, dsMono, vtBtn } from '@shared/ui/ds';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PropertyData {
  id: number;
  name: string;
  code: string;
  address: string;
  description?: string;
  totalUnits: number;
  timezone?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSocialArea?: boolean;
  logoUrl?: string;
  primaryColor?: string;
  customDomain?: string;
  createdAt: string;
}

type Tab = 'today' | 'info';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);
  const businessId = parseInt(id);
  const basePath = `/properties/${businessId}`;
  const [tab, setTab] = useState<Tab>('today');
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [today, setToday] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = TokenStorage.getBusinessToken() || TokenStorage.getSessionToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    const isSuperAdmin = Boolean(TokenStorage.getUser()?.is_super_admin);
    const [propertyRes, todayRes] = await Promise.all([
      getHorizontalPropertyByIdAction({ token, id: businessId, business_id: isSuperAdmin ? undefined : businessId }),
      getTodaySummaryAction({ token, businessId }),
    ]);
    if (propertyRes.success && propertyRes.data) setProperty(propertyRes.data as PropertyData);
    else setError(propertyRes.error || 'No se pudo cargar la propiedad');
    if (todayRes.success && todayRes.data) setToday(todayRes.data);
    else if (!todayRes.success) setError((e) => e ?? todayRes.error ?? 'No se pudo cargar el resumen de hoy');
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const amenities: [string, boolean | undefined][] = property
    ? [
        ['Ascensor', property.hasElevator],
        ['Parqueadero', property.hasParking],
        ['Salón social', property.hasSocialArea],
        ['Piscina', property.hasPool],
        ['Gimnasio', property.hasGym],
      ]
    : [];

  return (
    <DsPage>
      <DsSectionHeader<Tab>
        ariaLabel="Secciones del resumen"
        tabs={[
          { id: 'today', label: 'Hoy' },
          { id: 'info', label: 'Ficha' },
        ]}
        active={tab}
        onChange={setTab}
        actions={
          <>
            <Link href={`${basePath}/visits`} className={vtBtn.secondary}>Registrar visita</Link>
            <Link href={`${basePath}/packages`} className={vtBtn.secondary}>Recibir paquete</Link>
          </>
        }
      />
      <DsBody className="!pt-7">
        {error && (
          <div className="flex items-center gap-3">
            <VtNotice>{error}</VtNotice>
            <button type="button" className={vtBtn.small} onClick={load}>Reintentar</button>
          </div>
        )}
        {loading && !today && !property && <p className="py-10 text-center text-sm text-[#8a8580]">Cargando…</p>}

        {tab === 'today' && today && <TodayView summary={today} propertyName={property?.name ?? 'la propiedad'} basePath={basePath} />}

        {tab === 'info' && property && (
          <div className="grid gap-[22px] lg:grid-cols-2 items-start">
            <div className="lg:col-span-2">
              <DsEyebrow className="mb-1.5 !text-[11px]">
                {property.code}
                {property.createdAt && ` · creada ${formatDate(property.createdAt)}`}
              </DsEyebrow>
              <h1 className="m-0 text-2xl font-semibold tracking-[-.02em]">{property.name}</h1>
            </div>
            <DsCard className="px-[22px] py-5 flex flex-col gap-3.5">
              <span className="text-[13px] font-semibold">Datos generales</span>
              {[
                ['Nombre', property.name, false],
                ['Código', property.code, true],
                ['Zona horaria', property.timezone || 'America/Bogota', false],
                ['Dirección', property.address, false],
                ['Unidades', String(property.totalUnits ?? 0), true],
              ].map(([label, value, mono]) => (
                <div key={label as string}>
                  <div className="text-xs font-semibold mb-1.5">{label}</div>
                  <div className={`min-h-[38px] border border-[#d6d3cd] rounded-[7px] px-3 py-2 text-sm bg-[#faf9f7] ${mono ? dsMono : ''}`}>{value || '—'}</div>
                </div>
              ))}
              <div>
                <div className="text-xs font-semibold mb-1.5">Amenidades</div>
                <div className="flex flex-wrap gap-1.5">
                  {amenities.map(([label, on]) => (
                    <span key={label} className={`px-2.5 py-[5px] rounded-[5px] text-xs font-medium ${on ? 'bg-[#1a1a1a] text-white' : 'border border-[#d6d3cd] text-[#4b4a46]'}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </DsCard>
            <div className="flex flex-col gap-[22px]">
              <DsCard className="px-[22px] py-5 flex flex-col gap-3.5">
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-[13px] font-semibold">Identidad del negocio</span>
                  <span className="text-[11px] text-[#8a8580]">se aplica a toda la app y al voto público</span>
                </div>
                <div className="grid grid-cols-[88px_1fr] gap-4 items-center">
                  <div className="w-[88px] h-[88px] rounded-xl border border-dashed border-[#c9c6c0] flex items-center justify-center overflow-hidden text-[11px] text-[#8a8580] text-center">
                    {property.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={property.logoUrl} alt={`Logo de ${property.name}`} className="w-full h-full object-contain" />
                    ) : (
                      <>Sin logo</>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold">Color de marca</span>
                    <div className="flex items-center gap-2">
                      <span className="w-[34px] h-[34px] rounded-lg" style={{ background: property.primaryColor || '#1a1a1a' }} />
                      <span className={`${dsMono} h-[34px] px-2.5 border border-[#d6d3cd] rounded-[7px] flex items-center text-xs`}>{(property.primaryColor || '#1A1A1A').toUpperCase()}</span>
                    </div>
                    <span className="text-[11px] text-[#8a8580]">Los colores de voto (Sí / No / Abstención) no cambian.</span>
                  </div>
                </div>
              </DsCard>
              <DsCard className="px-[22px] py-5 flex flex-col gap-2.5">
                <span className="text-[13px] font-semibold">Dominio público</span>
                <div className={`${dsMono} min-h-[38px] border border-[#d6d3cd] rounded-[7px] px-3 py-2 text-[13px] bg-[#faf9f7]`}>{property.customDomain || '—'}</div>
                <span className="text-[11px] text-[#8a8580]">Usado en los enlaces de votación y reservas que reciben los residentes.</span>
              </DsCard>
              <p className="text-xs text-[#8a8580]">Para editar estos datos: IAM → Negocios.</p>
            </div>
          </div>
        )}
      </DsBody>
    </DsPage>
  );
}
