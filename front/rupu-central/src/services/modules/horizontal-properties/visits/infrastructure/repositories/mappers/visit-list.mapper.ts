/**
 * Mappers puros de la lista y el resumen de visitas (respuesta del back → dominio).
 */

import { VisitAssetItem, VisitListDTO, VisitsSummary } from '../../../domain';
import { BackendVisitAsset, BackendVisitList, BackendVisitsSummaryResponse } from '../response/visits.response';

/** El back envía null en las horas que no existen; el dominio usa undefined. */
const opt = <T,>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);

export function mapBackendVisitList(visit: BackendVisitList): VisitListDTO {
  return {
    id: visit.id,
    visitorName: visit.visitor_name,
    visitorDni: visit.visitor_dni,
    visitorPhone: opt(visit.visitor_phone) || undefined,
    visitorId: opt(visit.visitor_id),
    propertyUnitId: opt(visit.property_unit_id),
    propertyUnitNumber: visit.property_unit_number,
    propertyUnitBlock: opt(visit.property_unit_block) || undefined,
    visitTypeName: visit.visit_type_name,
    visitStatusName: visit.visit_status_name,
    visitStatusCode: opt(visit.visit_status_code) || undefined,
    scheduledDate: visit.scheduled_date,
    scheduledStartTime: opt(visit.scheduled_start_time),
    scheduledEndTime: opt(visit.scheduled_end_time),
    actualEntryTime: opt(visit.actual_entry_time),
    actualExitTime: opt(visit.actual_exit_time),
    purpose: opt(visit.purpose) || undefined,
    numberOfVisitors: opt(visit.number_of_visitors),
    createdAt: visit.created_at,
    visitorVehiclePlate: opt(visit.visitor_vehicle_plate) || undefined,
    authorizationCode: opt(visit.authorization_code) || undefined,
    entryGate: opt(visit.entry_gate) || undefined,
    residentName: opt(visit.resident_name) || undefined,
    authorizedByName: opt(visit.authorized_by_name) || undefined,
    stayLimitMinutes: opt(visit.stay_limit_minutes),
    exceedsTime: !!visit.exceeds_time,
  };
}

export function mapBackendVisitAsset(a: BackendVisitAsset): VisitAssetItem {
  return {
    id: a.id,
    assetName: a.asset_name,
    assetDescription: a.asset_description || undefined,
    assetSerial: a.asset_serial || undefined,
    assetBrand: a.asset_brand || undefined,
    entryRegistered: a.entry_registered,
    exitRegistered: a.exit_registered,
  };
}

export function mapBackendVisitsSummary(data: BackendVisitsSummaryResponse['data']): VisitsSummary {
  return {
    date: data.date,
    inside: data.inside ?? 0,
    expected: data.expected ?? 0,
    left: data.left ?? 0,
    cancelled: data.cancelled ?? 0,
    total: data.total ?? 0,
    insideNow: data.inside_now ?? 0,
    exceeded: data.exceeded ?? 0,
    nextExpectedAt: opt(data.next_expected_at),
    nextUnitNumber: data.next_unit_number || undefined,
    nextUnitBlock: data.next_unit_block || undefined,
    avgStayMinutes: opt(data.avg_stay_minutes),
  };
}
