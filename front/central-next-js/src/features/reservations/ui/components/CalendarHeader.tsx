import React from 'react';
import './CalendarHeader.css';

interface CalendarHeaderProps {
    title?: string;
    subtitle?: string;
    total: number;
    pending: number;
    confirmed: number;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    title = '📅 Calendario de Reservas',
    subtitle = 'Gestiona las reservas de forma visual por fechas',
    total,
    pending,
    confirmed,
}) => {
    return (
        <div className="calendar-header">
            <div className="title-section">
                <h1 className="calendar-title">{title}</h1>
                <p className="calendar-subtitle">{subtitle}</p>
            </div>
            <div className="calendar-stats">
                <div className="stat-item">
                    <span className="stat-number">{total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{pending}</span>
                    <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{confirmed}</span>
                    <span className="stat-label">Confirmadas</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarHeader; 