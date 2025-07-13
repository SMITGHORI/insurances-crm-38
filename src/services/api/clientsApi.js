
import { toast } from 'sonner';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.js';

// Base API configuration for MongoDB backend
const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Unified Clients API Service for MongoDB Integration
 * Connects directly to Node.js + Express + MongoDB backend
 */
class ClientsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}${API_ENDPOINTS.CLIENTS}`;
  }

  /**
   * Generic API request handler with proper error handling
   */
  async makeRequest(endpoint, options = {}) {
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
      console.log(`Making API request to MongoDB: ${url}`, config);
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      console.log('MongoDB API response:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('MongoDB API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all clients with filtering and pagination
   */
  async getClients(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params.status && params.status !== 'All') queryParams.append('status', params.status);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.makeRequest(endpoint);
    
    return {
      data: response.data,
      total: response.pagination?.totalItems || response.total || 0,
      totalPages: response.pagination?.totalPages || response.totalPages || 1,
      currentPage: response.pagination?.currentPage || response.currentPage || 1,
      success: true
    };
  }

  /**
   * Get a single client by ID
   */
  async getClientById(id) {
    const response = await this.makeRequest(`/${id}`);
    return response.data;
  }

  /**
   * Create a new client
   */
  async createClient(clientData) {
    const response = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });

    return response.data;
  }

  /**
   * Update an existing client
   */
  async updateClient(clientId, clientData) {
    const response = await this.makeRequest(`/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });

    return response.data;
  }

  /**
   * Delete a client
   */
  async deleteClient(id) {
    const response = await this.makeRequest(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Search clients
   */
  async searchClients(query, limit = 10) {
    const response = await this.makeRequest(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  /**
   * Get clients by agent
   */
  async getClientsByAgent(agentId) {
    const response = await this.makeRequest(`/agent/${agentId}`);
    return response.data;
  }

  /**
   * Assign client to agent
   */
  async assignClientToAgent(clientId, agentId) {
    const response = await this.makeRequest(`/${clientId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agentId }),
    });

    return response.data;
  }

  /**
   * Get client statistics
   */
  async getClientStats() {
    const response = await this.makeRequest('/stats/summary');
    return response.data;
  }

  /**
   * Export clients data
   */
  async exportClients(exportData) {
    const response = await this.makeRequest('/export', {
      method: 'POST',
      body: JSON.stringify(exportData),
    });

    return response;
  }

  /**
   * Bulk operations
   */
  async bulkUpdateClients(clientIds, updateData) {
    return this.makeRequest('/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ clientIds, updateData })
    });
  }

  async bulkDeleteClients(clientIds) {
    return this.makeRequest('/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ clientIds })
    });
  }

  /**
   * Document operations
   */
  async uploadDocument(clientId, documentType, file) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    const response = await this.makeRequest(`/${clientId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    return response.data;
  }

  async getClientDocuments(clientId) {
    const response = await this.makeRequest(`/${clientId}/documents`);
    return response.data;
  }

  async deleteDocument(clientId, documentId) {
    const response = await this.makeRequest(`/${clientId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Notes operations
   */
  async addClientNote(clientId, noteData) {
    return this.makeRequest(`/${clientId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  }

  async getClientNotes(clientId) {
    const response = await this.makeRequest(`/${clientId}/notes`);
    return response.data;
  }

  async updateClientNote(clientId, noteId, noteData) {
    return this.makeRequest(`/${clientId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData)
    });
  }

  async deleteClientNote(clientId, noteId) {
    return this.makeRequest(`/${clientId}/notes/${noteId}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const clientsApi = new ClientsApiService();
export default clientsApi;
