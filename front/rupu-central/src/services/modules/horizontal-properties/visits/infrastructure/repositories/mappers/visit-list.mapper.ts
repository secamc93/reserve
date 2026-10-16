/**
 * Mappers puros de la lista y el resumen de visitas (respuesta del back → dominio).
 */

import { VisitListDTO, VisitsSummary } from '../../../domain';
import { BackendVisitList, BackendVisitsSummaryResponse } from '../response/visits.response';

/** El back envía null en las horas que no existen; el dominio usa undefined. */
const opt = <T,>(v: T | null | undefined): T | undefined => (v === null || v === undefined ? undefined : v);

export function mapBackendVisitList(visit: BackendVisitList): VisitListDTO {
  return {
    id: visit.id,
    visitorName: visit.visitor_name,
    visitorDni: visit.visitor_dni,
    visitorPhone: opt(visit.visitor_phone) || undefined,
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
  };
}
