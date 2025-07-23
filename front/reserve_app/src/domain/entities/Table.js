export class Table {
    constructor(data = {}) {
        this.id = data.id || null;
        this.businessId = data.business_id || data.businessId || null;
        this.business = data.business || null;
        this.number = data.number || 0;
        this.capacity = data.capacity || 0;
        this.isActive = data.is_active !== undefined ? data.is_active : true;
        this.createdAt = data.created_at ? new Date(data.created_at) : null;
        this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    }

    // Métodos de validación
    isValid() {
        return this.businessId && this.number > 0 && this.capacity > 0;
    }

    // Método para obtener datos para crear
    toCreateData() {
        return {
            business_id: this.businessId,
            number: this.number,
            capacity: this.capacity
        };
    }

    // Método para obtener datos para actualizar
    toUpdateData() {
        const data = {};
        
        if (this.businessId !== undefined) data.business_id = this.businessId;
        if (this.number !== undefined) data.number = this.number;
        if (this.capacity !== undefined) data.capacity = this.capacity;
        
        return data;
    }

    // Método para clonar
    clone() {
        return new Table({
            id: this.id,
            business_id: this.businessId,
            business: this.business,
            number: this.number,
            capacity: this.capacity,
            is_active: this.isActive,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        });
    }

    // Método para obtener el estado como texto
    getStatusText() {
        return this.isActive ? 'Activa' : 'Inactiva';
    }

    // Método para obtener el nombre del negocio
    getBusinessName() {
        return this.business?.name || 'Negocio no especificado';
    }

    // Método para obtener información de capacidad
    getCapacityText() {
        return `${this.capacity} ${this.capacity === 1 ? 'persona' : 'personas'}`;
    }

    // Método para obtener información completa de la mesa
    getFullInfo() {
        return `Mesa ${this.number} - ${this.getCapacityText()}`;
    }
} 