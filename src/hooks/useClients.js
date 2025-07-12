
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clientsApi from '../services/api/clientsApi';

// Query keys for client-related queries
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (filters) => [...clientsQueryKeys.lists(), { filters }],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  search: (query) => [...clientsQueryKeys.all, 'search', query],
  stats: () => [...clientsQueryKeys.all, 'stats'],
  notes: (id) => [...clientsQueryKeys.all, 'notes', id],
  documents: (id) => [...clientsQueryKeys.all, 'documents', id],
};

/**
 * Hook for getting clients with pagination and filtering from MongoDB
 */
export const useClients = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: async () => {
      try {
        console.log('Fetching clients from MongoDB:', params);
        return await clientsApi.getClients(params);
      } catch (error) {
        console.error('Error fetching clients from MongoDB:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook for getting a single client from MongoDB
 */
export const useClient = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching client details from MongoDB:', clientId);
        return await clientsApi.getClientById(clientId);
      } catch (error) {
        console.error('Error fetching client from MongoDB:', error);
        throw error;
      }
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for creating a client in MongoDB
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData) => {
      console.log('Creating client in MongoDB:', clientData);
      return await clientsApi.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Error creating client in MongoDB:', error);
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
};

/**
 * Hook for updating a client in MongoDB
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...clientData }) => {
      console.log('Updating client in MongoDB:', id, clientData);
      return await clientsApi.updateClient(id, clientData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Error updating client in MongoDB:', error);
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
};

/**
 * Hook for deleting a client from MongoDB
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId) => {
      console.log('Deleting client from MongoDB:', clientId);
      return await clientsApi.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting client from MongoDB:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};

/**
 * Hook for client search
 */
export const useClientSearch = () => {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }) => {
      console.log('Searching clients in MongoDB:', { query, limit });
      const result = await clientsApi.searchClients(query, limit);
      console.log('Client search results from MongoDB:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error searching clients in MongoDB:', error);
      toast.error(`Search failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting clients by agent
 */
export const useClientsByAgent = (agentId) => {
  return useQuery({
    queryKey: ['clients', 'agent', agentId],
    queryFn: async () => {
      console.log('Fetching clients by agent from MongoDB:', agentId);
      const result = await clientsApi.getClientsByAgent(agentId);
      console.log('Agent clients fetched from MongoDB:', result);
      return result;
    },
    enabled: !!agentId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching agent clients from MongoDB:', error);
      toast.error(`Failed to load agent clients: ${error.message}`);
    },
  });
};

/**
 * Hook for assigning clients to agents
 */
export const useAssignClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, agentId }) => {
      console.log('Assigning client to agent in MongoDB:', { clientId, agentId });
      const result = await clientsApi.assignClientToAgent(clientId, agentId);
      console.log('Client assigned to agent in MongoDB:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { clientId, agentId } = variables;
      console.log('Client successfully assigned to agent in MongoDB:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: ['clients', 'agent', agentId] });
      
      toast.success('Client assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning client to agent in MongoDB:', error);
      toast.error(`Failed to assign client: ${error.message}`);
    },
  });
};

/**
 * Hook for bulk client operations
 */
export const useBulkClientOperations = () => {
  const queryClient = useQueryClient();
  
  const bulkUpdate = useMutation({
    mutationFn: async ({ clientIds, updateData }) => {
      console.log('Bulk updating clients in MongoDB:', { clientIds, updateData });
      return await clientsApi.bulkUpdateClients(clientIds, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Bulk update completed successfully');
    },
    onError: (error) => {
      console.error('Error in bulk update:', error);
      toast.error(`Bulk update failed: ${error.message}`);
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (clientIds) => {
      console.log('Bulk deleting clients in MongoDB:', clientIds);
      return await clientsApi.bulkDeleteClients(clientIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Bulk deletion completed successfully');
    },
    onError: (error) => {
      console.error('Error in bulk deletion:', error);
      toast.error(`Bulk deletion failed: ${error.message}`);
    },
  });

  const bulkAssign = useMutation({
    mutationFn: async ({ clientIds, agentId }) => {
      console.log('Bulk assigning clients in MongoDB:', { clientIds, agentId });
      const promises = clientIds.map(clientId => 
        clientsApi.assignClientToAgent(clientId, agentId)
      );
      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      toast.success('Bulk assignment completed successfully');
    },
    onError: (error) => {
      console.error('Error in bulk assignment:', error);
      toast.error(`Bulk assignment failed: ${error.message}`);
    },
  });

  return { bulkUpdate, bulkDelete, bulkAssign };
};

/**
 * Hook for client export
 */
export const useClientExport = () => {
  return useMutation({
    mutationFn: async (exportParams) => {
      console.log('Exporting clients from MongoDB:', exportParams);
      return await clientsApi.exportClients(exportParams);
    },
    onSuccess: () => {
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting clients from MongoDB:', error);
      toast.error(`Export failed: ${error.message}`);
    },
  });
};

/**
 * Hook for client statistics
 */
export const useClientStats = () => {
  return useQuery({
    queryKey: clientsQueryKeys.stats(),
    queryFn: async () => {
      console.log('Fetching client stats from MongoDB');
      return await clientsApi.getClientStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for uploading documents
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, documentType, file }) => {
      console.log('Uploading document in MongoDB:', clientId, documentType, file);
      return await clientsApi.uploadDocument(clientId, documentType, file);
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading document in MongoDB:', error);
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting client documents
 */
export const useClientDocuments = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.documents(clientId),
    queryFn: async () => {
      console.log('Fetching client documents from MongoDB:', clientId);
      return await clientsApi.getClientDocuments(clientId);
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for client notes
 */
export const useClientNotes = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.notes(clientId),
    queryFn: async () => {
      console.log('Fetching client notes from MongoDB:', clientId);
      return await clientsApi.getClientNotes(clientId);
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAddClientNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, content, priority, category }) => {
      console.log('Adding client note in MongoDB:', { clientId, content, priority, category });
      return await clientsApi.addClientNote(clientId, { content, priority, category });
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.notes(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Error adding client note in MongoDB:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};
