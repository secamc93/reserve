/**
 * Selector de unidad con búsqueda por número (combobox accesible). Muestra "Casa 126",
 * nunca el id. Consulta el listado de unidades del módulo (server action existente).
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { dsMono, vtInput, vtLabel } from '@shared/ui/ds';
import { getPropertyUnitsAction } from '../../units/infrastructure/actions';
import { formatUnitLabel } from '../../units/domain';

export interface UnitOption {
  id: number;
  label: string;
  /** Residentes actuales de la unidad. */
  residentsCount?: number;
}

export function UnitPicker({
  businessId,
  value,
  label,
  onChange,
  error,
  disabled,
}: {
  businessId: number;
  /** Unidad elegida (id 0 = ninguna). */
  value: UnitOption;
  label?: string;
  onChange: (option: UnitOption) => void;
  error?: string;
  disabled?: boolean;
}) {
  const inputId = useId();
  const listId = useId();
  const [term, setTerm] = useState(value.label);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<UnitOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const requestRef = useRef(0);

  useEffect(() => {
    setTerm(value.label);
  }, [value.label]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const id = ++requestRef.current;
      setLoading(true);
      try {
        const token = TokenStorage.getBusinessToken();
        if (!token) return;
        // El usuario puede escribir "Casa 126": se busca por la última palabra (el número).
        const q = term.trim().split(/\s+/).pop() ?? '';
        const data = await getPropertyUnitsAction({ businessId, token, page: 1, pageSize: 20, number: q || undefined });
        if (id !== requestRef.current) return;
        setOptions(data.units.map((u) => ({ id: u.id, label: formatUnitLabel(u.number, u.block), residentsCount: u.residentsCount ?? 0 })));
        setHighlight(0);
      } catch {
        if (id === requestRef.current) setOptions([]);
      } finally {
        if (id === requestRef.current) setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [term, open, businessId]);

  const choose = (option: UnitOption) => {
    onChange(option);
    setTerm(option.label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label htmlFor={inputId} className={vtLabel}>{label ?? 'Unidad *'}</label>
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={Boolean(error)}
        autoComplete="off"
        disabled={disabled}
        className={`${vtInput} ${dsMono}`}
        placeholder="Buscar por número (126)"
        value={term}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
          if (value.id) onChange({ id: 0, label: '' });
        }}
        onKeyDown={(e) => {
          if (!open || options.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, options.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            choose(options[highlight]);
          }
        }}
      />
      {error ? (
        <p className="text-xs mt-1 text-[#c8382d]">{error}</p>
      ) : (
        value.id > 0 &&
        value.residentsCount !== undefined && (
          <p className="text-xs mt-1 text-[#8a8580]">
            {value.residentsCount} residente{value.residentsCount === 1 ? '' : 's'} actual{value.residentsCount === 1 ? '' : 'es'}
          </p>
        )
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Unidades"
          className="absolute z-10 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-lg bg-white border border-[#e4e2dd] shadow-[0_8px_24px_rgba(0,0,0,.12)] py-1"
        >
          {loading && <li className="px-3 py-2 text-xs text-[#8a8580]">Buscando…</li>}
          {!loading && options.length === 0 && <li className="px-3 py-2 text-xs text-[#8a8580]">Sin coincidencias</li>}
          {!loading &&
            options.map((o, i) => (
              <li
                key={o.id}
                role="option"
                aria-selected={o.id === value.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(o);
                }}
                className={`px-3 py-2 max-md:py-3 text-[13px] cursor-pointer ${i === highlight ? 'bg-[#f5f5f4]' : ''}`}
              >
                <span className={dsMono}>{o.label}</span>
                {o.residentsCount !== undefined && <span className="ml-2 text-[11px] text-[#8a8580]">{o.residentsCount} residente{o.residentsCount === 1 ? '' : 's'}</span>}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
