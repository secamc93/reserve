'use client';

/**
 * Buscador de unidad para recibir un paquete: sugiere las primeras 200 unidades activas y,
 * si no aparece, busca en el servidor por número. Muestra "Casa 126", nunca el id.
 */

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { vtInput, vtLabel } from '@/shared/ui/ds';
import { getPropertyUnitsAction } from '@/services/modules/horizontal-properties/units/infrastructure/actions';
import type { PropertyUnit } from '@/services/modules/horizontal-properties/units/domain';
import { unitLabel } from './package-state';

export interface PickedUnit {
  id: number;
  label: string;
}

export function UnitPicker({
  businessId,
  getToken,
  value,
  onChange,
}: {
  businessId: number;
  getToken: () => Promise<string>;
  value: PickedUnit | null;
  onChange: (unit: PickedUnit | null) => void;
}) {
  const inputId = useId();
  const listId = useId();
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [term, setTerm] = useState(value?.label ?? '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => setTerm(value?.label ?? ''), [value]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const res = await getPropertyUnitsAction({ businessId, token, page: 1, pageSize: 200, isActive: true });
        if (!cancelled) setUnits(res.units || []);
      } catch {
        /* sin sugerencias; se puede buscar */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, getToken]);

  const matches = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t || (value && term === value.label)) return units.slice(0, 50);
    return units.filter((u) => unitLabel(u.block, u.number).toLowerCase().includes(t) || u.number.toLowerCase().includes(t)).slice(0, 50);
  }, [units, term, value]);

  // Pocas coincidencias locales: buscar en el servidor por número
  useEffect(() => {
    const t = term.trim();
    if (!open || t.length < 1 || matches.length >= 5 || (value && term === value.label)) return;
    const number = t.replace(/^\D+/, '');
    if (!number) return;
    const timer = setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await getPropertyUnitsAction({ businessId, token, page: 1, pageSize: 50, number, isActive: true });
        setUnits((prev) => Array.from(new Map([...prev, ...(res.units || [])].map((u) => [u.id, u])).values()));
      } catch {
        /* se queda con lo local */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [term, open, matches.length, businessId, getToken, value]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const pick = (u: PropertyUnit) => {
    const picked = { id: u.id, label: unitLabel(u.block, u.number) };
    onChange(picked);
    setTerm(picked.label);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor={inputId} className={vtLabel}>
        Unidad <span aria-hidden="true">*</span>
      </label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        className={vtInput}
        placeholder="Buscar: 126, Casa 126…"
        value={term}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
      />
      {open && (
        <div className="absolute z-[70] w-full mt-1 bg-white border border-[#e4e2dd] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,.12)] max-h-60 overflow-auto">
          {loading && units.length === 0 ? (
            <div className="p-3 text-center text-[13px] text-[#8a8580]">Cargando unidades…</div>
          ) : matches.length === 0 ? (
            <div className="p-3 text-center text-[13px] text-[#8a8580]">No se encontraron unidades</div>
          ) : (
            <ul id={listId} role="listbox" aria-label="Unidades" className="py-1 m-0 list-none p-0">
              {matches.map((u) => (
                <li
                  key={u.id}
                  role="option"
                  aria-selected={value?.id === u.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(u)}
                  className={`px-3 py-2 max-md:py-3 cursor-pointer text-[13px] hover:bg-[#f5f5f4] ${value?.id === u.id ? 'bg-[#f5f5f4] font-semibold' : ''}`}
                >
                  {unitLabel(u.block, u.number)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
