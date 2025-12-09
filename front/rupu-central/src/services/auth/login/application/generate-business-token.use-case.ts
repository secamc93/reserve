/**
 * Caso de uso: Generar Business Token
 */

import { IBusinessTokenRepository } from '../domain/ports';
import { BusinessTokenResponse } from '../../domain/entities';

export interface GenerateBusinessTokenParams {
  business_id: number;
  session_token: string;
}

export class GenerateBusinessTokenUseCase {
  constructor(private readonly businessTokenRepository: IBusinessTokenRepository) {}

  async execute(params: GenerateBusinessTokenParams): Promise<BusinessTokenResponse> {
    // Validar entrada
    if (!params.session_token) {
      throw new Error('El token de sesión es requerido');
    }

    if (params.business_id < 0) {
      throw new Error('El business_id debe ser un número válido');
    }

    // Ejecutar generación de business token
    // El repositorio agregará "Bearer " al token, así que pasamos el token limpio
    const cleanToken = params.session_token.startsWith('Bearer ') 
      ? params.session_token.substring(7) 
      : params.session_token;
      
    const response = await this.businessTokenRepository.getBusinessToken({
      business_id: params.business_id,
      token: cleanToken,
    });

    return response;
  }
}
