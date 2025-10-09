/**
 * Puerto para el repositorio de login
 */

import { LoginResponse } from '../entities/user.entity';

export interface ILoginRepository {
  login(email: string, password: string): Promise<LoginResponse>;
}

