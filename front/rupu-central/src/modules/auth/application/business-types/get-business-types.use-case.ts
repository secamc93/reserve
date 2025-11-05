import { GetBusinessTypesResult } from '../../domain/entities';
import { IBusinessTypesRepository } from '../../domain/ports/business-types/business-types.repository';

export interface GetBusinessTypesUseCaseInput {
  token: string;
}

export class GetBusinessTypesUseCase {
  constructor(private businessTypesRepository: IBusinessTypesRepository) {}

  async execute(input: GetBusinessTypesUseCaseInput): Promise<GetBusinessTypesResult> {
    try {
      if (!input.token) {
        return {
          success: false,
          error: 'Token de autenticación requerido',
        };
      }

      return await this.businessTypesRepository.getBusinessTypes(input.token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener tipos de negocio',
      };
    }
  }
}
