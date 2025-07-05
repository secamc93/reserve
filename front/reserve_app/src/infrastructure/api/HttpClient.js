// Infrastructure - HTTP Client
export class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async get(endpoint, params = {}) {
    const url = new URL(endpoint, this.baseURL);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log('Making GET request to:', url.toString());

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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