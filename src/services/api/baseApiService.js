
/**
 * Base API Service for MongoDB backend integration
 */
class BaseApiService {
  constructor(baseEndpoint) {
    this.baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}${baseEndpoint}`;
  }

  async makeRequest(endpoint = '', options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      throw error;
    }
  }

  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    return this.makeRequest(endpoint);
  }

  async getById(id) {
    return this.makeRequest(`/${id}`);
  }

  async create(data) {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id, data) {
    return this.makeRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id) {
    return this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export default BaseApiService;
