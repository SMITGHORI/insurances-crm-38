
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import claimsBackendApi from '../services/api/claimsApiBackend';
import { toast } from 'sonner';

// Query hooks for fetching data
export const useClaims = (params = {}) => {
  return useQuery({
    queryKey: ['claims', params],
    queryFn: () => claimsBackendApi.getClaims(params),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });
};

export const useClaim = (claimId) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => claimsBackendApi.getClaimById(claimId),
    enabled: !!claimId,
  });
};

export const useClaimDocuments = (claimId) => {
  return useQuery({
    queryKey: ['claim-documents', claimId],
    queryFn: () => claimsBackendApi.getClaimDocuments(claimId),
    enabled: !!claimId,
  });
};

export const useClaimNotes = (claimId) => {
  return useQuery({
    queryKey: ['claim-notes', claimId],
    queryFn: () => claimsBackendApi.getClaimNotes(claimId),
    enabled: !!claimId,
  });
};

export const useClaimsStats = (params = {}) => {
  return useQuery({
    queryKey: ['claims-stats', params],
    queryFn: () => claimsBackendApi.getClaimsStats(params),
    staleTime: 60000, // 1 minute
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => claimsBackendApi.getDashboardStats(),
    staleTime: 60000, // 1 minute
  });
};

export const useClaimsAgingReport = () => {
  return useQuery({
    queryKey: ['claims-aging-report'],
    queryFn: () => claimsBackendApi.getClaimsAgingReport(),
    staleTime: 300000, // 5 minutes
  });
};

export const useSettlementReport = () => {
  return useQuery({
    queryKey: ['settlement-report'],
    queryFn: () => claimsBackendApi.getSettlementReport(),
    staleTime: 300000, // 5 minutes
  });
};

export const useSearchClaims = (query, limit = 20) => {
  return useQuery({
    queryKey: ['search-claims', query, limit],
    queryFn: () => claimsBackendApi.searchClaims(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 30000,
  });
};

// Mutation hooks for data manipulation
export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimData) => claimsBackendApi.createClaim(claimData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claim created successfully');
    },
    onError: (error) => {
      console.error('Create claim error:', error);
      toast.error('Failed to create claim');
    },
  });
};

export const useUpdateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimData }) => claimsBackendApi.updateClaim(id, claimData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claim updated successfully');
    },
    onError: (error) => {
      console.error('Update claim error:', error);
      toast.error('Failed to update claim');
    },
  });
};

export const useUpdateClaimBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimData }) => claimsBackendApi.updateClaim(id, claimData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      console.error('Update claim error:', error);
    },
  });
};

export const useDeleteClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId) => claimsBackendApi.deleteClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claim deleted successfully');
    },
    onError: (error) => {
      console.error('Delete claim error:', error);
      toast.error('Failed to delete claim');
    },
  });
};

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, status, reason, approvedAmount }) => 
      claimsBackendApi.updateClaimStatus(claimId, status, reason, approvedAmount),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claimId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claim status updated successfully');
    },
    onError: (error) => {
      console.error('Update status error:', error);
      toast.error('Failed to update claim status');
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentType, file, name }) => 
      claimsBackendApi.uploadDocument(claimId, documentType, file, name),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim-documents', variables.claimId] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claimId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload document error:', error);
      toast.error('Failed to upload document');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, documentId }) => 
      claimsBackendApi.deleteDocument(claimId, documentId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim-documents', variables.claimId] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claimId] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Delete document error:', error);
      toast.error('Failed to delete document');
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, noteData }) => 
      claimsBackendApi.addNote(claimId, noteData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claim-notes', variables.claimId] });
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claimId] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Add note error:', error);
      toast.error('Failed to add note');
    },
  });
};

export const useBulkUpdateClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, updateData }) => 
      claimsBackendApi.bulkUpdateClaims(claimIds, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claims updated successfully');
    },
    onError: (error) => {
      console.error('Bulk update error:', error);
      toast.error('Failed to update claims');
    },
  });
};

export const useBulkAssignClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimIds, agentId }) => 
      claimsBackendApi.bulkAssignClaims(claimIds, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claims assigned successfully');
    },
    onError: (error) => {
      console.error('Bulk assign error:', error);
      toast.error('Failed to assign claims');
    },
  });
};

export const useExportClaims = () => {
  return useMutation({
    mutationFn: (filters = {}) => claimsBackendApi.exportClaims(filters),
    onError: (error) => {
      console.error('Export claims error:', error);
      toast.error('Failed to export claims');
    },
  });
};

export const useImportClaims = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => claimsBackendApi.importClaims(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Claims imported successfully');
    },
    onError: (error) => {
      console.error('Import claims error:', error);
      toast.error('Failed to import claims');
    },
  });
};
