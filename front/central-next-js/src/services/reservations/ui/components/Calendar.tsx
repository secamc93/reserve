'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useReservations } from '../hooks/useReservations';
import { Reservation } from '@/services/reservations/domain/entities/Reservation';
import CreateReservationModal from './CreateReservationModal';
import './Calendar.css';
import MonthNavigation from './MonthNavigation';
import CalendarHeader from './CalendarHeader';

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewType, setViewType] = useState('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null);

    // Estados para los modales de reservas
    const [showReservationsModals, setShowReservationsModals] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [dayReservations, setDayReservations] = useState<Reservation[]>([]);
    
    // Estado para trackear días recientemente actualizados
    const [recentlyUpdatedDays, setRecentlyUpdatedDays] = useState(new Set<string>());

    const {
        reservations,
        loading,
        createReservation,
        updateReservationStatus,
        cancelReservation,
        fetchReservations,
        getReservationsForDate,
        getStatusName,
        getStatusColor,
        getStatusIcon
    } = useReservations();

    useEffect(() => {
        fetchReservations();
    }, [currentDate, fetchReservations]);

    // Funciones para navegación del calendario
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
    };

    // Obtener días del mes
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: Array<{
            date: Date;
            isCurrentMonth: boolean;
            isToday: boolean;
            reservations: Reservation[];
        }> = [];

        // Días del mes anterior para completar la primera semana
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isToday: false,
                reservations: []
            });
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isToday = isDateToday(dayDate);
            const dayReservations = getReservationsForDate(dayDate);

            days.push({
                date: dayDate,
                isCurrentMonth: true,
                isToday,
                reservations: dayReservations
            });
        }

        // Días del siguiente mes para completar la última semana
        const totalCells = Math.ceil(days.length / 7) * 7;
        for (let day = 1; days.length < totalCells; day++) {
            const nextDate = new Date(year, month + 1, day);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
                isToday: false,
                reservations: []
            });
        }

        return days;
    };

    // Verificar si es hoy
    const isDateToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const handleDayClick = (dayData: { date: Date; isCurrentMonth: boolean; isToday: boolean; reservations: Reservation[] }) => {
        if (dayData.isCurrentMonth) {
            setSelectedDate(dayData.date);
            setDayReservations(dayData.reservations);
            setShowReservationsModals(true);
            setSelectedReservation(null);
        }
    };

    const handleSelectReservation = (reservation: Reservation) => {
        setSelectedReservation(reservation);
    };

    const handleConfirmReservation = async (reservationId: number) => {
        const result = await updateReservationStatus(reservationId, 'confirmado');
        if (result.success) {
            // Actualizar la lista de reservas del día
            setDayReservations(prev => 
                prev.map(reservation => 
                    reservation.reserva_id === reservationId 
                        ? { ...reservation, estado_codigo: 'confirmado', estado_nombre: 'Confirmado' }
                        : reservation
                )
            );
            
            // Actualizar la reserva seleccionada
            if (selectedReservation && selectedReservation.reserva_id === reservationId) {
                setSelectedReservation(prev => prev ? { ...prev, estado_codigo: 'confirmado', estado_nombre: 'Confirmado' } : null);
            }
        }
    };

    const handleCancelReservation = async (reservationId: number) => {
        const result = await cancelReservation(reservationId);
        if (result.success) {
            // Actualizar la lista de reservas del día
            setDayReservations(prev => 
                prev.map(reservation => 
                    reservation.reserva_id === reservationId 
                        ? { ...reservation, estado_codigo: 'cancelado', estado_nombre: 'Cancelado' }
                        : reservation
                )
            );
            
            // Actualizar la reserva seleccionada
            if (selectedReservation && selectedReservation.reserva_id === reservationId) {
                setSelectedReservation(prev => prev ? { ...prev, estado_codigo: 'cancelado', estado_nombre: 'Cancelado' } : null);
            }
        }
    };

    const handleCloseReservationsModals = () => {
        setShowReservationsModals(false);
        setSelectedReservation(null);
        setDayReservations([]);
    };

    const handleCreateReservation = (date: Date) => {
        setSelectedDateForCreate(date);
        setShowCreateModal(true);
    };

    const handleSubmitReservation = async (reservationData: any) => {
        const result = await createReservation(reservationData);
        if (result.success) {
            setShowCreateModal(false);
            setSelectedDateForCreate(null);
            
            // Marcar el día específico como actualizado
            const reservationDate = new Date(reservationData.start_at);
            const dayKey = reservationDate.toDateString();
            
            setRecentlyUpdatedDays(prev => new Set([...prev, dayKey]));
            
            // Limpiar el indicador después de 3 segundos
            setTimeout(() => {
                setRecentlyUpdatedDays(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(dayKey);
                    return newSet;
                });
            }, 3000);
            
            console.log(`✅ Nueva reserva creada para ${dayKey} - Día actualizado automáticamente`);
        } else {
            console.error('❌ Error al crear reserva:', result.error);
        }
        return result;
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const days = useMemo(() => getDaysInMonth(currentDate), [currentDate, reservations]);

    if (loading && reservations.length === 0) {
        return (
            <div className="calendario-page">
                <div className="calendario-loading">
                    <div className="loading-spinner">
                        <div className="spinner-large"></div>
                    </div>
                    <p>Cargando calendario...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="calendario-page">
            <CalendarHeader
                total={reservations.length}
                pending={reservations.filter(r => r.estado_codigo === 'pendiente').length}
                confirmed={reservations.filter(r => r.estado_codigo === 'confirmado').length}
            />

            <div className="calendario-controls">
                <MonthNavigation
                    monthLabel={`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                    onPrev={goToPreviousMonth}
                    onNext={goToNextMonth}
                    onToday={goToToday}
                    viewType={viewType as any}
                    onChangeView={(view) => setViewType(view)}
                />
            </div>

            {/* Calendario Grid */}
            <div className="calendario-content">
                <div className="calendar-grid">
                    <div className="calendar-header-row">
                        {dayNames.map(day => (
                            <div key={day} className="day-header">{day}</div>
                        ))}
                    </div>

                    <div className="calendar-body">
                        {days.map((dayData, index) => {
                            const dayKey = dayData.date.toDateString();
                            const isRecentlyUpdated = recentlyUpdatedDays.has(dayKey);
                            
                            return (
                                <div
                                    key={index}
                                    className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${dayData.isToday ? 'today' : ''
                                        } ${selectedDate && selectedDate.toDateString() === dayData.date.toDateString() ? 'selected' : ''} ${isRecentlyUpdated ? 'recently-updated' : ''}`}
                                    onClick={() => handleDayClick(dayData)}
                                >
                                    <div className="day-number">
                                        {dayData.date.getDate()}
                                        {isRecentlyUpdated && <span className="update-indicator">✨</span>}
                                    </div>

                                    <div className="day-reservas">
                                        {dayData.reservations.slice(0, 3).map((reservation, idx) => (
                                            <div
                                                key={idx}
                                                className={`reserva-item ${reservation.estado_codigo}`}
                                                title={`${reservation.cliente_nombre} - ${reservation.start_at ? new Date(reservation.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}`}
                                            >
                                                <span className="reserva-time">
                                                    {reservation.start_at ? new Date(reservation.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                                <span className="reserva-name">{reservation.cliente_nombre}</span>
                                            </div>
                                        ))}

                                        {dayData.reservations.length > 3 && (
                                            <div className="more-reservas">
                                                +{dayData.reservations.length - 3} más
                                            </div>
                                        )}

                                        {dayData.isCurrentMonth && (
                                            <button
                                                className="add-reserva-btn"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation();
                                                    handleCreateReservation(dayData.date);
                                                }}
                                                title="Agregar reserva"
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modales duales para reservas */}
            {showReservationsModals && (
                <div className="dual-modals-overlay">
                    <div className="dual-modals-container">
                        {/* Modal Izquierdo - Lista de Horas */}
                        <div className="modal-left">
                            <div className="modal-header-dual">
                                <h3> Reservas del Día</h3>
                                <span className="date-info">
                                    {selectedDate?.toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </span>
                            </div>

                            <div className="modal-content-dual">
                                <div className="reservas-timeline">
                                    {dayReservations.map((reservation) => (
                                        <div
                                            key={reservation.reserva_id}
                                            className={`timeline-item ${selectedReservation?.reserva_id === reservation.reserva_id ? 'selected' : ''}`}
                                            onClick={() => handleSelectReservation(reservation)}
                                        >
                                            <div className="timeline-time">
                                                {new Date(reservation.start_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="timeline-info">
                                                <div className="timeline-name">{reservation.cliente_nombre}</div>
                                                <div className="timeline-guests">{reservation.number_of_guests} personas</div>
                                                <div className={`timeline-status ${reservation.estado_codigo}`}>
                                                    {reservation.estado_nombre}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Derecho - Detalles de Reserva */}
                        <div className="modal-right">
                            <div className="modal-header-dual">
                                <h3> Detalles de Reserva</h3>
                                <button
                                    className="close-dual-btn"
                                    onClick={handleCloseReservationsModals}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-content-dual">
                                {selectedReservation ? (
                                    <div className="reserva-details-full">
                                        {/* Información del Cliente */}
                                        <div className="detail-section-dual">
                                            <h4>👤 Información del Cliente</h4>

                                            <div className="detail-grid-dual">
                                                <div className="detail-item-dual">
                                                    <span className="label">Nombre:</span>
                                                    <span className="value">
                                                        {selectedReservation.cliente_nombre || 'No especificado'}
                                                    </span>
                                                </div>

                                                <div className="detail-item-dual email-item">
                                                    <span className="label">Email:</span>
                                                    <span className="value">
                                                        {selectedReservation.cliente_email || 'No especificado'}
                                                    </span>
                                                </div>

                                                <div className="detail-item-dual">
                                                    <span className="label">Teléfono:</span>
                                                    <span className="value">
                                                        {selectedReservation.cliente_telefono || 'No especificado'}
                                                    </span>
                                                </div>

                                                {selectedReservation.cliente_dni && (
                                                    <div className="detail-item-dual">
                                                        <span className="label">DNI:</span>
                                                        <span className="value">
                                                            {selectedReservation.cliente_dni}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Información de la Reserva */}
                                        <div className="detail-section-dual">
                                            <h4>📅 Información de la Reserva</h4>
                                            <div className="detail-grid-dual">
                                                <div className="detail-item-dual">
                                                    <span className="label">ID Reserva:</span>
                                                    <span className="value">#{selectedReservation.reserva_id}</span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Fecha:</span>
                                                    <span className="value">
                                                        {new Date(selectedReservation.start_at).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Hora Inicio:</span>
                                                    <span className="value">
                                                        {new Date(selectedReservation.start_at).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Hora Fin:</span>
                                                    <span className="value">
                                                        {new Date(selectedReservation.end_at).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Invitados:</span>
                                                    <span className="value">{selectedReservation.number_of_guests} personas</span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Estado:</span>
                                                    <span className={`status-badge-dual ${selectedReservation.estado_codigo}`}>
                                                        {selectedReservation.estado_nombre}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="actions-section-dual">
                                            <h4>⚡ Acciones</h4>
                                            <div className="actions-buttons-dual">
                                                {selectedReservation.estado_codigo === 'pendiente' && (
                                                    <button
                                                        className="btn-confirm-dual"
                                                        onClick={() => handleConfirmReservation(selectedReservation.reserva_id)}
                                                        disabled={loading}
                                                    >
                                                        ✅ Confirmar Reserva
                                                    </button>
                                                )}

                                                {selectedReservation.estado_codigo !== 'cancelado' && selectedReservation.estado_codigo !== 'completado' && (
                                                    <button
                                                        className="btn-cancel-dual"
                                                        onClick={() => handleCancelReservation(selectedReservation.reserva_id)}
                                                        disabled={loading}
                                                    >
                                                        ❌ Cancelar Reserva
                                                    </button>
                                                )}

                                                {selectedReservation.estado_codigo === 'confirmado' && (
                                                    <button
                                                        className="btn-complete-dual"
                                                        onClick={() => handleConfirmReservation(selectedReservation.reserva_id)}
                                                        disabled={loading}
                                                    >
                                                        🎉 Marcar Completada
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="no-selection">
                                        <p>Selecciona una reserva de la lista para ver los detalles</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de crear reserva */}
            {showCreateModal && (
                <CreateReservationModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedDateForCreate(null);
                    }}
                    onSubmit={handleSubmitReservation}
                    loading={loading}
                    initialDate={selectedDateForCreate}
                />
            )}
        </div>
    );
};

export default Calendar; 