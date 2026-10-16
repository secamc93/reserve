/**
 * Mapeo de las respuestas del back (snake_case, null) al dominio (camelCase, undefined).
 */

import type {
  CommonArea,
  CommonAreaListDTO,
  CommonAreaReservation,
  CommonAreaRestriction,
  CommonAreaSchedule,
  CommonAreaType,
  ReservationListDTO,
  RestrictionType,
  UnitLookup,
} from '../../domain';
import type {
  BackendCommonArea,
  BackendCommonAreaList,
  BackendCommonAreaType,
  BackendReservation,
  BackendReservationList,
  BackendRestriction,
  BackendSchedule,
  BackendUnitLookup,
} from './response/common-areas.response';

const opt = <T>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);
const optText = (v: string | null | undefined): string | undefined => (v ? v : undefined);
/** "08:00:00" → "08:00" */
export const clock = (v: string | null | undefined): string => (v && v.length >= 5 ? v.slice(0, 5) : v ?? '');

/** image_urls es un arreglo JSON de URLs (o una URL suelta): devuelve la primera. */
export function firstImageUrl(raw: string | null | undefined): string | undefined {
  const value = (raw ?? '').trim();
  if (!value) return undefined;
  if (value.startsWith('[')) {
    try {
      const list = JSON.parse(value) as unknown;
      const first = Array.isArray(list) ? list.find((x) => typeof x === 'string' && x.trim()) : undefined;
      return typeof first === 'string' ? first.trim() : undefined;
    } catch {
      return undefined;
    }
  }
  return /^https?:\/\//.test(value) ? value : undefined;
}

export function mapSchedule(s: BackendSchedule): CommonAreaSchedule {
  return { id: s.id, dayOfWeek: s.day_of_week, startTime: clock(s.start_time), endTime: clock(s.end_time), isActive: s.is_active };
}

export function mapCommonArea(a: BackendCommonArea): CommonArea {
  return {
    id: a.id,
    businessId: a.business_id,
    commonAreaTypeId: a.common_area_type_id,
    typeName: optText(a.type_name),
    typeCode: optText(a.type_code),
    name: a.name,
    description: optText(a.description),
    location: optText(a.location),
    maxCapacity: a.max_capacity,
    areaSqm: opt(a.area_sqm),
    hasEquipment: a.has_equipment,
    equipmentDescription: optText(a.equipment_description),
    hourlyRate: opt(a.hourly_rate),
    requiresApproval: a.requires_approval,
    requiresDeposit: a.requires_deposit,
    depositAmount: opt(a.deposit_amount),
    allowsRecurring: a.allows_recurring,
    isActive: a.is_active,
    imageUrls: optText(a.image_urls),
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}

export function mapCommonAreaList(a: BackendCommonAreaList): CommonAreaListDTO {
  return {
    id: a.id,
    name: a.name,
    typeName: a.type_name ?? '',
    typeCode: optText(a.type_code),
    description: optText(a.description),
    location: a.location ?? '',
    maxCapacity: a.max_capacity,
    areaSqm: opt(a.area_sqm),
    hasEquipment: a.has_equipment ?? false,
    equipmentDescription: optText(a.equipment_description),
    hourlyRate: opt(a.hourly_rate),
    requiresDeposit: a.requires_deposit ?? false,
    depositAmount: opt(a.deposit_amount),
    allowsRecurring: a.allows_recurring ?? false,
    isActive: a.is_active,
    requiresApproval: a.requires_approval,
    imageUrl: firstImageUrl(a.image_urls),
    schedules: (a.schedules ?? []).map(mapSchedule),
    restrictions: (a.restrictions ?? []).map(mapRestriction),
  };
}

export function mapCommonAreaType(t: BackendCommonAreaType): CommonAreaType {
  return {
    id: t.id,
    name: t.name,
    code: t.code,
    description: optText(t.description),
    icon: optText(t.icon),
    defaultMaxCapacity: opt(t.default_max_capacity),
    requiresApproval: t.requires_approval,
    allowsRecurring: t.allows_recurring,
    isActive: t.is_active,
  };
}

export function mapRestriction(r: BackendRestriction): CommonAreaRestriction {
  return {
    id: r.id,
    commonAreaId: r.common_area_id,
    restrictionType: r.restriction_type as RestrictionType,
    startDate: r.start_date.slice(0, 10),
    endDate: r.end_date.slice(0, 10),
    startTime: r.start_time ? clock(r.start_time) : undefined,
    endTime: r.end_time ? clock(r.end_time) : undefined,
    reason: optText(r.reason),
  };
}

export function mapUnit(u: BackendUnitLookup): UnitLookup {
  return { id: u.id, number: u.number, block: u.block ?? '' };
}

export function mapReservation(r: BackendReservation): CommonAreaReservation {
  return {
    id: r.id,
    businessId: r.business_id,
    commonAreaId: r.common_area_id,
    commonAreaName: optText(r.common_area_name),
    propertyUnitId: r.property_unit_id,
    propertyUnitNumber: optText(r.property_unit_number),
    propertyUnitBlock: optText(r.property_unit_block),
    residentId: opt(r.resident_id),
    residentName: optText(r.resident_name),
    reservationStatusId: r.reservation_status_id,
    statusCode: optText(r.status_code),
    statusName: optText(r.status_name),
    reservationDate: r.reservation_date,
    startTime: clock(r.start_time),
    endTime: clock(r.end_time),
    durationHours: r.duration_hours,
    requiresApproval: r.requires_approval,
    approvedAt: opt(r.approved_at),
    rejectedAt: opt(r.rejected_at),
    rejectionReason: optText(r.rejection_reason),
    numberOfGuests: r.number_of_guests,
    purpose: optText(r.purpose),
    specialRequests: optText(r.special_requests),
    isRecurring: r.is_recurring,
    totalAmount: opt(r.total_amount),
    depositAmount: opt(r.deposit_amount),
    depositPaid: r.deposit_paid,
    depositPaidAt: opt(r.deposit_paid_at),
    fullPaymentPaid: r.full_payment_paid,
    fullPaymentPaidAt: opt(r.full_payment_paid_at),
    qrCode: optText(r.qr_code),
    accessCode: optText(r.access_code),
    checkedInAt: opt(r.checked_in_at),
    checkedOutAt: opt(r.checked_out_at),
    cancelledAt: opt(r.cancelled_at),
    cancellationReason: optText(r.cancellation_reason),
    notes: optText(r.notes),
    residentNotes: optText(r.resident_notes),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function mapReservationList(r: BackendReservationList): ReservationListDTO {
  return {
    id: r.id,
    commonAreaId: r.common_area_id ?? 0,
    commonAreaName: r.common_area_name ?? '',
    propertyUnitId: r.property_unit_id ?? 0,
    propertyUnitNumber: r.property_unit_number ?? '',
    propertyUnitBlock: r.property_unit_block ?? '',
    residentName: r.resident_name ?? '',
    statusCode: r.status_code ?? '',
    statusName: r.status_name ?? '',
    reservationDate: r.reservation_date,
    startTime: clock(r.start_time),
    endTime: clock(r.end_time),
    numberOfGuests: r.number_of_guests,
    purpose: optText(r.purpose),
    requiresApproval: r.requires_approval ?? false,
    totalAmount: opt(r.total_amount),
    depositAmount: opt(r.deposit_amount),
    depositPaid: r.deposit_paid ?? false,
    fullPaymentPaid: r.full_payment_paid ?? false,
    checkedInAt: opt(r.checked_in_at),
    createdAt: r.created_at,
  };
}

/** Cuerpo JSON de crear/editar zona en snake_case. */
export function toBackendArea(data: Record<string, unknown>): Record<string, unknown> {
  const map: Record<string, string> = {
    commonAreaTypeId: 'common_area_type_id',
    name: 'name',
    description: 'description',
    location: 'location',
    maxCapacity: 'max_capacity',
    areaSqm: 'area_sqm',
    hasEquipment: 'has_equipment',
    equipmentDescription: 'equipment_description',
    hourlyRate: 'hourly_rate',
    requiresApproval: 'requires_approval',
    requiresDeposit: 'requires_deposit',
    depositAmount: 'deposit_amount',
    allowsRecurring: 'allows_recurring',
    imageUrls: 'image_urls',
    isActive: 'is_active',
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    const key = map[k];
    if (key && v !== undefined) out[key] = v;
  }
  return out;
}
