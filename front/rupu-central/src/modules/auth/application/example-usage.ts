/**
 * Ejemplo de uso del constructor centralizado de Auth
 * Este archivo muestra cómo usar el patrón de constructor centralizado
 */

import { AuthUseCases } from './index';

// Ejemplo de uso del constructor centralizado
export async function exampleUsage() {
  // 1. Crear instancia del constructor centralizado
  const authUseCases = new AuthUseCases();

  // 2. Usar casos de uso de usuarios
  try {
    // Login
    const loginResult = await authUseCases.users.login.execute({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Login exitoso:', loginResult.user.name);

    // Obtener lista de usuarios
    const usersResult = await authUseCases.users.getUsers.execute({
      page: 1,
      page_size: 10,
      token: loginResult.token
    });
    console.log('Usuarios obtenidos:', usersResult.users.count);

    // Crear usuario
    const createResult = await authUseCases.users.createUser.execute({
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      phone: '123456789',
      role: 'user',
      business_ids: '1,2',
      token: loginResult.token
    });
    console.log('Usuario creado:', createResult.name);

    // Obtener usuario por ID
    const userResult = await authUseCases.users.getUserById.execute({
      id: createResult.id,
      token: loginResult.token
    });
    console.log('Usuario obtenido:', userResult.name);

    // Actualizar usuario
    const updateResult = await authUseCases.users.updateUser.execute({
      id: createResult.id,
      name: 'Usuario Actualizado',
      token: loginResult.token
    });
    console.log('Usuario actualizado:', updateResult.name);

    // Eliminar usuario
    const deleteResult = await authUseCases.users.deleteUser.execute({
      id: createResult.id,
      token: loginResult.token
    });
    console.log('Usuario eliminado:', deleteResult.success);

  } catch (error) {
    console.error('Error en operaciones de usuarios:', error);
  }
}

// Ejemplo de uso en un Server Action
export async function exampleServerAction() {
  const authUseCases = new AuthUseCases();
  
  // Todos los casos de uso están disponibles a través del constructor
  return {
    login: authUseCases.users.login,
    getUsers: authUseCases.users.getUsers,
    createUser: authUseCases.users.createUser,
    deleteUser: authUseCases.users.deleteUser,
    updateUser: authUseCases.users.updateUser,
    getUserById: authUseCases.users.getUserById,
  };
}
