/**
 * Entidad User (Domain)
 * Representa un usuario en el dominio de negocio
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // Los roles vienen del backend de forma dinámica
  avatarUrl?: string; // URL del avatar del usuario
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: string;
}


