/**
 * Hueco central de la barra superior flotante (`FloatingNav`) donde cada módulo pone sus pestañas.
 *
 * `FloatingNav` registra el elemento con `setTopBarSlot` (ref callback) y `DsSectionHeader` lo lee
 * con `useTopBarSlot` para llevar ahí sus pestañas con un portal. Sin barra flotante (teléfono u
 * otros layouts) el hueco es `null` y las pestañas se quedan en la página.
 */

'use client';

import { useSyncExternalStore } from 'react';

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export function setTopBarSlot(element: HTMLElement | null): void {
  if (slot === element) return;
  slot = element;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTopBarSlot(): HTMLElement | null {
  return useSyncExternalStore(subscribe, () => slot, () => null);
}
