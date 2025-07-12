
import { toast } from 'sonner';

// Base API configuration for your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Consolidated Agents API Service for MongoDB Backend Integration
 * Handles all agent-related API operations with proper error handling
 */
class AgentsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/agents`;
  }

  /**
   * Generic API request handler with error handling and auth
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      throw error;
    }
  }

  /**
   * Get all agents with filtering, pagination, and search
   */
  async getAgents(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.region) queryParams.append('region', params.region);
    if (params.teamId) queryParams.append('teamId', params.teamId);
    
    // Add sorting parameters
    if (params.sortField) queryParams.append('sortField', params.sortField);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.request(endpoint);
    
    return {
      data: response.data || response.agents || [],
      total: response.pagination?.totalItems || response.total || 0,
      totalPages: response.pagination?.totalPages || response.totalPages || 1,
      currentPage: response.pagination?.currentPage || response.currentPage || 1,
      success: true
    };
  }

  /**
   * Get a single agent by ID
   */
  async getAgentById(id) {
    const response = await this.request(`/${id}`);
    return response.data || response;
  }

  /**
   * Create a new agent
   */
  async createAgent(agentData) {
    const response = await this.request('', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });

    return response.data || response;
  }

  /**
   * Update an existing agent
   */
  async updateAgent(id, agentData) {
    const response = await this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });

    return response.data || response;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(id) {
    const response = await this.request(`/${id}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Get agent's clients
   */
  async getAgentClients(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/clients${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }

  /**
   * Get agent's policies
   */
  async getAgentPolicies(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/policies${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }

  /**
   * Get agent's commissions
   */
  async getAgentCommissions(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/commissions${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }

  /**
   * Get agent's performance data
   */
  async getAgentPerformance(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.period) queryParams.append('period', params.period);
    if (params.year) queryParams.append('year', params.year);
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/performance${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }

  /**
   * Get agent's commission summary
   */
  async getAgentCommissionSummary(agentId, params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.period) queryParams.append('period', params.period);
    
    const queryString = queryParams.toString();
    const endpoint = `/${agentId}/commissions/summary${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }

  /**
   * Upload agent document
   */
  async uploadDocument(agentId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    const response = await this.request(`/${agentId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });

    return response.data || response;
  }

  /**
   * Get agent documents
   */
  async getAgentDocuments(agentId) {
    const response = await this.request(`/${agentId}/documents`);
    return response.data || response;
  }

  /**
   * Delete agent document
   */
  async deleteDocument(agentId, documentId) {
    const response = await this.request(`/${agentId}/documents/${documentId}`, {
      method: 'DELETE',
    });

    return response;
  }

  /**
   * Add note to agent
   */
  async addNote(agentId, noteData) {
    const response = await this.request(`/${agentId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });

    return response.data || response;
  }

  /**
   * Get agent notes
   */
  async getAgentNotes(agentId) {
    const response = await this.request(`/${agentId}/notes`);
    return response.data || response;
  }

  /**
   * Update agent performance targets
   */
  async updatePerformanceTargets(agentId, targetsData) {
    const response = await this.request(`/${agentId}/targets`, {
      method: 'PUT',
      body: JSON.stringify(targetsData),
    });

    return response.data || response;
  }

  /**
   * Search agents
   */
  async searchAgents(query, limit = 10) {
    const response = await this.request(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data || response;
  }

  /**
   * Get agents statistics
   */
  async getAgentStats() {
    const response = await this.request('/stats/summary');
    return response.data || response;
  }

  /**
   * Export agents data
   */
  async exportAgents(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) queryParams.append(key, filters[key]);
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;

    const response = await this.request(endpoint);
    return response.data || response;
  }
}

// Export singleton instance
export const agentsApi = new AgentsApiService();
export default agentsApi;
