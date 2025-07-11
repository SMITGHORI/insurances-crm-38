
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// API endpoints configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API service functions
const invoicesBackendApi = {
  // Get all invoices with filtering and pagination
  getInvoices: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/invoices?${queryString}` : '/invoices';
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get single invoice by ID
  getInvoiceById: async (invoiceId) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create invoice');
    }
    
    return response.json();
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update invoice');
    }
    
    return response.json();
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invoice');
    }
    
    return response.json();
  },

  // Send invoice via email
  sendInvoice: async (invoiceId, emailData) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send invoice');
    }
    
    return response.json();
  },

  // Mark invoice as paid
  markAsPaid: async (invoiceId, paymentData = {}) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/mark-paid`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark invoice as paid');
    }
    
    return response.json();
  },

  // Get invoice statistics
  getInvoiceStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/invoices/stats?${queryString}` : '/invoices/stats';
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get overdue invoices
  getOverdueInvoices: async () => {
    const response = await fetch(`${API_BASE_URL}/invoices/overdue`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Bulk operations
  bulkUpdateInvoices: async (invoiceIds, updateData) => {
    const response = await fetch(`${API_BASE_URL}/invoices/bulk-update`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoiceIds, updateData }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to bulk update invoices');
    }
    
    return response.json();
  },

  // Export invoices
  exportInvoices: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/invoices/export?${queryString}` : '/invoices/export';
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.blob();
  }
};

// Query keys for cache management
export const invoicesBackendQueryKeys = {
  all: ['invoices-backend'],
  lists: () => [...invoicesBackendQueryKeys.all, 'list'],
  list: (params) => [...invoicesBackendQueryKeys.lists(), params],
  details: () => [...invoicesBackendQueryKeys.all, 'detail'],
  detail: (id) => [...invoicesBackendQueryKeys.details(), id],
  stats: () => [...invoicesBackendQueryKeys.all, 'stats'],
  overdue: () => [...invoicesBackendQueryKeys.all, 'overdue'],
};

// Custom hooks
export const useInvoicesBackend = (params = {}) => {
  return useQuery({
    queryKey: invoicesBackendQueryKeys.list(params),
    queryFn: () => invoicesBackendApi.getInvoices(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    },
  });
};

export const useInvoiceBackend = (invoiceId) => {
  return useQuery({
    queryKey: invoicesBackendQueryKeys.detail(invoiceId),
    queryFn: () => invoicesBackendApi.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching invoice:', error);
      toast.error('Failed to load invoice details');
    },
  });
};

export const useCreateInvoiceBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesBackendApi.createInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success(`Invoice "${data.data.invoiceNumber}" created successfully`);
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
      toast.error(`Failed to create invoice: ${error.message}`);
    },
  });
};

export const useUpdateInvoiceBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, invoiceData }) => invoicesBackendApi.updateInvoice(id, invoiceData),
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.setQueryData(invoicesBackendQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success(`Invoice "${data.data.invoiceNumber}" updated successfully`);
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
      toast.error(`Failed to update invoice: ${error.message}`);
    },
  });
};

export const useDeleteInvoiceBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoicesBackendApi.deleteInvoice,
    onSuccess: (data, invoiceId) => {
      queryClient.removeQueries({ queryKey: invoicesBackendQueryKeys.detail(invoiceId) });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success('Invoice deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting invoice:', error);
      toast.error(`Failed to delete invoice: ${error.message}`);
    },
  });
};

export const useSendInvoiceBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, emailData }) => invoicesBackendApi.sendInvoice(invoiceId, emailData),
    onSuccess: (data, variables) => {
      const { invoiceId } = variables;
      queryClient.setQueryData(invoicesBackendQueryKeys.detail(invoiceId), data);
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success('Invoice sent successfully');
    },
    onError: (error) => {
      console.error('Error sending invoice:', error);
      toast.error(`Failed to send invoice: ${error.message}`);
    },
  });
};

export const useMarkInvoiceAsPaidBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, paymentData }) => invoicesBackendApi.markAsPaid(invoiceId, paymentData),
    onSuccess: (data, variables) => {
      const { invoiceId } = variables;
      queryClient.setQueryData(invoicesBackendQueryKeys.detail(invoiceId), data);
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      console.error('Error marking invoice as paid:', error);
      toast.error(`Failed to mark invoice as paid: ${error.message}`);
    },
  });
};

export const useInvoiceStatsBackend = (params = {}) => {
  return useQuery({
    queryKey: [...invoicesBackendQueryKeys.stats(), params],
    queryFn: () => invoicesBackendApi.getInvoiceStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching invoice stats:', error);
      toast.error('Failed to load invoice statistics');
    },
  });
};

export const useOverdueInvoicesBackend = () => {
  return useQuery({
    queryKey: invoicesBackendQueryKeys.overdue(),
    queryFn: invoicesBackendApi.getOverdueInvoices,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching overdue invoices:', error);
      toast.error('Failed to load overdue invoices');
    },
  });
};

export const useBulkUpdateInvoicesBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceIds, updateData }) => invoicesBackendApi.bulkUpdateInvoices(invoiceIds, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invoicesBackendQueryKeys.stats() });
      toast.success(`${data.data.modifiedCount} invoices updated successfully`);
    },
    onError: (error) => {
      console.error('Error bulk updating invoices:', error);
      toast.error(`Failed to bulk update invoices: ${error.message}`);
    },
  });
};

export const useExportInvoicesBackend = () => {
  return useMutation({
    mutationFn: invoicesBackendApi.exportInvoices,
    onSuccess: (blob, params) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoices exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting invoices:', error);
      toast.error(`Failed to export invoices: ${error.message}`);
    },
  });
};

export default {
  useInvoicesBackend,
  useInvoiceBackend,
  useCreateInvoiceBackend,
  useUpdateInvoiceBackend,
  useDeleteInvoiceBackend,
  useSendInvoiceBackend,
  useMarkInvoiceAsPaidBackend,
  useInvoiceStatsBackend,
  useOverdueInvoicesBackend,
  useBulkUpdateInvoicesBackend,
  useExportInvoicesBackend,
};
