/**
 * Hook: resultados públicos en vivo (para las vistas 1g y 1h del rediseño).
 *
 * Carga opciones y unidades con las Server Actions públicas existentes y
 * recibe los votos por el SSE público (usePublicVotingSSE). Solo agrega el
 * cálculo por coeficiente; no cambia contratos ni endpoints.
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getPublicVotingOptionsAction,
  getUnitsWithResidentsAction,
} from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import { usePublicVotingSSE } from './use-public-voting-sse';
import type { ResidentialUnit } from '../../components';
import {
  buildOptionPalette,
  computeCoefficientResults,
  resolveQuorum,
  type CoefficientResults,
  type OptionPalette,
  type PaletteOption,
} from '../../design';

interface PublicOption {
  id: number;
  option_text: string;
  option_code: string;
  color?: string;
}

interface PublicUnit {
  property_unit_id: number;
  property_unit_number: string;
  resident_id: number | null;
  resident_name: string | null;
  participation_coefficient?: number;
}

/** Datos de la votación que el endpoint voting-info devuelve junto a las opciones. */
export interface PublicVotingMeta {
  id?: number;
  title?: string;
  description?: string;
  display_order?: number;
  required_percentage?: number;
}

export interface PublicVotingResults {
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  options: PublicOption[];
  meta: PublicVotingMeta | null;
  quorum: number;
  palette: OptionPalette;
  results: CoefficientResults;
  residentialUnits: ResidentialUnit[];
}

export function usePublicVotingResults(votingAuthToken: string, enabled: boolean = true): PublicVotingResults {
  const [options, setOptions] = useState<PublicOption[]>([]);
  const [units, setUnits] = useState<PublicUnit[]>([]);
  const [meta, setMeta] = useState<PublicVotingMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SSE público (incluye precarga inicial de votos)
  const { votes: sseVotes, isConnected } = usePublicVotingSSE(votingAuthToken, enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        // Cargar solo opciones y unidades (los votos vienen del SSE)
        const [optionsResult, unitsResult] = await Promise.all([
          getPublicVotingOptionsAction({ publicToken: votingAuthToken }),
          getUnitsWithResidentsAction({ publicToken: votingAuthToken }),
        ]);
        if (cancelled) return;

        if (optionsResult.success && optionsResult.data) {
          setOptions(optionsResult.data.options || []);
          // voting-info también devuelve la votación (título, quórum); se lee si viene.
          const withVoting = optionsResult.data as { voting?: PublicVotingMeta };
          setMeta(withVoting.voting ?? null);
        }
        if (unitsResult.success && unitsResult.data) {
          setUnits(unitsResult.data as PublicUnit[]);
        }
      } catch (err) {
        console.error('❌ [PROGRESS] Error cargando progreso:', err);
        if (!cancelled) setError('Error al cargar el progreso de votación');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [votingAuthToken, enabled]);

  return useMemo(() => {
    // Coeficiente por defecto igual para todas las unidades si el endpoint no lo trae
    const defaultCoefficient = units.length > 0 ? 100 / units.length : 1;
    const coefOf = (u: PublicUnit) => u.participation_coefficient || defaultCoefficient;

    const paletteOptions: PaletteOption[] = options.map((o) => ({
      id: o.id,
      text: o.option_text,
      code: o.option_code,
      color: o.color,
    }));
    const palette = buildOptionPalette(paletteOptions);

    const voteByUnit = new Map(sseVotes.map((v) => [v.property_unit_id, v]));

    const results = computeCoefficientResults(
      paletteOptions,
      units.map((u) => {
        const vote = voteByUnit.get(u.property_unit_id);
        return { hasVoted: !!vote, coef: coefOf(u), optionId: vote?.voting_option_id ?? null };
      })
    );

    const residentialUnits: ResidentialUnit[] = units.map((u, index) => {
      const vote = voteByUnit.get(u.property_unit_id);
      const option = vote ? options.find((o) => o.id === vote.voting_option_id) : undefined;
      const text = option?.option_text || (vote?.option_text && vote.option_text !== 'undefined' ? vote.option_text : undefined);
      return {
        id: index + 1,
        number: u.property_unit_number,
        resident: u.resident_name || 'Sin residente',
        propertyUnitId: u.property_unit_id,
        residentId: null,
        hasVoted: !!vote,
        votedOption: text,
        votedOptionId: vote?.voting_option_id,
        votedOptionColor: (vote ? palette.byId(vote.voting_option_id) : undefined) || option?.color || vote?.option_color,
        participationCoefficient: coefOf(u),
      };
    });

    return {
      loading,
      error,
      isConnected,
      options,
      meta,
      quorum: resolveQuorum(meta?.required_percentage),
      palette,
      results,
      residentialUnits,
    };
  }, [options, units, meta, sseVotes, loading, error, isConnected]);
}
