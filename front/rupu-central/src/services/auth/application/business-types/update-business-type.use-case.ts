/**
 * Caso de Uso: Update Business Type
 */

import { UpdateBusinessTypeInput, UpdateBusinessTypeResult } from '../../domain/entities';
import { IUpdateBusinessTypeRepository } from '../../domain/ports/business-types/update-business-type.repository';

export interface UpdateBusinessTypeUseCaseInput {
  token: string;
}

export class UpdateBusinessTypeUseCase {
  constructor(private updateBusinessTypeRepository: IUpdateBusinessTypeRepository) {}

  async execute(input: UpdateBusinessTypeInput & UpdateBusinessTypeUseCaseInput): Promise<UpdateBusinessTypeResult> {
    try {
      const { token, ...businessTypeData } = input;
      
      // Validaciones básicas
      if (!businessTypeData.id) {
        return {
          success: false,
          error: 'El ID del tipo de negocio es requerido',
        };
      }

      if (businessTypeData.name !== undefined && !businessTypeData.name.trim()) {
        return {
          success: false,
          error: 'El nombre del tipo de negocio no puede estar vacío',
        };
      }

      if (businessTypeData.code !== undefined && !businessTypeData.code.trim()) {
        return {
          success: false,
          error: 'El código del tipo de negocio no puede estar vacío',
        };
      }

      if (businessTypeData.description !== undefined && !businessTypeData.description.trim()) {
        return {
          success: false,
          error: 'La descripción del tipo de negocio no puede estar vacía',
        };
      }

      if (businessTypeData.icon !== undefined && !businessTypeData.icon.trim()) {
        return {
          success: false,
          error: 'El icono del tipo de negocio no puede estar vacío',
        };
      }

      return await this.updateBusinessTypeRepository.updateBusinessType(businessTypeData, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar tipo de negocio',
      };
    }
  }
}
