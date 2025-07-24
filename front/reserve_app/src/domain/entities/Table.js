export class Table {
    constructor(data = {}) {
        console.log('Table constructor - Datos recibidos:', data);
        
        this.id = data.id || data.ID || null;
        this.businessId = data.business_id || data.businessId || data.BusinessID || null;
        this.business = data.business || null;
        this.number = data.number || data.Number || 0;
        this.capacity = data.capacity || data.Capacity || 0;
        this.isActive = data.is_active !== undefined ? data.is_active : (data.IsActive !== undefined ? data.IsActive : true);
        this.createdAt = data.created_at || data.CreatedAt ? new Date(data.created_at || data.CreatedAt) : null;
        this.updatedAt = data.updated_at || data.UpdatedAt ? new Date(data.updated_at || data.UpdatedAt) : null;
        
        console.log('Table constructor - Objeto creado:', {
            id: this.id,
            businessId: this.businessId,
            number: this.number,
            capacity: this.capacity,
            isActive: this.isActive
        });
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
        if (this.business?.name) {
            return this.business.name;
        }
        if (this.businessId) {
            return `Negocio ID: ${this.businessId}`;
        }
        return 'Negocio no especificado';
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