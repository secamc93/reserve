'use client';

import React from 'react';
import './MonthNavigation.css';

export type ViewType = 'month' | 'week';

interface MonthNavigationProps {
    monthLabel: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    viewType: ViewType;
    onChangeView: (view: ViewType) => void;
}

const MonthNavigation: React.FC<MonthNavigationProps> = ({
    monthLabel,
    onPrev,
    onNext,
    onToday,
    viewType,
    onChangeView,
}) => {
    return (
        <div className="month-nav">
            <div className="nav-left">
                <button onClick={onPrev}>‹</button>
                <h2>{monthLabel}</h2>
                <button onClick={onNext}>›</button>
            </div>

            <div className="nav-right">
                <button className="btn-today" onClick={onToday}>Hoy</button>
                <div className="view-selector">
                    <button
                        className={viewType === 'month' ? 'active' : ''}
                        onClick={() => onChangeView('month')}
                    >
                        Mes
                    </button>
                    <button
                        className={viewType === 'week' ? 'active' : ''}
                        onClick={() => onChangeView('week')}
                    >
                        Semana
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthNavigation; 