
import { toast } from 'sonner';

// Base API configuration for Express backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Consolidated Claims API service for MongoDB integration
 * Connects directly to Node.js + Express + MongoDB backend
 */
class ClaimsApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/claims`;
  }

  /**
   * Make HTTP request with comprehensive error handling
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
      console.log(`Making request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Response from ${url}:`, data);
      return data;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      throw error;
    }
  }

  // Core CRUD operations
  async getClaims(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== 'all') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request(endpoint);
  }

  async getClaimById(claimId) {
    return this.request(`/${claimId}`);
  }

  async createClaim(claimData) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  }

  async updateClaim(claimId, claimData) {
    return this.request(`/${claimId}`, {
      method: 'PUT',
      body: JSON.stringify(claimData),
    });
  }

  async deleteClaim(claimId) {
    return this.request(`/${claimId}`, {
      method: 'DELETE',
    });
  }

  // Status operations
  async updateClaimStatus(claimId, statusData) {
    return this.request(`/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Document operations
  async uploadDocument(claimId, documentType, file, name) {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);

    return this.request(`/${claimId}/documents`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getClaimDocuments(claimId) {
    return this.request(`/${claimId}/documents`);
  }

  async deleteDocument(claimId, documentId) {
    return this.request(`/${claimId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Note operations
  async addNote(claimId, noteData) {
    return this.request(`/${claimId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getClaimNotes(claimId) {
    return this.request(`/${claimId}/notes`);
  }

  // Search and filtering
  async searchClaims(query, limit = 20) {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    return this.request(`/search/${encodeURIComponent(query)}?${queryParams.toString()}`);
  }

  // Statistics and reports
  async getClaimsStats(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/stats/summary${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getDashboardStats() {
    return this.request('/stats/dashboard');
  }

  async getClaimsAgingReport() {
    return this.request('/reports/aging');
  }

  async getSettlementReport() {
    return this.request('/reports/settlement');
  }

  // Bulk operations
  async bulkUpdateClaims(claimIds, updateData) {
    return this.request('/bulk/update', {
      method: 'POST',
      body: JSON.stringify({ claimIds, updateData }),
    });
  }

  async bulkAssignClaims(claimIds, agentId) {
    return this.request('/bulk/assign', {
      method: 'POST',
      body: JSON.stringify({ claimIds, agentId }),
    });
  }

  // Export and import
  async exportClaims(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== 'all') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/export${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async importClaims(file) {
    const formData = new FormData();
    formData.append('importFile', file);

    return this.request('/import', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Form data
  async getPoliciesForClaim() {
    return this.request('/form-data/policies');
  }

  async getClientsForClaim() {
    return this.request('/form-data/clients');
  }

  async getPolicyDetails(policyId) {
    return this.request(`/form-data/policy/${policyId}`);
  }

  // Additional operations
  async getClaimTimeline(claimId) {
    return this.request(`/${claimId}/timeline`);
  }

  async processPayment(claimId, paymentData) {
    return this.request(`/${claimId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

// Export singleton instance
export const claimsApi = new ClaimsApiService();
export default claimsApi;
