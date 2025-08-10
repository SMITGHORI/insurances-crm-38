// API Service Index
// This file exports all API services for the different modules

export { default as authApi } from './auth';
export { default as usersApi } from './users';
export { default as clientsApi } from './clients';
export { default as policiesApi } from './policies';
export { default as claimsApi } from './claims';
export { default as agentsApi } from './agents';
export { default as reportsApi } from './reports';
export { default as settingsApi } from './settings';
export { default as dashboardApi } from './dashboard';

// Base API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Common API utilities
export const createApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const createApiHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API error handling
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Request interceptor for authentication
export const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      ...createApiHeaders(token),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.message.includes('401')) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

// Common HTTP methods
export const apiGet = (url, options = {}) => 
  apiRequest(url, { ...options, method: 'GET' });

export const apiPost = (url, data, options = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const apiPut = (url, data, options = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });

export const apiPatch = (url, data, options = {}) => 
  apiRequest(url, { 
    ...options, 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  });

export const apiDelete = (url, options = {}) => 
  apiRequest(url, { ...options, method: 'DELETE' });

// File upload helper
export const apiUpload = async (url, file, options = {}) => {
  const token = localStorage.getItem('token');
  
  const formData = new FormData();
  formData.append('file', file);
  
  const config = {
    ...options,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: formData,
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    if (error.message.includes('401')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
};

// Pagination helper
export const createPaginationParams = (page = 1, limit = 25, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

// Search helper
export const createSearchParams = (searchTerm, additionalParams = {}) => {
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

// Date range helper
export const createDateRangeParams = (startDate, endDate, additionalParams = {}) => {
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append('startDate', startDate);
  }
  
  if (endDate) {
    params.append('endDate', endDate);
  }
  
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

// Export all utilities
export default {
  API_BASE_URL,
  createApiUrl,
  handleApiResponse,
  createApiHeaders,
  ApiError,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  createPaginationParams,
  createSearchParams,
  createDateRangeParams,
};
