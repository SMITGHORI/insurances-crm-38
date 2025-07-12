
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { policiesApi } from '../services/api/policiesApi';
import { toast } from 'sonner';

// Query keys for policies
export const policiesQueryKeys = {
  all: ['policies'],
  lists: () => [...policiesQueryKeys.all, 'list'],
  list: (filters) => [...policiesQueryKeys.lists(), { filters }],
  details: () => [...policiesQueryKeys.all, 'detail'],
  detail: (id) => [...policiesQueryKeys.details(), id],
  documents: (id) => [...policiesQueryKeys.all, 'documents', id],
  payments: (id) => [...policiesQueryKeys.all, 'payments', id],
  notes: (id) => [...policiesQueryKeys.all, 'notes', id],
  stats: () => [...policiesQueryKeys.all, 'stats'],
  expiring: (days) => [...policiesQueryKeys.all, 'expiring', days],
  renewals: (days) => [...policiesQueryKeys.all, 'renewals', days],
};

// Get all policies with filters
export const usePolicies = (params = {}) => {
  return useQuery({
    queryKey: policiesQueryKeys.list(params),
    queryFn: async () => {
      try {
        console.log('Fetching policies with params:', params);
        const result = await policiesApi.getPolicies(params);
        console.log('Policies fetched successfully:', result);
        
        // Handle both paginated and non-paginated responses
        if (result.success && result.data) {
          return {
            data: result.data,
            pagination: result.pagination || null,
            total: result.pagination?.totalItems || result.data.length
          };
        }
        
        return { data: [], pagination: null, total: 0 };
      } catch (error) {
        console.error('Error fetching policies:', error);
        toast.error('Failed to fetch policies');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Get single policy by ID
export const usePolicy = (id) => {
  return useQuery({
    queryKey: policiesQueryKeys.detail(id),
    queryFn: async () => {
      try {
        const result = await policiesApi.getPolicyById(id);
        return result.success ? result.data : result;
      } catch (error) {
        console.error('Error fetching policy:', error);
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });
};

// Policy statistics
export const usePolicyStats = () => {
  return useQuery({
    queryKey: policiesQueryKeys.stats(),
    queryFn: async () => {
      try {
        const result = await policiesApi.getPolicyStats();
        return result.success ? result.data : result;
      } catch (error) {
        console.error('Error fetching policy stats:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};

// Create policy mutation
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (policyData) => {
      const result = await policiesApi.createPolicy(policyData);
      return result.success ? result.data : result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      toast.success('Policy created successfully');
      console.log('Policy created successfully:', data);
    },
    onError: (error) => {
      console.error('Create policy error:', error);
      toast.error(`Failed to create policy: ${error.message}`);
    }
  });
};

// Update policy mutation
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, policyData }) => {
      const result = await policiesApi.updatePolicy(id, policyData);
      return result.success ? result.data : result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.id) });
      toast.success('Policy updated successfully');
      console.log('Policy updated successfully:', data);
    },
    onError: (error) => {
      console.error('Update policy error:', error);
      toast.error(`Failed to update policy: ${error.message}`);
    }
  });
};

// Delete policy mutation
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const result = await policiesApi.deletePolicy(id);
      return result.success ? result.data : result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      toast.success('Policy deleted successfully');
      console.log('Policy deleted successfully');
    },
    onError: (error) => {
      console.error('Delete policy error:', error);
      toast.error(`Failed to delete policy: ${error.message}`);
    }
  });
};

// Search policies
export const useSearchPolicies = () => {
  return useMutation({
    mutationFn: async ({ query, limit }) => {
      const result = await policiesApi.searchPolicies(query, limit);
      return result.success ? result.data : result;
    },
  });
};

// Get expiring policies
export const useExpiringPolicies = (days = 30) => {
  return useQuery({
    queryKey: policiesQueryKeys.expiring(days),
    queryFn: async () => {
      try {
        const result = await policiesApi.getExpiringPolicies(days);
        return result.success ? result.data : result;
      } catch (error) {
        console.error('Error fetching expiring policies:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get policies due for renewal
export const usePoliciesDueForRenewal = (days = 30) => {
  return useQuery({
    queryKey: policiesQueryKeys.renewals(days),
    queryFn: async () => {
      try {
        const result = await policiesApi.getPoliciesDueForRenewal(days);
        return result.success ? result.data : result;
      } catch (error) {
        console.error('Error fetching renewal policies:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Upload document mutation
export const useUploadPolicyDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, documentType, file, name }) => 
      policiesApi.uploadDocument(policyId, documentType, file, name),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.documents(variables.policyId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload document error:', error);
      toast.error('Failed to upload document');
    }
  });
};

// Get policy documents
export const usePolicyDocuments = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.documents(policyId),
    queryFn: async () => {
      const result = await policiesApi.getPolicyDocuments(policyId);
      return result.success ? result.data : result;
    },
    enabled: !!policyId,
  });
};

// Add payment mutation
export const useAddPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, paymentData }) => 
      policiesApi.addPayment(policyId, paymentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.payments(variables.policyId) });
      toast.success('Payment record added successfully');
    },
    onError: (error) => {
      console.error('Add payment error:', error);
      toast.error('Failed to add payment record');
    }
  });
};

// Get payment history
export const usePaymentHistory = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.payments(policyId),
    queryFn: async () => {
      const result = await policiesApi.getPaymentHistory(policyId);
      return result.success ? result.data : result;
    },
    enabled: !!policyId,
  });
};

// Renew policy mutation
export const useRenewPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, renewalData }) => 
      policiesApi.renewPolicy(policyId, renewalData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      toast.success('Policy renewed successfully');
    },
    onError: (error) => {
      console.error('Renew policy error:', error);
      toast.error('Failed to renew policy');
    }
  });
};

// Add note mutation
export const useAddPolicyNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, noteData }) => 
      policiesApi.addNote(policyId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.notes(variables.policyId) });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    }
  });
};

// Get policy notes
export const usePolicyNotes = (policyId) => {
  return useQuery({
    queryKey: policiesQueryKeys.notes(policyId),
    queryFn: async () => {
      const result = await policiesApi.getPolicyNotes(policyId);
      return result.success ? result.data : result;
    },
    enabled: !!policyId,
  });
};

// Export policies
export const useExportPolicies = () => {
  return useMutation({
    mutationFn: (filters) => policiesApi.exportPolicies(filters),
    onSuccess: () => {
      toast.success('Policies exported successfully');
      console.log('Policies exported successfully');
    },
    onError: (error) => {
      console.error('Export policies error:', error);
      toast.error('Failed to export policies');
    }
  });
};

// Assign policy to agent
export const useAssignPolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyId, agentId }) => 
      policiesApi.assignPolicyToAgent(policyId, agentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.detail(variables.policyId) });
      toast.success('Policy assigned successfully');
    },
    onError: (error) => {
      console.error('Assign policy error:', error);
      toast.error('Failed to assign policy');
    }
  });
};

// Bulk assign policies
export const useBulkAssignPolicies = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ policyIds, agentId }) => 
      policiesApi.bulkAssignPolicies(policyIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: policiesQueryKeys.all });
      toast.success('Policies assigned successfully');
    },
    onError: (error) => {
      console.error('Bulk assign policies error:', error);
      toast.error('Failed to assign policies');
    }
  });
};
