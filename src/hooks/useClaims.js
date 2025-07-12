
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { claimsApi } from '../services/api/claimsApi';

// Query keys for cache management
export const claimsQueryKeys = {
  all: ['claims'],
  lists: () => [...claimsQueryKeys.all, 'list'],
  list: (params) => [...claimsQueryKeys.lists(), params],
  details: () => [...claimsQueryKeys.all, 'detail'],
  detail: (id) => [...claimsQueryKeys.details(), id],
  documents: (id) => [...claimsQueryKeys.detail(id), 'documents'],
  notes: (id) => [...claimsQueryKeys.detail(id), 'notes'],
  timeline: (id) => [...claimsQueryKeys.detail(id), 'timeline'],
  stats: () => [...claimsQueryKeys.all, 'stats'],
  dashboardStats: () => [...claimsQueryKeys.stats(), 'dashboard'],
  search: (query) => [...claimsQueryKeys.all, 'search', query],
  formData: () => [...claimsQueryKeys.all, 'formData'],
};

// Query hooks for fetching data
export const useClaims = (params = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.list(params),
    queryFn: () => claimsApi.getClaims(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claims from MongoDB:', error);
      toast.error('Failed to load claims from database');
    },
  });
};

export const useClaim = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.detail(claimId),
    queryFn: () => claimsApi.getClaimById(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim from MongoDB:', error);
      toast.error('Failed to load claim details from database');
    },
  });
};

export const useClaimDocuments = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.documents(claimId),
    queryFn: () => claimsApi.getClaimDocuments(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim documents from MongoDB:', error);
      toast.error('Failed to load claim documents from database');
    },
  });
};

export const useClaimNotes = (claimId) => {
  return useQuery({
    queryKey: claimsQueryKeys.notes(claimId),
    queryFn: () => claimsApi.getClaimNotes(claimId),
    enabled: !!claimId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claim notes from MongoDB:', error);
      toast.error('Failed to load claim notes from database');
    },
  });
};

export const useClaimsStats = (params = {}) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.stats(), params],
    queryFn: () => claimsApi.getClaimsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching claims stats from MongoDB:', error);
      toast.error('Failed to load claims statistics from database');
    },
  });
};

export const useClaimsDashboardStats = () => {
  return useQuery({
    queryKey: claimsQueryKeys.dashboardStats(),
    queryFn: () => claimsApi.getDashboardStats(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching dashboard stats from MongoDB:', error);
      toast.error('Failed to load dashboard statistics from database');
    },
  });
};

export const useSearchClaims = (query, options = {}) => {
  return useQuery({
    queryKey: claimsQueryKeys.search(query),
    queryFn: () => claimsApi.searchClaims(query, options.limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error('Error searching claims in MongoDB:', error);
      toast.error('Failed to search claims in database');
    },
  });
};

// Mutation hooks for data manipulation
export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData) => claimsApi.createClaim(claimData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claim created successfully');
      console.log('Claim created successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error creating claim in MongoDB:', error);
      toast.error(`Failed to create claim: ${error.message}`);
    },
  });
};

export const useUpdateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimData }) => claimsApi.updateClaim(id, claimData),
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.setQueryData(claimsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claim updated successfully');
      console.log('Claim updated successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error updating claim in MongoDB:', error);
      toast.error(`Failed to update claim: ${error.message}`);
    },
  });
};

export const useDeleteClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId) => claimsApi.deleteClaim(claimId),
    onSuccess: (data, claimId) => {
      queryClient.removeQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claim deleted successfully');
      console.log('Claim deleted successfully from MongoDB');
    },
    onError: (error) => {
      console.error('Error deleting claim from MongoDB:', error);
      toast.error(`Failed to delete claim: ${error.message}`);
    },
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, status, reason, approvedAmount }) => 
      claimsApi.updateClaimStatus(claimId, { status, reason, approvedAmount }),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      queryClient.setQueryData(claimsQueryKeys.detail(claimId), data);
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claim status updated successfully');
      console.log('Claim status updated successfully in MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error updating claim status in MongoDB:', error);
      toast.error(`Failed to update claim status: ${error.message}`);
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file, name }) => 
      claimsApi.uploadDocument(claimId, documentType, file, name),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      toast.success('Document uploaded successfully');
      console.log('Document uploaded successfully to MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error uploading document to MongoDB:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentId }) => 
      claimsApi.deleteDocument(claimId, documentId),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.documents(claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      toast.success('Document deleted successfully');
      console.log('Document deleted successfully from MongoDB');
    },
    onError: (error) => {
      console.error('Error deleting document from MongoDB:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, noteData }) => claimsApi.addNote(claimId, noteData),
    onSuccess: (data, variables) => {
      const { claimId } = variables;
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.notes(claimId) });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.detail(claimId) });
      toast.success('Note added successfully');
      console.log('Note added successfully to MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error adding note to MongoDB:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

export const useBulkUpdateClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, updateData }) => 
      claimsApi.bulkUpdateClaims(claimIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claims updated successfully');
      console.log('Claims bulk updated successfully in MongoDB');
    },
    onError: (error) => {
      console.error('Error bulk updating claims in MongoDB:', error);
      toast.error(`Failed to update claims: ${error.message}`);
    },
  });
};

export const useBulkAssignClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, agentId }) => 
      claimsApi.bulkAssignClaims(claimIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      toast.success('Claims assigned successfully');
      console.log('Claims bulk assigned successfully in MongoDB');
    },
    onError: (error) => {
      console.error('Error bulk assigning claims in MongoDB:', error);
      toast.error(`Failed to assign claims: ${error.message}`);
    },
  });
};

export const useExportClaims = () => {
  return useMutation({
    mutationFn: (filters) => claimsApi.exportClaims(filters),
    onSuccess: (data) => {
      console.log('Claims exported successfully from MongoDB:', data);
    },
    onError: (error) => {
      console.error('Error exporting claims from MongoDB:', error);
      toast.error(`Failed to export claims: ${error.message}`);
    },
  });
};

export const useImportClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => claimsApi.importClaims(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: claimsQueryKeys.dashboardStats() });
      toast.success('Claims imported successfully');
      console.log('Claims imported successfully to MongoDB');
    },
    onError: (error) => {
      console.error('Error importing claims to MongoDB:', error);
      toast.error(`Failed to import claims: ${error.message}`);
    },
  });
};

// Form data hooks
export const usePoliciesForClaim = () => {
  return useQuery({
    queryKey: [...claimsQueryKeys.formData(), 'policies'],
    queryFn: () => claimsApi.getPoliciesForClaim(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policies for claim from MongoDB:', error);
      toast.error('Failed to load policies from database');
    },
  });
};

export const useClientsForClaim = () => {
  return useQuery({
    queryKey: [...claimsQueryKeys.formData(), 'clients'],
    queryFn: () => claimsApi.getClientsForClaim(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching clients for claim from MongoDB:', error);
      toast.error('Failed to load clients from database');
    },
  });
};

export const usePolicyDetailsForClaim = (policyId) => {
  return useQuery({
    queryKey: [...claimsQueryKeys.formData(), 'policy', policyId],
    queryFn: () => claimsApi.getPolicyDetails(policyId),
    enabled: !!policyId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching policy details for claim from MongoDB:', error);
      toast.error('Failed to load policy details from database');
    },
  });
};
