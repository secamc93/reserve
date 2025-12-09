/**
 * Puerto de dominio: Repositorio de Login
 */

import { LoginRequest, LoginResponse } from '../entities';

export interface ILoginRepository {
  login(request: LoginRequest): Promise<LoginResponse>;
}
