/**
 * Implementación del repositorio de usuarios
 * Esta capa se conecta con la base de datos real
 * IMPORTANTE: Este archivo es server-only
 */

import { IUserRepository } from '../../domain/ports/user.repository';
import { User, CreateUserDTO, UpdateUserDTO } from '../../domain/entities/user.entity';
import { Role } from '@config/rbac';

// Simulación de base de datos en memoria (reemplazar con Prisma, Drizzle, etc.)
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class UserRepositoryImpl implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Aquí iría: await prisma.user.findUnique({ where: { id } })
    return mockUsers.find((user) => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    // Aquí iría: await prisma.user.findUnique({ where: { email } })
    return mockUsers.find((user) => user.email === email) || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    // Aquí iría: await prisma.user.create({ data })
    const newUser: User = {
      id: String(mockUsers.length + 1),
      email: data.email,
      name: data.name,
      role: data.role || Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    // Aquí iría: await prisma.user.update({ where: { id }, data })
    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) throw new Error('Usuario no encontrado');
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...data,
      updatedAt: new Date(),
    };
    return mockUsers[index];
  }

  async delete(id: string): Promise<void> {
    // Aquí iría: await prisma.user.delete({ where: { id } })
    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) throw new Error('Usuario no encontrado');
    mockUsers.splice(index, 1);
  }

  async findAll(): Promise<User[]> {
    // Aquí iría: await prisma.user.findMany()
    return mockUsers;
  }
}

