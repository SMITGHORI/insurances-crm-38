
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import leadsApi from '../services/api/leadsApi';

/**
 * Consolidated React Query hooks for leads management
 * Single source of truth connecting to MongoDB backend
 */

// Query keys for cache management
export const leadsQueryKeys = {
  all: ['leads'],
  lists: () => [...leadsQueryKeys.all, 'list'],
  list: (params) => [...leadsQueryKeys.lists(), params],
  details: () => [...leadsQueryKeys.all, 'detail'],
  detail: (id) => [...leadsQueryKeys.details(), id],
  followUps: (id) => [...leadsQueryKeys.detail(id), 'followUps'],
  notes: (id) => [...leadsQueryKeys.detail(id), 'notes'],
  stats: () => [...leadsQueryKeys.all, 'stats'],
  search: (query) => [...leadsQueryKeys.all, 'search', query],
};

/**
 * Hook to fetch leads with filtering and pagination
 */
export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: leadsQueryKeys.list(params),
    queryFn: () => leadsApi.getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch a single lead by ID
 */
export const useLead = (leadId) => {
  return useQuery({
    queryKey: leadsQueryKeys.detail(leadId),
    queryFn: () => leadsApi.getLeadById(leadId),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook to create a new lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadData) => leadsApi.createLead(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create lead: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, leadData }) => leadsApi.updateLead(id, leadData),
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.setQueryData(leadsQueryKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update lead: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId) => leadsApi.deleteLead(leadId),
    onSuccess: (data, leadId) => {
      queryClient.removeQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete lead: ${error.message}`);
    },
  });
};

/**
 * Hook to add follow-up to lead
 */
export const useAddFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, followUpData }) => leadsApi.addFollowUp(leadId, followUpData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.followUps(leadId) });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      toast.success('Follow-up added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add follow-up: ${error.message}`);
    },
  });
};

/**
 * Hook to add note to lead
 */
export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, noteData }) => leadsApi.addNote(leadId, noteData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.notes(leadId) });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook to assign lead to agent
 */
export const useAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, agentData }) => leadsApi.assignLead(leadId, agentData),
    onSuccess: (data, variables) => {
      const { leadId } = variables;
      queryClient.setQueryData(leadsQueryKeys.detail(leadId), data);
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      toast.success('Lead assigned successfully');
    },
    onError: (error) => {
      toast.error(`Failed to assign lead: ${error.message}`);
    },
  });
};

/**
 * Hook to convert lead to client
 */
export const useConvertToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId) => leadsApi.convertToClient(leadId),
    onSuccess: (data, leadId) => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.detail(leadId) });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      toast.success('Lead converted to client successfully');
    },
    onError: (error) => {
      toast.error(`Failed to convert lead to client: ${error.message}`);
    },
  });
};

/**
 * Hook to get leads statistics
 */
export const useLeadsStats = (params = {}) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.stats(), params],
    queryFn: () => leadsApi.getLeadsStats(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to search leads
 */
export const useSearchLeads = (query, limit = 10) => {
  return useQuery({
    queryKey: leadsQueryKeys.search(query),
    queryFn: () => leadsApi.searchLeads(query, limit),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Hook to get lead funnel report
 */
export const useLeadFunnelReport = (params = {}) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.all, 'funnel', params],
    queryFn: () => leadsApi.getLeadFunnelReport(params),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook to get stale leads
 */
export const useStaleLeads = (days = 7) => {
  return useQuery({
    queryKey: [...leadsQueryKeys.all, 'stale', days],
    queryFn: () => leadsApi.getStaleLeads(days),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

/**
 * Hook to bulk update leads
 */
export const useBulkUpdateLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadIds, updateData }) => leadsApi.bulkUpdateLeads(leadIds, updateData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsQueryKeys.stats() });
      toast.success(`${data.successful || data.count} leads updated successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to update leads: ${error.message}`);
    },
  });
};

/**
 * Hook to export leads data
 */
export const useExportLeads = () => {
  return useMutation({
    mutationFn: (exportData) => leadsApi.exportLeads(exportData),
    onSuccess: (data) => {
      toast.success(`${data.count || 'Leads'} exported successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to export leads: ${error.message}`);
    },
  });
};
