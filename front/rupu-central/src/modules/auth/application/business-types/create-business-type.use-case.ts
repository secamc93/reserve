/**
 * Caso de Uso: Create Business Type
 */

import { CreateBusinessTypeInput, CreateBusinessTypeResult } from '../../domain/entities';
import { ICreateBusinessTypeRepository } from '../../domain/ports/business-types/create-business-type.repository';

export interface CreateBusinessTypeUseCaseInput {
  token: string;
}

export class CreateBusinessTypeUseCase {
  constructor(private createBusinessTypeRepository: ICreateBusinessTypeRepository) {}

  async execute(input: CreateBusinessTypeInput & CreateBusinessTypeUseCaseInput): Promise<CreateBusinessTypeResult> {
    try {
      const { token, ...businessTypeData } = input;
      
      // Validaciones básicas
      if (!businessTypeData.name.trim()) {
        return {
          success: false,
          error: 'El nombre del tipo de negocio es requerido',
        };
      }

      if (!businessTypeData.code.trim()) {
        return {
          success: false,
          error: 'El código del tipo de negocio es requerido',
        };
      }

      if (!businessTypeData.description.trim()) {
        return {
          success: false,
          error: 'La descripción del tipo de negocio es requerida',
        };
      }

      if (!businessTypeData.icon.trim()) {
        return {
          success: false,
          error: 'El icono del tipo de negocio es requerido',
        };
      }

      return await this.createBusinessTypeRepository.createBusinessType(businessTypeData, token);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al crear tipo de negocio',
      };
    }
  }
}
