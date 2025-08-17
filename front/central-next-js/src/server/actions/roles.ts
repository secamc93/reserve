'use server';

import { cookies } from 'next/headers';
import { getApiBaseUrl } from '../config/env';

export interface RoleData {
  name: string;
  description?: string;
  isActive: boolean;
  permissions: number[];
}

export interface PermissionData {
  name: string;
  description?: string;
  module: string;
  action: string;
  isActive: boolean;
}

export interface RoleListResult {
  success: boolean;
  data?: any[];
  message?: string;
}

export interface PermissionListResult {
  success: boolean;
  data?: any[];
  message?: string;
}

export async function getRolesAction(): Promise<RoleListResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener roles'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };

  } catch (error) {
    console.error('Get roles action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getRoleByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener rol'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Get role by id action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createRoleAction(roleData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(roleData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear rol'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Create role action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updateRoleAction(id: number, roleData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(roleData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar rol'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update role action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deleteRoleAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar rol'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete role action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getPermissionsAction(): Promise<PermissionListResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener permisos'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data || []
    };

  } catch (error) {
    console.error('Get permissions action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getPermissionByIdAction(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/permissions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al obtener permiso'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Get permission by id action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function createPermissionAction(permissionData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(permissionData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al crear permiso'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Create permission action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function updatePermissionAction(id: number, permissionData: FormData): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/permissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(permissionData)),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al actualizar permiso'
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.data
    };

  } catch (error) {
    console.error('Update permission action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function deletePermissionAction(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return {
        success: false,
        message: 'No autorizado'
      };
    }

    // Llamada a la API desde el servidor
    const response = await fetch(`${getApiBaseUrl()}/api/v1/permissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Error al eliminar permiso'
      };
    }

    return {
      success: true
    };

  } catch (error) {
    console.error('Delete permission action error:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
} 