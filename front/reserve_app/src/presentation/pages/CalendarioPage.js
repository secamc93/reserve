import React, { useState, useEffect } from 'react';
import { useReservas } from '../hooks/useReservas.js';
import CreateReservaModal from '../components/Reserva/CreateReservaModal';
import './CalendarioPage.css';

const CalendarioPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewType, setViewType] = useState('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedDateForCreate, setSelectedDateForCreate] = useState(null);

    // 🔧 NUEVO: Estados para los modales de reservas
    const [showReservasModals, setShowReservasModals] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [dayReservas, setDayReservas] = useState([]);

    const {
        reservas,
        loading,
        createReserva,
        updateReservaStatus,
        cancelReserva,
        fetchReservas
    } = useReservas();

    useEffect(() => {
        fetchReservas();
    }, [currentDate, fetchReservas]);

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
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Días del mes anterior para completar la primera semana
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(year, month, -i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                isToday: false,
                reservas: []
            });
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const isToday = isDateToday(dayDate);
            const dayReservas = getReservasForDate(dayDate);

            days.push({
                date: dayDate,
                isCurrentMonth: true,
                isToday,
                reservas: dayReservas
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
                reservas: []
            });
        }

        return days;
    };

    // Verificar si es hoy
    const isDateToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Obtener reservas para una fecha específica
    const getReservasForDate = (date) => {
        return reservas.filter(reserva => {
            const reservaDate = new Date(reserva.start_at);
            return reservaDate.toDateString() === date.toDateString();
        });
    };

    // 🔧 MODIFICADO: Manejar click en día con reservas
    const handleDayClick = (dayData) => {
        setSelectedDate(dayData.date);

        // Si el día tiene reservas, abrir los modales duales
        if (dayData.reservas.length > 0) {
            setDayReservas(dayData.reservas);
            setSelectedReserva(dayData.reservas[0]); // Seleccionar la primera por defecto
            setShowReservasModals(true);
        }
    };

    // 🔧 NUEVO: Manejar selección de reserva en modal izquierdo
    const handleSelectReserva = (reserva) => {
        setSelectedReserva(reserva);
    };

    // 🔧 NUEVO: Manejar confirmar reserva
    const handleConfirmarReserva = async (reservaId) => {
        const result = await updateReservaStatus(reservaId, 'confirmado');
        if (result.success) {
            // Actualizar la reserva seleccionada y la lista
            const updatedReservas = dayReservas.map(r =>
                r.reserva_id === reservaId
                    ? { ...r, estado_codigo: 'confirmado', estado_nombre: 'Confirmado' }
                    : r
            );
            setDayReservas(updatedReservas);

            if (selectedReserva.reserva_id === reservaId) {
                setSelectedReserva({
                    ...selectedReserva,
                    estado_codigo: 'confirmado',
                    estado_nombre: 'Confirmado'
                });
            }

            // Recargar datos
            await fetchReservas();
        }
        return result;
    };

    // 🔧 NUEVO: Manejar cancelar reserva
    const handleCancelarReserva = async (reservaId) => {
        const result = await cancelReserva(reservaId);
        if (result.success) {
            // Remover la reserva de la lista o marcarla como cancelada
            const updatedReservas = dayReservas.map(r =>
                r.reserva_id === reservaId
                    ? { ...r, estado_codigo: 'cancelado', estado_nombre: 'Cancelado' }
                    : r
            );
            setDayReservas(updatedReservas);

            if (selectedReserva.reserva_id === reservaId) {
                setSelectedReserva({
                    ...selectedReserva,
                    estado_codigo: 'cancelado',
                    estado_nombre: 'Cancelado'
                });
            }

            // Recargar datos
            await fetchReservas();
        }
        return result;
    };

    // 🔧 NUEVO: Cerrar modales duales
    const handleCloseReservasModals = () => {
        setShowReservasModals(false);
        setSelectedReserva(null);
        setDayReservas([]);
    };

    // Manejar creación de reserva
    const handleCreateReserva = (date) => {
        const dateTime = new Date(date);
        dateTime.setHours(19, 0, 0, 0); // Default a las 7 PM
        setSelectedDateForCreate(dateTime.toISOString().slice(0, 16));
        setShowCreateModal(true);
    };

    const handleSubmitReserva = async (reservaData) => {
        const result = await createReserva(reservaData);
        if (result.success) {
            setShowCreateModal(false);
            setSelectedDateForCreate(null);
            // Recargar datos
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
        return result;
    };

    const days = getDaysInMonth(currentDate);
    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    if (loading && reservas.length === 0) {
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
            {/* Header del calendario */}
            <header className="header2">
                <div className="header2-content">
                    <div className="header2-left">
                        <h1>📅 Calendario de Reservas</h1>
                        <p>Gestiona las reservas de forma visual por fechas</p>
                    </div>
                    <div className="header2-actions">
                        <button className="btn2-today" onClick={goToToday}>
                            Hoy
                        </button>
                        <div className="view2-selector">
                            <button
                                className={`btn2-view ${viewType === 'month' ? 'active' : ''}`}
                                onClick={() => setViewType('month')}
                            >
                                Mes
                            </button>
                            <button
                                className={`btn2-view ${viewType === 'week' ? 'active' : ''}`}
                                onClick={() => setViewType('week')}
                            >
                                Semana
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Controles de navegación */}
            <div className="calendario-controls">
                <div className="nav-controls">
                    <button className="btn-nav" onClick={goToPreviousMonth}>‹</button>
                    <h2 className="current-month">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button className="btn-nav" onClick={goToNextMonth}>›</button>
                </div>

                <div className="calendar-stats">
                    <div className="stat-item">
                        <span className="stat-number">{reservas.length}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {reservas.filter(r => r.isPendiente()).length}
                        </span>
                        <span className="stat-label">Pendientes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">
                            {reservas.filter(r => r.isConfirmado()).length}
                        </span>
                        <span className="stat-label">Confirmadas</span>
                    </div>
                </div>
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
                        {days.map((dayData, index) => (
                            <div
                                key={index}
                                className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${dayData.isToday ? 'today' : ''
                                    } ${selectedDate && selectedDate.toDateString() === dayData.date.toDateString() ? 'selected' : ''}`}
                                onClick={() => handleDayClick(dayData)}
                            >
                                <div className="day-number">{dayData.date.getDate()}</div>

                                <div className="day-reservas">
                                    {dayData.reservas.slice(0, 3).map((reserva, idx) => (
                                        <div
                                            key={idx}
                                            className={`reserva-item ${reserva.estado_codigo}`}
                                            title={`${reserva.name} - ${reserva.start_at ? new Date(reserva.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}`}
                                        >
                                            <span className="reserva-time">
                                                {reserva.start_at ? new Date(reserva.start_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                            <span className="reserva-name">{reserva.name}</span>
                                        </div>
                                    ))}

                                    {dayData.reservas.length > 3 && (
                                        <div className="more-reservas">
                                            +{dayData.reservas.length - 3} más
                                        </div>
                                    )}

                                    {dayData.isCurrentMonth && (
                                        <button
                                            className="add-reserva-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCreateReserva(dayData.date);
                                            }}
                                            title="Agregar reserva"
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 🔧 NUEVO: Modales duales para reservas */}
            {showReservasModals && (
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
                                    {dayReservas.map((reserva) => (
                                        <div
                                            key={reserva.reserva_id}
                                            className={`timeline-item ${selectedReserva?.reserva_id === reserva.reserva_id ? 'selected' : ''}`}
                                            onClick={() => handleSelectReserva(reserva)}
                                        >
                                            <div className="timeline-time">
                                                {new Date(reserva.start_at).toLocaleTimeString('es-ES', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="timeline-info">
                                                <div className="timeline-name">{reserva.name}</div>
                                                <div className="timeline-guests">{reserva.number_of_guests} personas</div>
                                                <div className={`timeline-status ${reserva.estado_codigo}`}>
                                                    {reserva.estado_nombre}
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
                                    onClick={handleCloseReservasModals}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-content-dual">
                                {selectedReserva ? (
                                    <div className="reserva-details-full">
                                        {/* Información del Cliente */}
                                        <div className="detail-section-dual">
                                            <h4>👤 Información del Cliente</h4>

                                            <div className="detail-grid-dual">
                                                <div className="detail-item-dual">
                                                    <span className="label">Nombre:</span>
                                                    <span className="value">
                                                        {selectedReserva.cliente_nombre || selectedReserva.name || 'No especificado'}
                                                    </span>
                                                </div>

                                                <div className="detail-item-dual email-item">
                                                    <span className="label">Email:</span>
                                                    <span className="value">
                                                        {selectedReserva.cliente_email || selectedReserva.email || 'No especificado'}
                                                    </span>
                                                </div>

                                                <div className="detail-item-dual">
                                                    <span className="label">Teléfono:</span>
                                                    <span className="value">
                                                        {selectedReserva.cliente_telefono || selectedReserva.phone || 'No especificado'}
                                                    </span>
                                                </div>

                                                {(selectedReserva.cliente_dni || selectedReserva.dni) && (
                                                    <div className="detail-item-dual">
                                                        <span className="label">DNI:</span>
                                                        <span className="value">
                                                            {selectedReserva.cliente_dni || selectedReserva.dni}
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
                                                    <span className="value">#{selectedReserva.reserva_id}</span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Fecha:</span>
                                                    <span className="value">
                                                        {new Date(selectedReserva.start_at).toLocaleDateString('es-ES')}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Hora Inicio:</span>
                                                    <span className="value">
                                                        {new Date(selectedReserva.start_at).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Hora Fin:</span>
                                                    <span className="value">
                                                        {new Date(selectedReserva.end_at).toLocaleTimeString('es-ES', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Invitados:</span>
                                                    <span className="value">{selectedReserva.number_of_guests} personas</span>
                                                </div>
                                                <div className="detail-item-dual">
                                                    <span className="label">Estado:</span>
                                                    <span className={`status-badge-dual ${selectedReserva.estado_codigo}`}>
                                                        {selectedReserva.estado_nombre}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botones de Acción */}
                                        <div className="actions-section-dual">
                                            <h4>⚡ Acciones</h4>
                                            <div className="actions-buttons-dual">
                                                {selectedReserva.estado_codigo === 'pendiente' && (
                                                    <button
                                                        className="btn-confirm-dual"
                                                        onClick={() => handleConfirmarReserva(selectedReserva.reserva_id)}
                                                        disabled={loading}
                                                    >
                                                        ✅ Confirmar Reserva
                                                    </button>
                                                )}

                                                {selectedReserva.estado_codigo !== 'cancelado' && selectedReserva.estado_codigo !== 'completado' && (
                                                    <button
                                                        className="btn-cancel-dual"
                                                        onClick={() => handleCancelarReserva(selectedReserva.reserva_id)}
                                                        disabled={loading}
                                                    >
                                                        ❌ Cancelar Reserva
                                                    </button>
                                                )}

                                                {selectedReserva.estado_codigo === 'confirmado' && (
                                                    <button
                                                        className="btn-complete-dual"
                                                        onClick={() => handleConfirmarReserva(selectedReserva.reserva_id)}
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
                <CreateReservaModal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setSelectedDateForCreate(null);
                    }}
                    onSubmit={handleSubmitReserva}
                    loading={loading}
                    initialDate={selectedDateForCreate}
                />
            )}
        </div>
    );
};

export default CalendarioPage; 