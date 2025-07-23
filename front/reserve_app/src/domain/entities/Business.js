export class Business {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.code = data.code || '';
        this.businessType = data.business_type || null;
        this.businessTypeId = data.business_type_id || data.businessType?.id || null;
        this.timezone = data.timezone || '';
        this.address = data.address || '';
        this.description = data.description || '';
        
        // Configuración de marca blanca
        this.logoUrl = data.logo_url || '';
        this.primaryColor = data.primary_color || '';
        this.secondaryColor = data.secondary_color || '';
        this.customDomain = data.custom_domain || '';
        this.isActive = data.is_active !== undefined ? data.is_active : true;
        
        // Configuración de funcionalidades
        this.enableDelivery = data.enable_delivery !== undefined ? data.enable_delivery : false;
        this.enablePickup = data.enable_pickup !== undefined ? data.enable_pickup : false;
        this.enableReservations = data.enable_reservations !== undefined ? data.enable_reservations : false;
        
        // Timestamps
        this.createdAt = data.created_at ? new Date(data.created_at) : null;
        this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    }

    // Métodos de validación
    isValid() {
        return this.name && this.code && (this.businessTypeId || this.businessType?.id);
    }

    // Método para obtener datos para crear/actualizar
    toRequestData() {
        return {
            name: this.name,
            code: this.code,
            business_type_id: this.businessTypeId || this.businessType?.id,
            timezone: this.timezone,
            address: this.address,
            description: this.description,
            logo_url: this.logoUrl,
            primary_color: this.primaryColor,
            secondary_color: this.secondaryColor,
            custom_domain: this.customDomain,
            is_active: this.isActive,
            enable_delivery: this.enableDelivery,
            enable_pickup: this.enablePickup,
            enable_reservations: this.enableReservations
        };
    }

    // Método para clonar
    clone() {
        return new Business({
            id: this.id,
            name: this.name,
            code: this.code,
            business_type: this.businessType,
            business_type_id: this.businessTypeId,
            timezone: this.timezone,
            address: this.address,
            description: this.description,
            logo_url: this.logoUrl,
            primary_color: this.primaryColor,
            secondary_color: this.secondaryColor,
            custom_domain: this.customDomain,
            is_active: this.isActive,
            enable_delivery: this.enableDelivery,
            enable_pickup: this.enablePickup,
            enable_reservations: this.enableReservations,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        });
    }

    // Método para obtener el estado como texto
    getStatusText() {
        return this.isActive ? 'Activo' : 'Inactivo';
    }

    // Método para obtener el tipo de negocio como texto
    getBusinessTypeText() {
        return this.businessType?.name || 'Sin tipo';
    }

    // Método para obtener funcionalidades habilitadas
    getEnabledFeatures() {
        const features = [];
        if (this.enableDelivery) features.push('Delivery');
        if (this.enablePickup) features.push('Pickup');
        if (this.enableReservations) features.push('Reservas');
        return features.length > 0 ? features.join(', ') : 'Ninguna';
    }
} 