export class GetUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(filters = {}) {
        try {
            console.log('GetUsersUseCase: Ejecutando con filtros:', filters);

            // Validaciones de negocio
            if (filters.page && filters.page < 1) {
                throw new Error('La página debe ser mayor a 0');
            }

            if (filters.page_size && (filters.page_size < 1 || filters.page_size > 100)) {
                throw new Error('El tamaño de página debe estar entre 1 y 100');
            }

            const result = await this.userRepository.getUsers(filters);

            console.log('GetUsersUseCase: Resultado:', result);

            return result;
        } catch (error) {
            console.error('GetUsersUseCase: Error:', error);
            return {
                success: false,
                data: [],
                total: 0,
                page: 1,
                pageSize: 10,
                message: error.message || 'Error desconocido al obtener usuarios'
            };
        }
    }
} 