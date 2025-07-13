
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.js';
import { toast } from 'sonner';

/**
 * Quotations API Service with MongoDB Integration
 * Connects to Node.js + Express + MongoDB backend
 */
class QuotationsApiService {
  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.QUOTATIONS}`;
    this.isOfflineMode = false;
  }

  /**
   * Generic API request handler with error handling
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
      const response = await fetch(url, config);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('API Request failed:', error.message);
      this.isOfflineMode = !navigator.onLine;
      throw error;
    }
  }

  /**
   * Get all quotations with filtering and pagination
   */
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filtering parameters
    if (params.search) queryParams.append('search', params.search);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.insuranceType && params.insuranceType !== 'all') queryParams.append('insuranceType', params.insuranceType);
    if (params.agentId && params.agentId !== 'all') queryParams.append('agentId', params.agentId);
    if (params.clientId && params.clientId !== 'all') queryParams.append('clientId', params.clientId);
    
    // Add sorting parameters
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    // Add date range parameters
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.validFrom) queryParams.append('validFrom', params.validFrom);
    if (params.validTo) queryParams.append('validTo', params.validTo);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';

    const response = await this.makeRequest(endpoint);
    
    return {
      quotations: response.data.quotations,
      totalCount: response.data.pagination.totalCount,
      pagination: response.data.pagination,
      success: true
    };
  }

  async getQuotations(params = {}) {
    return this.getAll(params);
  }

  async getById(quotationId) {
    const response = await this.makeRequest(`/${quotationId}`);
    return response.data;
  }

  async getQuotationById(quotationId) {
    return this.getById(quotationId);
  }

  async create(quotationData) {
    const response = await this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(quotationData),
    });
    return response.data;
  }

  async createQuotation(quotationData) {
    return this.create(quotationData);
  }

  async update(quotationId, quotationData) {
    const response = await this.makeRequest(`/${quotationId}`, {
      method: 'PUT',
      body: JSON.stringify(quotationData),
    });
    return response.data;
  }

  async updateQuotation(quotationId, quotationData) {
    return this.update(quotationId, quotationData);
  }

  async delete(quotationId) {
    const response = await this.makeRequest(`/${quotationId}`, {
      method: 'DELETE',
    });
    return response;
  }

  async deleteQuotation(quotationId) {
    return this.delete(quotationId);
  }

  async sendQuotation(quotationId, emailData) {
    const response = await this.makeRequest(`/${quotationId}/send`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
    return response.data;
  }

  async updateQuotationStatus(quotationId, status, additionalData = {}) {
    const response = await this.makeRequest(`/${quotationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...additionalData }),
    });
    return response.data;
  }

  async convertToPolicy(quotationId, policyData) {
    return this.makeRequest(`/${quotationId}/convert`, {
      method: 'POST',
      body: JSON.stringify(policyData)
    });
  }

  async getQuotationsStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append('period', params.period);
    if (params.agentId) queryParams.append('agentId', params.agentId);

    const queryString = queryParams.toString();
    const endpoint = `/stats${queryString ? `?${queryString}` : ''}`;

    const response = await this.makeRequest(endpoint);
    return response.data;
  }

  async searchQuotations(query, limit = 10) {
    const response = await this.makeRequest(`/search/${encodeURIComponent(query)}?limit=${limit}`);
    return response.data;
  }

  async exportQuotations(exportParams) {
    const response = await this.makeRequest('/export', {
      method: 'POST',
      body: JSON.stringify(exportParams),
    });
    return response.data;
  }
}

export const quotationsApi = new QuotationsApiService();
export default quotationsApi;
