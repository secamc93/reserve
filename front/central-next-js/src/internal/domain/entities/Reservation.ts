// Domain - Reservation Entity
export interface Reservation {
  reserva_id: number;
  start_at: Date;
  end_at: Date;
  number_of_guests: number;
  reserva_creada: Date;
  reserva_actualizada: Date;
  
  // Status information
  estado_codigo: string;
  estado_nombre: string;
  
  // Client information
  cliente_id: number;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_dni?: string;
  
  // Table information
  mesa_id: number;
  mesa_numero: string;
  mesa_capacidad: number;
  
  // Restaurant information
  restaurante_id: number;
  restaurante_nombre: string;
  restaurante_codigo: string;
  restaurante_direccion: string;
  
  // User information
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  
  // Status history
  status_history: StatusHistory[];
}

export interface StatusHistory {
  id: number;
  reserva_id: number;
  status_code: string;
  status_name: string;
  changed_at: Date;
  changed_by: number;
  notes?: string;
}

export interface CreateReservationData {
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_dni?: string;
  start_at: string;
  end_at: string;
  number_of_guests: number;
  mesa_id: number;
  restaurante_id: number;
}

export interface UpdateReservationStatusData {
  reserva_id: number;
  status: string;
  notes?: string;
}

export interface ReservationFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  cliente_email?: string;
  mesa_id?: number;
  restaurante_id?: number;
  page?: number;
  page_size?: number;
} 