
import { API_CONFIG } from '../../config/api';

/**
 * Base API service class with common functionality
 */
class BaseApiService {
  constructor(baseEndpoint) {
    this.baseURL = `${API_CONFIG.BASE_URL}${baseEndpoint}`;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint = '', options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      console.log(`API Response:`, responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      
      // Handle auth errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        localStorage.removeItem('authToken');
        window.location.href = '/auth';
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint = '', params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post(endpoint = '', data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint = '', data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint = '') {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create service instances for different modules
export const clientsApi = new BaseApiService('/clients');
export const leadsApi = new BaseApiService('/leads');
export const quotationsApi = new BaseApiService('/quotations');
export const policiesApi = new BaseApiService('/policies');
export const claimsApi = new BaseApiService('/claims');
export const offersApi = new BaseApiService('/offers');
export const agentsApi = new BaseApiService('/agents');
export const reportsApi = new BaseApiService('/reports');
export const settingsApi = new BaseApiService('/settings');

export default BaseApiService;
