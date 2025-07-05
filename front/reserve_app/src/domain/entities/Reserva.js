// Domain Entity - Reserva
export class Reserva {
  constructor(data) {
    // Validate required fields
    if (!data) {
      throw new Error('Reserva data is required');
    }

    // Core reserva data
    this.reserva_id = data.reserva_id;
    this.start_at = new Date(data.start_at);
    this.end_at = new Date(data.end_at);
    this.number_of_guests = data.number_of_guests;
    this.reserva_creada = new Date(data.reserva_creada);
    this.reserva_actualizada = new Date(data.reserva_actualizada);

    // Status information
    this.estado_codigo = data.estado_codigo;
    this.estado_nombre = data.estado_nombre;

    // Client information
    this.cliente_id = data.cliente_id;
    this.cliente_nombre = data.cliente_nombre;
    this.cliente_email = data.cliente_email;
    this.cliente_telefono = data.cliente_telefono;
    this.cliente_dni = data.cliente_dni;

    // Table information
    this.mesa_id = data.mesa_id;
    this.mesa_numero = data.mesa_numero;
    this.mesa_capacidad = data.mesa_capacidad;

    // Restaurant information
    this.restaurante_id = data.restaurante_id;
    this.restaurante_nombre = data.restaurante_nombre;
    this.restaurante_codigo = data.restaurante_codigo;
    this.restaurante_direccion = data.restaurante_direccion;

    // User information
    this.usuario_id = data.usuario_id;
    this.usuario_nombre = data.usuario_nombre;
    this.usuario_email = data.usuario_email;

    // Status history
    this.status_history = data.status_history || [];
  }

  // Business logic methods
  isPendiente() {
    return this.estado_codigo === 'pendiente';
  }

  isAsignado() {
    return this.estado_codigo === 'asignado';
  }

  isConfirmado() {
    return this.estado_codigo === 'confirmado';
  }

  isCancelado() {
    return this.estado_codigo === 'cancelado';
  }

  isCompletado() {
    return this.estado_codigo === 'completado';
  }

  getFormattedDate() {
    return this.start_at.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormattedTime() {
    const startTime = this.start_at.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const endTime = this.end_at.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${startTime} - ${endTime}`;
  }

  getFormattedDuration() {
    const durationMs = this.end_at.getTime() - this.start_at.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  getStatusColor() {
    switch (this.estado_codigo) {
      case 'pendiente':
        return '#FFA500'; // Orange
      case 'asignado':
        return '#17A2B8'; // Cyan
      case 'confirmado':
        return '#28A745'; // Green
      case 'cancelado':
        return '#DC3545'; // Red
      case 'completado':
        return '#6F42C1'; // Purple
      default:
        return '#6C757D'; // Gray
    }
  }

  getStatusIcon() {
    switch (this.estado_codigo) {
      case 'pendiente':
        return '⏳';
      case 'asignado':
        return '🪑';
      case 'confirmado':
        return '✅';
      case 'cancelado':
        return '❌';
      case 'completado':
        return '🎉';
      default:
        return '❓';
    }
  }

  // Status history methods
  getLatestStatusChange() {
    if (this.status_history.length === 0) {
      return null;
    }
    return this.status_history[this.status_history.length - 1];
  }

  getStatusChangeCount() {
    return this.status_history.length;
  }

  getFormattedStatusHistory() {
    return this.status_history.map(change => ({
      ...change,
      changed_at_formatted: new Date(change.changed_at).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status_icon: this.getStatusIconByCode(change.status_code)
    }));
  }

  getStatusIconByCode(statusCode) {
    switch (statusCode) {
      case 'pendiente':
        return '⏳';
      case 'asignado':
        return '🪑';
      case 'confirmado':
        return '✅';
      case 'cancelado':
        return '❌';
      case 'completado':
        return '🎉';
      default:
        return '❓';
    }
  }

  hasBeenCanceled() {
    return this.status_history.some(change => change.status_code === 'cancelado');
  }

  getFirstStatus() {
    if (this.status_history.length === 0) {
      return null;
    }
    return this.status_history[0];
  }

  // Business logic methods
  canBeCanceled() {
    return !this.isCancelado() && !this.isCompletado();
  }

  canChangeStatus() {
    return !this.isCancelado() && !this.isCompletado();
  }

  // Validation methods
  isValid() {
    return (
      this.reserva_id &&
      this.cliente_nombre &&
      this.cliente_email &&
      this.start_at &&
      this.end_at &&
      this.number_of_guests > 0
    );
  }

  // Display methods
  getDisplayName() {
    return `Reserva #${this.reserva_id} - ${this.cliente_nombre}`;
  }

  toString() {
    return `Reserva #${this.reserva_id}: ${this.cliente_nombre} (${this.estado_nombre})`;
  }
} 