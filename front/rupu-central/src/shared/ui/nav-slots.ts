/**
 * Huecos de la navegación flotante de escritorio donde cada módulo pone su cabecera
 * (`DsSectionHeader`) con un portal:
 * - `submenu`: riel lateral (`FloatingRail`), las pestañas del módulo como iconos.
 * - `actions`: barra superior (`FloatingNav`), a la izquierda del usuario, los botones del módulo.
 *
 * Cada isla registra su elemento con `setNavSlot` (ref callback) y el módulo lo lee con
 * `useNavSlot`. Sin navegación flotante (teléfono u otros layouts) el hueco es `null` y la
 * cabecera se queda en la página.
 */

'use client';

import { useSyncExternalStore } from 'react';

export type NavSlotName = 'submenu' | 'actions';

const slots: Record<NavSlotName, HTMLElement | null> = { submenu: null, actions: null };
const listeners = new Set<() => void>();

export function setNavSlot(name: NavSlotName, element: HTMLElement | null): void {
  if (slots[name] === element) return;
  slots[name] = element;
  listeners.forEach((listener) => listener());
}

/** Ref callbacks estables para las islas. */
export const setSubmenuSlot = (element: HTMLElement | null) => setNavSlot('submenu', element);
export const setActionsSlot = (element: HTMLElement | null) => setNavSlot('actions', element);

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNavSlot(name: NavSlotName): HTMLElement | null {
  return useSyncExternalStore(subscribe, () => slots[name], () => null);
}

// Pestaña activa del módulo (la pone `DsSectionHeader`): la ruta de la barra superior la muestra
// al final, p. ej. "Conjunto › Unidades › Torre 1".
let currentTab: string | null = null;

export function setCurrentTab(label: string | null): void {
  if (currentTab === label) return;
  currentTab = label;
  listeners.forEach((listener) => listener());
}

export function useCurrentTab(): string | null {
  return useSyncExternalStore(subscribe, () => currentTab, () => null);
}
