/**
 * Caso de Uso: Delete Business Type
 */

import { DeleteBusinessTypeInput, DeleteBusinessTypeResult } from '../../domain/entities';
import { IDeleteBusinessTypeRepository } from '../../domain/ports/business-types/delete-business-type.repository';

export interface DeleteBusinessTypeUseCaseInput {
  token: string;
}

export class DeleteBusinessTypeUseCase {
  constructor(private deleteBusinessTypeRepository: IDeleteBusinessTypeRepository) {}

  async execute(input: DeleteBusinessTypeInput & DeleteBusinessTypeUseCaseInput): Promise<DeleteBusinessTypeResult> {
    try {
      const { token, ...businessTypeData } = input;
      
      // Validaciones básicas
      if (!businessTypeData.id) {
        return {
          success: false,
          error: 'El ID del tipo de negocio es requerido',
        };
      }

      return await this.deleteBusinessTypeRepository.deleteBusinessType(businessTypeData, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar tipo de negocio',
      };
    }
  }
}
