/**
 * Caso de uso: Obtener business token
 */

import { IBusinessTokenRepository } from '../../domain/ports/users/business-token.repository';
import { BusinessTokenParams, BusinessTokenResult } from '../../domain/entities/business-token.entity';

export class BusinessTokenUseCase {
  constructor(private readonly businessTokenRepository: IBusinessTokenRepository) {}

  async execute(params: BusinessTokenParams): Promise<BusinessTokenResult> {
    try {
      // Validaciones básicas
      if (params.business_id < 0) {
        return {
          success: false,
          error: 'El business_id debe ser un número válido',
        };
      }

      if (!params.token.trim()) {
        return {
          success: false,
          error: 'El token de sesión es requerido',
        };
      }

      return await this.businessTokenRepository.getBusinessToken(params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener business token',
      };
    }
  }
}
