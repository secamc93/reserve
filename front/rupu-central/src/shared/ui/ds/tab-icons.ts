/**
 * Icono de cada submenú (pestaña de `DsSectionHeader`) para el riel lateral, por id de pestaña.
 * Los ids se repiten entre módulos con el mismo sentido ("today", "all", "pending", "zones").
 * Las pestañas dinámicas (bloques "bloque:Torre A", tipos de residente "tipo:3") no tienen icono:
 * el riel muestra sus iniciales.
 */

import type { ComponentType, SVGProps } from 'react';
import {
  ArchiveBoxIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  KeyIcon,
  ListBulletIcon,
  MapIcon,
  NoSymbolIcon,
  Squares2X2Icon,
  SunIcon,
  TicketIcon,
  UserMinusIcon,
} from '@heroicons/react/24/outline';

export type TabIcon = ComponentType<SVGProps<SVGSVGElement>>;

const TAB_ICONS: Record<string, TabIcon> = {
  // Resumen
  today: SunIcon,
  info: DocumentTextIcon,
  // Visitas
  inside: ArrowRightEndOnRectangleIcon,
  expected: ClockIcon,
  left: ArrowLeftStartOnRectangleIcon,
  week: CalendarDaysIcon,
  all: ListBulletIcon,
  // Paquetería / zonas comunes
  pending: ClockIcon,
  calendar: CalendarIcon,
  history: ArchiveBoxIcon,
  // Parqueaderos / zonas comunes
  map: MapIcon,
  assignments: KeyIcon,
  reservations: TicketIcon,
  zones: Squares2X2Icon,
  // Residentes
  todos: ListBulletIcon,
  'sin-correo': EnvelopeIcon,
  inactivos: NoSymbolIcon,
  // Unidades
  todas: ListBulletIcon,
  'sin-residente': UserMinusIcon,
  locales: BuildingStorefrontIcon,
  inactivas: NoSymbolIcon,
};

export function tabIcon(id: string): TabIcon | null {
  return TAB_ICONS[id] ?? null;
}
