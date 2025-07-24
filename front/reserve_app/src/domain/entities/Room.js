export class Room {
    constructor(data = {}) {
        console.log('Room constructor - Datos recibidos:', data);
        
        this.id = data.id || data.ID || null;
        this.businessId = data.business_id || data.businessId || data.BusinessID || null;
        this.business = data.business || null;
        this.name = data.name || data.Name || '';
        this.code = data.code || data.Code || '';
        this.description = data.description || data.Description || '';
        this.capacity = data.capacity || data.Capacity || 0;
        this.minCapacity = data.min_capacity || data.minCapacity || data.MinCapacity || 1;
        this.maxCapacity = data.max_capacity || data.maxCapacity || data.MaxCapacity || 0;
        this.isActive = data.is_active !== undefined ? data.is_active : (data.IsActive !== undefined ? data.IsActive : true);
        this.createdAt = data.created_at || data.CreatedAt ? new Date(data.created_at || data.CreatedAt) : null;
        this.updatedAt = data.updated_at || data.UpdatedAt ? new Date(data.updated_at || data.UpdatedAt) : null;
        
        console.log('Room constructor - Objeto creado:', {
            id: this.id,
            businessId: this.businessId,
            name: this.name,
            code: this.code,
            description: this.description,
            capacity: this.capacity,
            isActive: this.isActive
        });
    }

    // Métodos de validación
    isValid() {
        return this.businessId && 
               this.name.trim() !== '' && 
               this.code.trim() !== '' && 
               this.capacity > 0;
    }

    // Método para obtener datos para crear
    toCreateData() {
        return {
            business_id: this.businessId,
            name: this.name,
            code: this.code,
            description: this.description,
            capacity: this.capacity,
            min_capacity: this.minCapacity,
            max_capacity: this.maxCapacity,
            is_active: this.isActive
        };
    }

    // Método para obtener datos para actualizar
    toUpdateData() {
        const data = {};
        
        if (this.businessId !== undefined) data.business_id = this.businessId;
        if (this.name !== undefined) data.name = this.name;
        if (this.code !== undefined) data.code = this.code;
        if (this.description !== undefined) data.description = this.description;
        if (this.capacity !== undefined) data.capacity = this.capacity;
        if (this.minCapacity !== undefined) data.min_capacity = this.minCapacity;
        if (this.maxCapacity !== undefined) data.max_capacity = this.maxCapacity;
        if (this.isActive !== undefined) data.is_active = this.isActive;
        
        return data;
    }

    // Método para clonar
    clone() {
        return new Room({
            id: this.id,
            business_id: this.businessId,
            business: this.business,
            name: this.name,
            code: this.code,
            description: this.description,
            capacity: this.capacity,
            min_capacity: this.minCapacity,
            max_capacity: this.maxCapacity,
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
        let text = `${this.capacity} ${this.capacity === 1 ? 'persona' : 'personas'}`;
        
        if (this.minCapacity > 1 || this.maxCapacity > 0) {
            text += ' (';
            if (this.minCapacity > 1) {
                text += `mín: ${this.minCapacity}`;
            }
            if (this.maxCapacity > 0) {
                if (this.minCapacity > 1) text += ', ';
                text += `máx: ${this.maxCapacity}`;
            }
            text += ')';
        }
        
        return text;
    }

    // Método para obtener información completa de la sala
    getFullInfo() {
        return `${this.name} (${this.code}) - ${this.getCapacityText()}`;
    }

    // Método para validar capacidad
    validateCapacity() {
        if (this.capacity <= 0) {
            return 'La capacidad debe ser mayor a 0';
        }
        
        if (this.minCapacity < 1) {
            return 'La capacidad mínima debe ser al menos 1';
        }
        
        if (this.maxCapacity > 0 && this.maxCapacity < this.minCapacity) {
            return 'La capacidad máxima debe ser mayor o igual a la capacidad mínima';
        }
        
        if (this.maxCapacity > 0 && this.capacity < this.maxCapacity) {
            return 'La capacidad total debe ser mayor o igual a la capacidad máxima';
        }
        
        return null;
    }
} 