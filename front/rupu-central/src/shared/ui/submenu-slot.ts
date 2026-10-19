/**
 * Hueco del riel lateral flotante (`FloatingRail`) donde cada módulo pone sus submenús (pestañas).
 *
 * `FloatingRail` registra el elemento con `setSubmenuSlot` (ref callback) y `DsSectionHeader` lo lee
 * con `useSubmenuSlot` para llevar ahí sus pestañas con un portal, como iconos. Sin riel (teléfono u
 * otros layouts) el hueco es `null` y las pestañas se quedan en la página.
 */

'use client';

import { useSyncExternalStore } from 'react';

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export function setSubmenuSlot(element: HTMLElement | null): void {
  if (slot === element) return;
  slot = element;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSubmenuSlot(): HTMLElement | null {
  return useSyncExternalStore(subscribe, () => slot, () => null);
}
