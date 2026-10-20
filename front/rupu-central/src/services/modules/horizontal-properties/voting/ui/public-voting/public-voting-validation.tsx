/**
 * R1 · Identificación del residente desde el QR.
 * Si el grupo exige documento (`require_document_validation`), unidad + documento; si no, basta
 * la unidad. Si el back responde que el documento es requerido (p. ej. se activó después de
 * abrir esta pantalla), aparece el campo. Si el grupo tiene contraseñas generadas
 * (`require_password`), pide además la contraseña de la credencial impresa de la unidad.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Spinner } from '@shared/ui';
import {
  getPropertyUnitsForPublicVotingAction,
  validateResidentAction,
} from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import {
  VT,
  VtIcon,
  VtNotice,
  identificationError,
  normalizePassword,
  requiresDocument,
  requiresPassword,
  unitFloor,
  validateResidentFailure,
  validateResidentPayload,
  votingFontRoot,
  vtMono,
} from '../design';

interface PropertyUnit {
  id: number;
  number: string;
}

interface ResidentData {
  id: number;
  name: string;
  unitNumber: string;
  votingId: number;
  businessId: number;
  groupId?: number;
}

interface VotingContextData {
  property: { id: number; name: string; address: string };
  voting?: { id: number; title: string; description: string } | null;
  voting_group?: { id: number; name: string; description: string; require_document_validation?: boolean } | null;
  is_group_token?: boolean;
  require_document_validation?: boolean;
  require_password?: boolean;
}

interface PublicVotingValidationProps {
  publicToken: string;
  votingContext: VotingContextData;
  onSuccess: (authToken: string, resident: ResidentData) => void;
  onError: (error: string) => void;
}

export function PublicVotingValidation({ publicToken, votingContext, onSuccess, onError }: PublicVotingValidationProps) {
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<PropertyUnit | null>(null);
  const [dni, setDni] = useState('');
  const [requireDocument, setRequireDocument] = useState(() => requiresDocument(votingContext));
  const dniRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [requirePassword, setRequirePassword] = useState(() => requiresPassword(votingContext));
  const passwordRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getPropertyUnitsForPublicVotingAction({ publicToken });
        if (!result.success || !result.data) throw new Error(result.error || 'Error al cargar unidades');
        if (!cancelled) setUnits(result.data.units || []);
      } catch {
        if (!cancelled) onErrorRef.current('Error al cargar las unidades de la propiedad');
      } finally {
        if (!cancelled) setLoadingUnits(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicToken]);

  const matches = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q || selected) return [];
    return units
      .filter((u) => u.number.toLowerCase().includes(q))
      .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))
      .slice(0, 8);
  }, [units, term, selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const localError = identificationError({ hasUnit: !!selected, dni, requireDocument, password, requirePassword });
    if (localError || !selected) {
      setError(localError);
      if (selected && requireDocument && !dni.trim()) dniRef.current?.focus();
      else if (selected && requirePassword) passwordRef.current?.focus();
      return;
    }
    const payload = validateResidentPayload({ propertyUnitId: selected.id, dni, requireDocument, password, requirePassword });
    setSubmitting(true);
    try {
      const result = await validateResidentAction({ publicToken, ...payload });
      if (result.success && result.data) {
        const { voting_auth_token, resident_id, resident_name, property_unit_number, voting_id, hp_id, voting_group_id, group_id } = result.data;
        onSuccess(voting_auth_token, {
          id: resident_id,
          // Sin residentes registrados el back responde "Unidad <número>".
          name: resident_name,
          unitNumber: property_unit_number,
          votingId: voting_id ?? 0,
          businessId: hp_id,
          groupId: voting_group_id ?? group_id,
        });
      } else {
        const failure = validateResidentFailure(result.status, result.message || result.error, !!payload.dni);
        setError(failure.message);
        if (failure.requireDocument && !requireDocument) {
          setRequireDocument(true);
          setTimeout(() => dniRef.current?.focus(), 0);
        }
        if (failure.requirePassword) {
          setRequirePassword(true);
          setTimeout(() => passwordRef.current?.focus(), 0);
        }
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const title = votingContext.voting_group?.name || votingContext.voting?.title || 'Votación';
  const how = requireDocument ? 'Identifícate' : 'Elige tu unidad';
  const intro = votingContext.voting
    ? `${how} para votar en «${votingContext.voting.title}».`
    : `${how} una vez para votar en todos los puntos de la asamblea.`;

  return (
    <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <form onSubmit={handleSubmit} className="max-w-[480px] mx-auto min-h-screen flex flex-col p-[22px]" noValidate>
        <div className={`${vtMono} text-[11px] font-medium tracking-[.06em] uppercase`} style={{ color: VT.muted }}>
          {votingContext.property.name}
        </div>
        <h1 className="mt-3.5 mb-0 text-2xl leading-tight font-semibold tracking-[-.02em]">{title}</h1>
        <p className="mt-2 mb-0 text-sm leading-normal" style={{ color: VT.inkSoft }}>{intro}</p>

        <div className="mt-[26px] flex flex-col gap-3.5">
          <div>
            <label htmlFor="r1-unit" className="block text-xs font-semibold mb-1.5">Tu unidad</label>
            <div className="relative">
              <input
                id="r1-unit"
                type="text"
                autoComplete="off"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value);
                  setSelected(null);
                }}
                placeholder={loadingUnits ? 'Cargando unidades…' : 'Ej. 126'}
                disabled={loadingUnits}
                className={`${vtMono} w-full h-[52px] rounded-2xl bg-white px-3.5 pr-11 text-base font-medium outline-none`}
                style={{ border: `1px solid ${term ? VT.ink : VT.borderStrong}` }}
                role="combobox"
                aria-expanded={matches.length > 0}
                aria-controls="r1-unit-list"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: VT.muted }}>
                {loadingUnits ? <Spinner size="sm" /> : <VtIcon name="search" size={16} />}
              </span>
            </div>
            {matches.length > 0 && (
              <div
                id="r1-unit-list"
                role="listbox"
                aria-label="Unidades"
                className="mt-1.5 rounded-2xl bg-white overflow-hidden"
                style={{ border: `1px solid ${VT.border}` }}
              >
                {matches.map((unit) => {
                  const floor = unitFloor(unit.number);
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      role="option"
                      aria-selected={false}
                      onClick={() => {
                        setSelected(unit);
                        setTerm(unit.number);
                      }}
                      className="w-full flex justify-between items-center px-3.5 py-3 text-[15px] text-left hover:bg-[#f5f5f4]"
                      style={{ borderBottom: `1px solid #efedea` }}
                    >
                      <span className={vtMono}>{unit.number}</span>
                      {floor && <span className="text-xs" style={{ color: VT.muted }}>piso {floor}</span>}
                    </button>
                  );
                })}
              </div>
            )}
            {term && !selected && !loadingUnits && matches.length === 0 && (
              <p className="mt-1.5 mb-0 text-xs" style={{ color: VT.muted }}>No encontramos una unidad con «{term}».</p>
            )}
          </div>
          {requireDocument && (
          <div>
            <label htmlFor="r1-dni" className="block text-xs font-semibold mb-1.5">Documento de identidad</label>
            <input
              ref={dniRef}
              id="r1-dni"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/[.\s]/g, ''))}
              placeholder="Número sin puntos"
              className="w-full h-[52px] rounded-2xl bg-white px-3.5 text-base outline-none focus:border-[#1a1a1a]"
              style={{ border: `1px solid ${VT.borderStrong}` }}
              aria-required="true"
            />
          </div>
          )}
          {requirePassword && (
          <div>
            <label htmlFor="r1-password" className="block text-xs font-semibold mb-1.5">Contraseña de votación</label>
            <input
              ref={passwordRef}
              id="r1-password"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={password}
              onChange={(e) => setPassword(normalizePassword(e.target.value))}
              placeholder="La de tu credencial impresa"
              maxLength={20}
              className={`${vtMono} w-full h-[52px] rounded-2xl bg-white px-3.5 text-base tracking-[.2em] outline-none focus:border-[#1a1a1a]`}
              style={{ border: `1px solid ${VT.borderStrong}` }}
              aria-required="true"
            />
          </div>
          )}
          {error && <VtNotice>{error}</VtNotice>}
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-2.5">
          <button
            type="submit"
            disabled={submitting || loadingUnits}
            className="h-[52px] rounded-full text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: VT.brand }}
          >
            {submitting ? 'Validando…' : 'Continuar'}
          </button>
          <p className="m-0 text-center text-xs leading-snug" style={{ color: VT.muted }}>
            {requirePassword
              ? 'La contraseña es la que te entregaron en la mesa de registro, junto con este código QR.'
              : requireDocument
                ? 'Solo residentes registrados. El documento debe coincidir con el de la unidad.'
                : 'Solo unidades registradas en la propiedad.'}
          </p>
        </div>
      </form>
    </div>
  );
}
