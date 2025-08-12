// Infrastructure - HTTP Client (Primary Adapter)
export class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Clase personalizada para errores de API
  private createApiError(message: string, status?: number): Error {
    const error = new Error(message);
    error.name = 'ApiError';
    (error as any).status = status;
    return error;
  }

  /**
   * Convierte keys de un objeto (profundidad arbitraria) de camelCase a snake_case.
   * - No transforma instancias de Date, File, Blob, FormData
   * - Maneja Arrays y objetos anidados
   */
  private toSnakeCase(data: any): any {
    const isPlainObject = (val: any) => Object.prototype.toString.call(val) === '[object Object]';

    if (data === null || data === undefined) return data;
    if (data instanceof Date || data instanceof File || data instanceof Blob || data instanceof FormData) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.toSnakeCase(item));
    }

    if (isPlainObject(data)) {
      const result: Record<string, any> = {};
      Object.keys(data).forEach((key) => {
        const snakeKey = key
          .replace(/([A-Z])/g, '_$1')
          .replace(/-/g, '_')
          .toLowerCase();
        result[snakeKey] = this.toSnakeCase(data[key]);
      });
      return result;
    }

    return data;
  }

  /**
   * Returns default headers for every request including the Authorization header
   * if an authToken exists in localStorage.
   */
  private getDefaultHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async get(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    // Concatenar correctamente la base y el endpoint
    let url = this.baseURL.replace(/\/$/, '') + endpoint;
    const urlObj = new URL(url);

    // ✅ CORREGIDO: Validar y limpiar parámetros específicos para users
    const cleanedParams = this.cleanParams(params, endpoint);

    // Add query parameters
    Object.keys(cleanedParams).forEach(key => {
      if (cleanedParams[key] !== null && cleanedParams[key] !== undefined && cleanedParams[key] !== '') {
        urlObj.searchParams.append(key, cleanedParams[key]);
      }
    });

    console.log('🔧 Original params:', params);
    console.log('✅ Cleaned params:', cleanedParams);
    console.log('🌐 Making GET request to:', urlObj.toString());

    try {
      const response = await fetch(urlObj.toString(), {
        method: 'GET',
        headers: this.getDefaultHeaders(),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      const data = await response.json();
      console.log('Response data:', data);

      return data;
    } catch (error) {
      console.error('HTTP GET Error:', error);

      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en http://localhost:3050');
      }

      if (error instanceof SyntaxError) {
        throw new Error('Respuesta inválida del servidor');
      }

      throw error;
    }
  }

  // ✅ NUEVO: Método para limpiar parámetros según el endpoint
  private cleanParams(params: Record<string, any>, endpoint: string): Record<string, any> {
    const cleaned = { ...params };

    // Limpiar específicamente para endpoints de usuarios
    if (endpoint.includes('/users')) {
      // Asegurar que page y page_size sean válidos
      if (cleaned.page !== undefined) {
        const page = parseInt(cleaned.page);
        cleaned.page = (page && page >= 1) ? page : 1;
      }

      if (cleaned.page_size !== undefined) {
        const pageSize = parseInt(cleaned.page_size);
        cleaned.page_size = (pageSize && pageSize >= 1 && pageSize <= 100) ? pageSize : 10;
      }

      // Limpiar strings vacíos
      ['name', 'email', 'phone', 'created_at', 'sort_by', 'sort_order'].forEach(field => {
        if (cleaned[field] !== undefined && cleaned[field] !== null) {
          const str = String(cleaned[field]).trim();
          if (str === '') {
            delete cleaned[field];
          } else {
            cleaned[field] = str;
          }
        }
      });

      // Validar email si existe
      if (cleaned.email && !this.isValidEmail(cleaned.email)) {
        delete cleaned.email;
      }

      // Limpiar valores null/undefined
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === null || cleaned[key] === undefined) {
          delete cleaned[key];
        }
      });
    }

    return cleaned;
  }

  // ✅ Helper para validar email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async post(endpoint: string, data: any): Promise<any> {
    try {
      console.log('🌐 POST: Iniciando request POST');
      console.log('🌐 POST: Endpoint:', endpoint);
      console.log('🌐 POST: Data type:', data instanceof FormData ? 'FormData' : 'JSON');
      console.log('🌐 POST: Data (original):', data);

      // Determinar headers y body según el tipo de datos
      let headers: Record<string, string> = {};
      let body: string | FormData;

      if (data instanceof FormData) {
        headers = {
          ...(this.getDefaultHeaders()),
        };
        delete headers['Content-Type'];
        body = data;
      } else {
        headers = this.getDefaultHeaders();
        const snake = this.toSnakeCase(data);
        console.log('🌐 POST: Data (snake_case):', snake);
        body = JSON.stringify(snake);
      }

      console.log('🌐 POST: Headers finales:', headers);
      console.log('🌐 POST: URL completa:', `${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
      });

      console.log('🌐 POST: Response recibida');
      console.log('🌐 POST: Status:', response.status);
      console.log('🌐 POST: StatusText:', response.statusText);
      console.log('🌐 POST: Headers:', response.headers);

      if (!response.ok) {
        console.log('🌐 POST: Response not ok, status:', response.status);
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🌐 POST: Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('🌐 POST: No se pudo parsear error response:', parseError);
        }
        
        // Usar error personalizado para errores de API (no loguea stack trace)
        throw this.createApiError(errorMessage, response.status);
      }

      console.log('🌐 POST: Parseando respuesta JSON');
      const result = await response.json();
      console.log('🌐 POST: Resultado final:', result);

      return result;
    } catch (error) {
      // Solo loguear errores de red/conexión, no errores de API
      if (error instanceof Error && error.name !== 'ApiError') {
        console.error('🌐 POST: Error de conexión:', error);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en http://localhost:3050');
      }

      throw error;
    }
  }

  async put(endpoint: string, data: any): Promise<any> {
    try {
      console.log('🌐 PUT: Iniciando request PUT');
      console.log('🌐 PUT: Endpoint:', endpoint);
      console.log('🌐 PUT: Data type:', data instanceof FormData ? 'FormData' : 'JSON');
      console.log('🌐 PUT: Data (original):', data);

      // Determinar headers y body según el tipo de datos
      let headers: Record<string, string> = {};
      let body: string | FormData;

      if (data instanceof FormData) {
        headers = {
          ...(this.getDefaultHeaders()),
        };
        delete headers['Content-Type'];
        body = data;
      } else {
        headers = this.getDefaultHeaders();
        const snake = this.toSnakeCase(data);
        console.log('🌐 PUT: Data (snake_case):', snake);
        body = JSON.stringify(snake);
      }

      console.log('🌐 PUT: Headers finales:', headers);
      console.log('🌐 PUT: URL completa:', `${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body,
      });

      console.log('🌐 PUT: Response recibida');
      console.log('🌐 PUT: Status:', response.status);
      console.log('🌐 PUT: StatusText:', response.statusText);

      if (!response.ok) {
        console.log('🌐 PUT: Response not ok, status:', response.status);
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.log('🌐 PUT: Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('🌐 PUT: No se pudo parsear error response:', parseError);
        }
        
        throw this.createApiError(errorMessage, response.status);
      }

      console.log('🌐 PUT: Parseando respuesta JSON');
      const result = await response.json();
      console.log('🌐 PUT: Resultado final:', result);

      return result;
    } catch (error) {
      // Solo loguear errores de red/conexión, no errores de API
      if (error instanceof Error && error.name !== 'ApiError') {
        console.error('🌐 PUT: Error de conexión:', error);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en http://localhost:3050');
      }

      throw error;
    }
  }

  async patch(endpoint: string, data: any = {}): Promise<any> {
    try {
      console.log('🌐 PATCH: Iniciando request PATCH');
      console.log('🌐 PATCH: Endpoint:', endpoint);
      console.log('🌐 PATCH: Data (original):', data);
      console.log('🌐 PATCH: URL completa:', `${this.baseURL}${endpoint}`);

      const snake = this.toSnakeCase(data);
      console.log('🌐 PATCH: Data (snake_case):', snake);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(snake),
      });

      console.log('🌐 PATCH: Response recibida');
      console.log('🌐 PATCH: Status:', response.status);
      console.log('🌐 PATCH: StatusText:', response.statusText);
      console.log('🌐 PATCH: Headers:', response.headers);

      if (!response.ok) {
        console.log('🌐 PATCH: Response not ok, status:', response.status);
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('🌐 PATCH: Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('🌐 PATCH: No se pudo parsear error response:', parseError);
        }
        
        throw this.createApiError(errorMessage, response.status);
      }

      console.log('🌐 PATCH: Parseando respuesta JSON');
      const result = await response.json();
      console.log('🌐 PATCH: Resultado final:', result);

      return result;
    } catch (error) {
      // Solo loguear errores de red/conexión, no errores de API
      if (error instanceof Error && error.name !== 'ApiError') {
        console.error('🌐 PATCH: Error de conexión:', error);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en http://localhost:3050');
      }

      throw error;
    }
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getDefaultHeaders(),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('HTTP DELETE Error:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor');
      }

      throw error;
    }
  }
} 