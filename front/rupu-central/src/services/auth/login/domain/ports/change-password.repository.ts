/**
 * Puerto de dominio: Repositorio de Cambio de Contraseña
 */

import { ChangePasswordRequest, ChangePasswordResponse } from '../entities';

export interface IChangePasswordRepository {
  changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>;
}
