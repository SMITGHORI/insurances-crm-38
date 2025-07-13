
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { broadcastApi, communicationApi } from '../services/api/broadcastApiService';

// Query keys for cache management
export const queryKeys = {
  broadcasts: {
    all: ['broadcasts'],
    lists: () => [...queryKeys.broadcasts.all, 'list'],
    list: (params) => [...queryKeys.broadcasts.lists(), params],
    details: () => [...queryKeys.broadcasts.all, 'detail'],
    detail: (id) => [...queryKeys.broadcasts.details(), id],
    stats: (id) => [...queryKeys.broadcasts.all, 'stats', id],
    analytics: (id) => [...queryKeys.broadcasts.all, 'analytics', id],
  },
  offers: {
    all: ['offers'],
    lists: () => [...queryKeys.offers.all, 'list'],
    list: (params) => [...queryKeys.offers.lists(), params],
    details: () => [...queryKeys.offers.all, 'detail'],
    detail: (id) => [...queryKeys.offers.details(), id],
  },
  templates: ['broadcast-templates'],
  eligibleClients: ['eligible-clients'],
  communications: ['communications'],
};

// Broadcast Hooks
export const useBroadcasts = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.broadcasts.list(params),
    queryFn: () => broadcastApi.getBroadcasts(params),
    staleTime: 2 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching broadcasts:', error);
      toast.error('Failed to load broadcasts');
    },
  });
};

export const useBroadcast = (broadcastId) => {
  return useQuery({
    queryKey: queryKeys.broadcasts.detail(broadcastId),
    queryFn: () => broadcastApi.getBroadcastById(broadcastId),
    enabled: !!broadcastId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching broadcast:', error);
      toast.error('Failed to load broadcast');
    },
  });
};

export const useCreateBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastData) => {
      if (!broadcastData.title || !broadcastData.content || !broadcastData.channels?.length) {
        throw new Error('Missing required fields: title, content, or channels');
      }
      return broadcastApi.createBroadcast(broadcastData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.lists() });
      toast.success('Broadcast created successfully');
    },
    onError: (error) => {
      console.error('Error creating broadcast:', error);
      toast.error(`Failed to create broadcast: ${error.message}`);
    },
  });
};

export const useUpdateBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ broadcastId, broadcastData }) => {
      return broadcastApi.updateBroadcast(broadcastId, broadcastData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.detail(variables.broadcastId) });
      toast.success('Broadcast updated successfully');
    },
    onError: (error) => {
      console.error('Error updating broadcast:', error);
      toast.error(`Failed to update broadcast: ${error.message}`);
    },
  });
};

export const useDeleteBroadcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (broadcastId) => {
      return broadcastApi.deleteBroadcast(broadcastId);
    },
    onSuccess: (data, broadcastId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.broadcasts.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.broadcasts.detail(broadcastId) });
      toast.success('Broadcast deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting broadcast:', error);
      toast.error(`Failed to delete broadcast: ${error.message}`);
    },
  });
};

export const useBroadcastStats = (broadcastId) => {
  return useQuery({
    queryKey: queryKeys.broadcasts.stats(broadcastId),
    queryFn: () => broadcastApi.getBroadcastStats(broadcastId),
    enabled: !!broadcastId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching broadcast stats:', error);
      toast.error('Failed to load broadcast statistics');
    },
  });
};

export const useBroadcastAnalytics = (broadcastId) => {
  return useQuery({
    queryKey: queryKeys.broadcasts.analytics(broadcastId),
    queryFn: () => broadcastApi.getBroadcastAnalytics(broadcastId),
    enabled: !!broadcastId,
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    },
  });
};

export const useEligibleClients = () => {
  return useMutation({
    mutationFn: async (targetAudience) => {
      return broadcastApi.getEligibleClients(targetAudience);
    },
    onError: (error) => {
      console.error('Error fetching eligible clients:', error);
      toast.error('Failed to load eligible clients');
    },
  });
};

export const useUpdateClientPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, preferences }) => {
      return broadcastApi.updateClientPreferences(clientId, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client preferences updated successfully');
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });
};

// Offers Hooks
export const useOffers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.offers.list(params),
    queryFn: () => communicationApi.getOffers(params),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    onError: (error) => {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    },
  });
};

export const useOffer = (offerId) => {
  return useQuery({
    queryKey: queryKeys.offers.detail(offerId),
    queryFn: () => communicationApi.getOfferById(offerId),
    enabled: !!offerId,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching offer:', error);
      toast.error('Failed to load offer');
    },
  });
};

export const useCreateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData) => {
      if (!offerData.title || !offerData.description || !offerData.type) {
        throw new Error('Missing required fields: title, description, or type');
      }
      return communicationApi.createOffer(offerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.lists() });
      toast.success('Offer created successfully');
    },
    onError: (error) => {
      console.error('Error creating offer:', error);
      toast.error(`Failed to create offer: ${error.message}`);
    },
  });
};

export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, offerData }) => {
      return communicationApi.updateOffer(offerId, offerData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.detail(variables.offerId) });
      toast.success('Offer updated successfully');
    },
    onError: (error) => {
      console.error('Error updating offer:', error);
      toast.error(`Failed to update offer: ${error.message}`);
    },
  });
};

export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerId) => {
      return communicationApi.deleteOffer(offerId);
    },
    onSuccess: (data, offerId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.offers.detail(offerId) });
      toast.success('Offer deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting offer:', error);
      toast.error(`Failed to delete offer: ${error.message}`);
    },
  });
};

// Communication Hooks
export const useCommunications = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.communications, params],
    queryFn: () => communicationApi.getCommunications(params),
    staleTime: 2 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching communications:', error);
      toast.error('Failed to load communications');
    },
  });
};

export const useCommunicationStats = () => {
  return useQuery({
    queryKey: ['communication-stats'],
    queryFn: () => communicationApi.getStats(),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    },
  });
};

// Template Hooks
export const useBroadcastTemplates = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.templates, params],
    queryFn: () => broadcastApi.getTemplates(params),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    },
  });
};

export const useCreateBroadcastTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateData) => {
      return broadcastApi.createTemplate(templateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      toast.success('Template created successfully');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
};

export const useAutomatedTriggers = () => {
  return useMutation({
    mutationFn: async (triggerType) => {
      return broadcastApi.triggerAutomation(triggerType);
    },
    onSuccess: (data, triggerType) => {
      toast.success(`${triggerType} automation triggered successfully`);
    },
    onError: (error) => {
      console.error('Error triggering automation:', error);
      toast.error(`Failed to trigger automation: ${error.message}`);
    },
  });
};
