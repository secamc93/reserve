import React, { useState } from 'react';
import { VoteCard } from './vote-card';

export interface ResidentialUnit {
    id: number;
    number: string;
    resident: string;
    propertyUnitId: number;
    residentId: number | null;
    hasVoted: boolean;
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
    showPreviewNote?: boolean;
    showScaleControl?: boolean;
    fillAvailableSpace?: boolean;
    onVoteClick?: (unit: ResidentialUnit) => void;
    onDeleteVoteClick?: (unit: ResidentialUnit) => void;
    showVoteButton?: boolean;
}

export function VotesByUnitSection({
    units,
    onVote,
    onDeleteVote,
    votingActive = false,
    title = 'Unidades y Votos',
    showPreviewNote,
    showScaleControl,
    fillAvailableSpace,
    onVoteClick,
    onDeleteVoteClick,
    showVoteButton = true
}: VotesByUnitSectionProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Usar los callbacks con nombre diferente si están disponibles, sino usar los originales
    const handleVote = onVoteClick || onVote;
    const handleDeleteVote = onDeleteVoteClick || onDeleteVote;

    const filteredUnits = units.filter(unit =>
        unit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.resident.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col ${fillAvailableSpace ? 'h-full' : ''}`}>
            {/* Header con búsqueda */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {filteredUnits.length > 0 && (
                        <span className="text-sm text-gray-600">
                            {filteredUnits.length} {filteredUnits.length === 1 ? 'unidad' : 'unidades'}
                        </span>
                    )}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar unidad o residente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Grid de tarjetas */}
            <div className="overflow-y-auto flex-1 p-4">
                {filteredUnits.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredUnits.map((unit) => (
                            <VoteCard
                                key={unit.id}
                                unit={unit}
                                onVote={showVoteButton ? handleVote : undefined}
                                onDeleteVote={showVoteButton ? handleDeleteVote : undefined}
                                votingActive={votingActive}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">
                            {searchTerm ? 'No se encontraron unidades con ese criterio' : 'No hay unidades disponibles'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
