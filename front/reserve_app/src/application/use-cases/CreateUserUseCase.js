export class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userData) {
        try {
            console.log('CreateUserUseCase: Ejecutando con datos:', userData);

            // 1. Preparar los datos exactamente como los espera la API (SIN avatar_url)
            const processedData = {
                name: userData.name.trim(),
                email: userData.email.trim(),
                phone: userData.phone ? userData.phone.trim() : '',
                business_ids: userData.business_ids || [],
                role_ids: userData.role_ids || [],
                is_active: userData.is_active !== undefined ? userData.is_active : true,
            };

            // 2. Validar los datos
            this.validateUserData(processedData);

            const result = await this.userRepository.createUser(processedData);

            console.log('CreateUserUseCase: Usuario creado exitosamente');

            return result;
        } catch (error) {
            console.error('CreateUserUseCase: Error:', error);
            throw error;
        }
    }

    validateUserData(data) {
        // Validar campos requeridos
        const requiredFields = ['name', 'email'];

        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                throw new Error(`El campo ${this.getFieldName(field)} es obligatorio`);
            }
        }

        // Validar roles
        if (!data.role_ids || data.role_ids.length === 0) {
            throw new Error('Debe seleccionar al menos un rol');
        }

        // Validar negocios
        if (!data.business_ids || data.business_ids.length === 0) {
            throw new Error('Debe seleccionar al menos un negocio');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('El formato del correo no es válido');
        }
    }

    // Función de ayuda para obtener nombres de campo más amigables
    getFieldName(field) {
        const names = {
            name: 'nombre completo',
            email: 'correo',
            phone: 'teléfono',
        };
        return names[field] || field;
    }
} 