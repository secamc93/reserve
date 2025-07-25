// Infrastructure - HTTP Client
export class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Returns default headers for every request including the Authorization header
   * if an authToken exists in localStorage.
   */
  getDefaultHeaders() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
  }

  async get(endpoint, params = {}) {
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
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifique que la API esté ejecutándose en http://localhost:3050');
      }

      if (error.name === 'SyntaxError') {
        throw new Error('Respuesta inválida del servidor');
      }

      throw error;
    }
  }

  // ✅ NUEVO: Método para limpiar parámetros según el endpoint
  cleanParams(params, endpoint) {
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
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(data),
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
      console.error('HTTP POST Error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor');
      }

      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(data),
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
      console.error('HTTP PUT Error:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor');
      }

      throw error;
    }
  }

  async patch(endpoint, data = {}) {
    try {
      console.log('🌐 PATCH: Iniciando request PATCH');
      console.log('🌐 PATCH: Endpoint:', endpoint);
      console.log('🌐 PATCH: Data:', data);
      console.log('🌐 PATCH: URL completa:', `${this.baseURL}${endpoint}`);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getDefaultHeaders(),
        body: JSON.stringify(data),
      });

      console.log('🌐 PATCH: Response recibida');
      console.log('🌐 PATCH: Status:', response.status);
      console.log('🌐 PATCH: StatusText:', response.statusText);
      console.log('🌐 PATCH: Headers:', response.headers);

      if (!response.ok) {
        console.log('🌐 PATCH: Response no OK, procesando error');

        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('🌐 PATCH: Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('🌐 PATCH: No se pudo parsear error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      console.log('🌐 PATCH: Parseando respuesta JSON');
      const result = await response.json();
      console.log('🌐 PATCH: Resultado final:', result);

      return result;
    } catch (error) {
      console.error('🌐 PATCH: ERROR CAPTURADO');
      console.error('🌐 PATCH: Error name:', error.name);
      console.error('🌐 PATCH: Error message:', error.message);
      console.error('🌐 PATCH: Error stack:', error.stack);
      console.error('🌐 PATCH: Error completo:', error);

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 PATCH: Es un error de TypeError con fetch');
        throw new Error('No se pudo conectar con el servidor');
      }

      console.error('🌐 PATCH: Relanzando error original');
      throw error;
    }
  }

  async delete(endpoint) {
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

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor');
      }

      throw error;
    }
  }
} 