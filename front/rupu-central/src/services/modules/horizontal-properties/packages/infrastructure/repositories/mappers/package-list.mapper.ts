/**
 * Mappers puros de la lista y el resumen de paquetes (respuesta del back → dominio).
 */

import { PackageListDTO, PackagesSummary } from '../../../domain';
import { BackendPackageList, BackendPackagesSummaryResponse } from '../response/packages.response';

const opt = <T,>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);

export function mapBackendPackageList(pkg: BackendPackageList): PackageListDTO {
  return {
    id: pkg.id,
    trackingNumber: pkg.tracking_number,
    carrier: pkg.carrier,
    propertyUnitNumber: pkg.property_unit_number,
    propertyUnitBlock: opt(pkg.property_unit_block) || undefined,
    residentName: pkg.resident_name,
    description: opt(pkg.description) || undefined,
    statusName: pkg.status_name,
    statusCode: pkg.status_code,
    receivedAt: opt(pkg.received_at),
    deliveredAt: opt(pkg.delivered_at),
    createdAt: pkg.created_at,
  };
}

export function mapBackendPackagesSummary(data: BackendPackagesSummaryResponse['data']): PackagesSummary {
  return {
    pending: data.pending ?? 0,
    pendingOverdue: data.pending_overdue ?? 0,
    deliveredToday: data.delivered_today ?? 0,
    delivered: data.delivered ?? 0,
    closed: data.closed ?? 0,
    total: data.total ?? 0,
  };
}
