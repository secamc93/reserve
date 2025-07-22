export class CreateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userData) {
        try {
            console.log('CreateUserUseCase: Ejecutando con datos:', userData);

            // 1. Unir nombre y apellido para crear el campo 'name'
            const processedData = {
                ...userData,
                name: `${userData.first_name.trim()} ${userData.last_name.trim()}`.trim(),
            };

            // 2. Validar los datos (ya con el campo 'name' construido)
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
        // Actualizamos los campos requeridos para que coincidan con el formulario
        const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password'];

        for (const field of requiredFields) {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                throw new Error(`El campo ${this.getFieldName(field)} es obligatorio`);
            }
        }

        // Validar roles
        if (!data.role_ids || data.role_ids.length === 0) {
            throw new Error('Debe seleccionar al menos un rol');
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new Error('El formato del correo no es válido');
        }

        // Validar contraseña
        if (data.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
    }

    // Función de ayuda para obtener nombres de campo más amigables
    getFieldName(field) {
        const names = {
            first_name: 'nombre',
            last_name: 'apellido',
            username: 'nombre de usuario',
            email: 'correo',
            password: 'contraseña',
        };
        return names[field] || field;
    }
} 