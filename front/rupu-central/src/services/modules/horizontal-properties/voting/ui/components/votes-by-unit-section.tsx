/**
 * Componente: Unidades y votos (rediseño, opción 1a)
 * Filtros (Todas / Pendientes / Sin asistencia), buscador de unidad y fichas
 * agrupadas por torre coloreadas por el voto.
 */

import React, { useMemo, useState } from 'react';
import { VoteCard } from './vote-card';
import { VT, vtMono, getTowerName, getUnitShortLabel } from '../design';

export interface ResidentialUnit {
    id: number;
    number: string;
    resident: string;
    propertyUnitId: number;
    residentId: number | null;
    hasVoted: boolean;
    hasAttendance?: boolean; // Indica si la unidad tiene asistencia marcada (undefined = no aplica)
    votedOption?: string;
    votedOptionId?: number;
    votedOptionColor?: string;
    participationCoefficient: number;
}

interface VotesByUnitSectionProps {
    units: ResidentialUnit[];
    onVote?: (unit: ResidentialUnit) => void;
    onDeleteVote?: (unit: ResidentialUnit) => void;
    votingActive?: boolean;
    title?: string;
    /** @deprecated Se conserva por compatibilidad; ya no tiene efecto visual. */
    showPreviewNote?: boolean;
    /** @deprecated Se conserva por compatibilidad; ya no tiene efecto visual. */
    showScaleControl?: boolean;
    fillAvailableSpace?: boolean;
    onVoteClick?: (unit: ResidentialUnit) => void;
    onDeleteVoteClick?: (unit: ResidentialUnit) => void;
    showVoteButton?: boolean;
    /** Resolución de color por texto de opción (paleta compartida con el resumen). */
    resolveColor?: (optionText?: string, fallbackColor?: string) => string;
}

type UnitFilter = 'all' | 'pending' | 'no-attendance';

const SINGLE_GROUP = 'Unidades';

const byUnitNumber = (a: ResidentialUnit, b: ResidentialUnit) =>
    a.number.localeCompare(b.number, undefined, { numeric: true, sensitivity: 'base' });

export function VotesByUnitSection({
    units,
    onVote,
    onDeleteVote,
    votingActive = false,
    title,
    fillAvailableSpace,
    onVoteClick,
    onDeleteVoteClick,
    showVoteButton = true,
    resolveColor,
}: VotesByUnitSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<UnitFilter>('all');

    // Usar los callbacks con nombre diferente si están disponibles, sino usar los originales
    const handleVote = onVoteClick || onVote;
    const handleDeleteVote = onDeleteVoteClick || onDeleteVote;

    const tracksAttendance = units.some((u) => typeof u.hasAttendance === 'boolean');
    const pendingCount = units.filter((u) => !u.hasVoted).length;
    const noAttendanceCount = units.filter((u) => !u.hasVoted && u.hasAttendance === false).length;

    const filteredUnits = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return units.filter((unit) => {
            if (filter === 'pending' && unit.hasVoted) return false;
            if (filter === 'no-attendance' && (unit.hasVoted || unit.hasAttendance !== false)) return false;
            if (!term) return true;
            return unit.number.toLowerCase().includes(term) || unit.resident.toLowerCase().includes(term);
        });
    }, [units, filter, searchTerm]);

    // Agrupar por torre (inferida del número de unidad). Los totales de cada torre
    // se calculan sobre todas las unidades, no solo las filtradas.
    const towers = useMemo(() => {
        const towerOf = new Map<number, string>();
        units.forEach((u) => towerOf.set(u.id, getTowerName(u.number) ?? SINGLE_GROUP));
        const distinct = new Set(towerOf.values());
        const grouped = distinct.size > 1;

        const totals = new Map<string, { total: number; voted: number }>();
        units.forEach((u) => {
            const key = grouped ? towerOf.get(u.id)! : SINGLE_GROUP;
            const t = totals.get(key) ?? { total: 0, voted: 0 };
            t.total += 1;
            if (u.hasVoted) t.voted += 1;
            totals.set(key, t);
        });

        const groups = new Map<string, ResidentialUnit[]>();
        filteredUnits.forEach((u) => {
            const key = grouped ? towerOf.get(u.id)! : SINGLE_GROUP;
            const list = groups.get(key) ?? [];
            list.push(u);
            groups.set(key, list);
        });

        return Array.from(groups.entries())
            .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
            .map(([name, list]) => ({
                name,
                grouped,
                units: [...list].sort(byUnitNumber),
                total: totals.get(name)?.total ?? list.length,
                voted: totals.get(name)?.voted ?? 0,
            }));
    }, [units, filteredUnits]);

    const filters: { key: UnitFilter; label: string; count: number; hidden?: boolean }[] = [
        { key: 'all', label: 'Todas', count: units.length },
        { key: 'pending', label: 'Pendientes', count: pendingCount },
        { key: 'no-attendance', label: 'Sin asistencia', count: noAttendanceCount, hidden: !tracksAttendance },
    ];

    return (
        <div className={`flex flex-col gap-3.5 min-h-0 ${fillAvailableSpace ? 'h-full' : ''}`}>
            {title && (
                <h3 className="text-[13px] font-semibold" style={{ color: VT.ink }}>{title}</h3>
            )}

            {/* Filtros + buscador */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar unidades">
                    {filters.filter((f) => !f.hidden).map((f) => {
                        const active = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setFilter(f.key)}
                                className="px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors"
                                style={active ? { background: VT.ink, color: '#fff' } : { color: VT.inkSoft }}
                            >
                                {f.label} · {f.count}
                            </button>
                        );
                    })}
                </div>
                <label
                    className="flex items-center gap-2 h-[30px] px-2.5 rounded-md bg-white text-xs w-full sm:w-[220px] focus-within:ring-1 focus-within:ring-[#c8603f]"
                    style={{ border: `1px solid ${VT.borderStrong}`, color: VT.muted }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar unidad"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent outline-none text-xs"
                        style={{ color: VT.ink }}
                        aria-label="Buscar unidad o residente"
                    />
                </label>
            </div>

            {/* Fichas agrupadas por torre */}
            <div className={fillAvailableSpace ? 'flex-1 min-h-0 overflow-y-auto pr-1' : ''}>
                {towers.length > 0 ? (
                    <div className={`grid gap-5 ${towers.length > 1 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                        {towers.map((tower) => (
                            <div key={tower.name} className="flex flex-col gap-2 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[13px] font-semibold" style={{ color: VT.ink }}>{tower.name}</span>
                                    <span className={`${vtMono} text-[11px] font-medium`} style={{ color: VT.muted }}>
                                        {tower.voted}/{tower.total}
                                    </span>
                                </div>
                                <div
                                    className="grid gap-1.5"
                                    style={{
                                        gridTemplateColumns: towers.length > 1
                                            ? 'repeat(auto-fill, minmax(52px, 1fr))'
                                            : 'repeat(auto-fill, minmax(64px, 1fr))',
                                    }}
                                >
                                    {tower.units.map((unit) => (
                                        <VoteCard
                                            key={unit.id}
                                            unit={unit}
                                            label={tower.grouped ? getUnitShortLabel(unit.number, tower.name) : unit.number}
                                            onVote={showVoteButton ? handleVote : undefined}
                                            onDeleteVote={showVoteButton ? handleDeleteVote : undefined}
                                            votingActive={votingActive}
                                            resolveColor={resolveColor}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm" style={{ color: VT.muted }}>
                            {searchTerm || filter !== 'all'
                                ? 'No hay unidades con ese criterio'
                                : 'No hay unidades disponibles'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
