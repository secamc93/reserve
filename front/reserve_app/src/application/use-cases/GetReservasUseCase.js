// Application - Use Case
export class GetReservasUseCase {
  constructor(reservaRepository) {
    this.reservaRepository = reservaRepository;
  }

  async execute(filters = {}) {
    try {
      console.log('GetReservasUseCase executing with filters:', filters);
      
      // Business logic can be added here
      // For example, validation, authorization, etc.
      
      // Call repository to get data
      const result = await this.reservaRepository.getReservas(filters);
      
      console.log('Repository result:', result);
      
      // Validate result structure
      if (!result) {
        throw new Error('No result received from repository');
      }
      
      // Ensure we have the required fields with defaults
      const safeResult = {
        success: true,
        data: Array.isArray(result.data) ? result.data : [],
        total: typeof result.total === 'number' ? result.total : 0,
        filters: result.filters || {},
        message: result.message || 'Reservas obtenidas exitosamente'
      };
      
      console.log('Use case returning:', safeResult);
      
      // Additional business logic can be applied here
      // For example, sorting, grouping, etc.
      
      return safeResult;
    } catch (error) {
      console.error('Error in GetReservasUseCase:', error);
      
      return {
        success: false,
        error: error.message || 'Error desconocido al obtener reservas',
        data: [],
        total: 0,
        filters: {}
      };
    }
  }
}

export class CreateReservaUseCase {
  constructor(reservaRepository) {
    this.reservaRepository = reservaRepository;
  }

  async execute(reservaData) {
    try {
      console.log('CreateReservaUseCase executing with data:', reservaData);
      
      // Business validation
      this.validateReservaData(reservaData);
      
      // Convert dates to proper ISO format if needed
      const processedData = this.processReservaData(reservaData);
      
      console.log('Processed reserva data:', processedData);
      
      // Call repository to create
      const createdReserva = await this.reservaRepository.createReserva(processedData);
      
      if (!createdReserva) {
        throw new Error('No data received from repository after creation');
      }
      
      console.log('Reserva created successfully:', createdReserva);
      
      return {
        success: true,
        data: createdReserva,
        message: 'Reserva creada exitosamente'
      };
    } catch (error) {
      console.error('Error in CreateReservaUseCase:', error);
      
      return {
        success: false,
        error: error.message || 'Error desconocido al crear reserva'
      };
    }
  }

  validateReservaData(data) {
    const requiredFields = ['name', 'email', 'phone', 'dni', 'start_at', 'end_at', 'number_of_guests', 'restaurant_id'];
    
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('El formato del email no es válido');
    }

    // Validate phone (basic validation)
    if (typeof data.phone !== 'string' || data.phone.length < 7) {
      throw new Error('El teléfono debe tener al menos 7 dígitos');
    }

    // Validate number of guests
    if (data.number_of_guests < 1 || data.number_of_guests > 20) {
      throw new Error('El número de invitados debe estar entre 1 y 20');
    }

    // Validate DNI
    if (data.dni < 1) {
      throw new Error('El DNI debe ser un número válido');
    }

    // Validate restaurant_id
    if (data.restaurant_id < 1) {
      throw new Error('Debe seleccionar un restaurante válido');
    }

    // Validate dates
    const startDate = new Date(data.start_at);
    const endDate = new Date(data.end_at);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Las fechas no son válidas');
    }

    if (startDate >= endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (startDate < new Date()) {
      throw new Error('La fecha de reserva no puede ser en el pasado');
    }
  }

  processReservaData(data) {
    return {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      dni: parseInt(data.dni, 10),
      start_at: data.start_at,
      end_at: data.end_at,
      number_of_guests: parseInt(data.number_of_guests, 10),
      restaurant_id: parseInt(data.restaurant_id, 10)
    };
  }
}

export class CancelReservaUseCase {
  constructor(reservaRepository) {
    this.reservaRepository = reservaRepository;
  }

  async execute(id) {
    try {
      console.log('⚡ USE CASE: Iniciando CancelReservaUseCase con ID:', id);
      
      // Business validation
      if (!id) {
        throw new Error('ID de reserva es obligatorio');
      }

      if (typeof id !== 'number' && !parseInt(id)) {
        throw new Error('ID de reserva debe ser un número válido');
      }

      const reservaId = typeof id === 'number' ? id : parseInt(id);
      
      console.log('⚡ USE CASE: ID validado:', reservaId);
      console.log('⚡ USE CASE: Llamando reservaRepository.cancelReserva');

      // Call repository to cancel
      const canceledReserva = await this.reservaRepository.cancelReserva(reservaId);
      
      console.log('⚡ USE CASE: Respuesta del repositorio:', canceledReserva);
      
      if (!canceledReserva) {
        throw new Error('No data received from repository after cancellation');
      }
      
      console.log('⚡ USE CASE: Reserva cancelada exitosamente:', canceledReserva);
      
      return {
        success: true,
        data: canceledReserva,
        message: 'Reserva cancelada exitosamente'
      };
    } catch (error) {
      console.error('⚡ USE CASE: Error en CancelReservaUseCase:', error);
      console.error('⚡ USE CASE: Mensaje de error:', error.message);
      console.error('⚡ USE CASE: Stack trace:', error.stack);
      
      return {
        success: false,
        error: error.message || 'Error desconocido al cancelar reserva'
      };
    }
  }
}

export class UpdateReservaStatusUseCase {
  constructor(reservaRepository) {
    this.reservaRepository = reservaRepository;
  }

  async execute(id, status) {
    try {
      console.log('UpdateReservaStatusUseCase executing:', { id, status });
      
      // Business validation
      if (!id || !status) {
        throw new Error('ID and status are required');
      }

      const validStatuses = ['pendiente', 'asignado', 'confirmado', 'cancelado', 'completado'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
      }

      const updatedReserva = await this.reservaRepository.updateReservaStatus(id, status);
      
      if (!updatedReserva) {
        throw new Error('No data received from repository after update');
      }
      
      console.log('Status updated successfully:', updatedReserva);
      
      return {
        success: true,
        data: updatedReserva,
        message: `Estado actualizado exitosamente a: ${status}`
      };
    } catch (error) {
      console.error('Error in UpdateReservaStatusUseCase:', error);
      
      return {
        success: false,
        error: error.message || 'Error desconocido al actualizar estado'
      };
    }
  }
} 