'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DateRangePickerProps {
    startDate?: string;
    endDate?: string;
    onChange: (startDate: string | undefined, endDate: string | undefined) => void;
    placeholder?: string;
    className?: string;
}

// Helper para formatear fechas
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Helper para convertir Date a string YYYY-MM-DD
const dateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export function DateRangePicker({ 
    startDate, 
    endDate, 
    onChange, 
    placeholder = 'Seleccionar rango de fechas',
    className = '' 
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempStartDate, setTempStartDate] = useState<string>(startDate || '');
    const [tempEndDate, setTempEndDate] = useState<string>(endDate || '');
    const containerRef = useRef<HTMLDivElement>(null);

    // Sincronizar estado temporal cuando se abre
    useEffect(() => {
        if (isOpen) {
            setTempStartDate(startDate || '');
            setTempEndDate(endDate || '');
        }
    }, [isOpen, startDate, endDate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleApply = () => {
        onChange(
            tempStartDate || undefined,
            tempEndDate || undefined
        );
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempStartDate('');
        setTempEndDate('');
        onChange(undefined, undefined);
        setIsOpen(false);
    };

    const getDisplayText = () => {
        if (startDate && endDate) {
            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        } else if (startDate) {
            return `Desde: ${formatDate(startDate)}`;
        } else if (endDate) {
            return `Hasta: ${formatDate(endDate)}`;
        }
        return '';
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={getDisplayText()}
                    placeholder={placeholder}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500 bg-white cursor-pointer"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                {(startDate || endDate) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        type="button"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-[320px]">
                    <div className="space-y-4">
                        {/* Fecha inicio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={tempStartDate}
                                onChange={(e) => setTempStartDate(e.target.value)}
                                max={tempEndDate || undefined}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>

                        {/* Fecha fin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={tempEndDate}
                                onChange={(e) => setTempEndDate(e.target.value)}
                                min={tempStartDate || undefined}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <button
                                onClick={handleClear}
                                className="flex-1 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors font-medium border border-gray-300"
                                type="button"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium shadow-sm"
                                type="button"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

