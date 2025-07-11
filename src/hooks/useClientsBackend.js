
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import clientsBackendApi from '@/services/api/clientsApiBackend';

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
 * Hook for getting clients with pagination and filtering
 */
export const useClientsBackend = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: async () => {
      try {
        console.log('Fetching clients from backend:', params);
        return await clientsBackendApi.getClients(params);
      } catch (error) {
        console.error('Error fetching clients from backend:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook for getting a single client
 */
export const useClientBackend = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(clientId),
    queryFn: async () => {
      try {
        console.log('Fetching client details from backend:', clientId);
        return await clientsBackendApi.getClientById(clientId);
      } catch (error) {
        console.error('Error fetching client from backend:', error);
        throw error;
      }
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for creating a client
 */
export const useCreateClientBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData) => {
      console.log('Creating client in backend:', clientData);
      return await clientsBackendApi.createClient(clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client created successfully');
    },
    onError: (error) => {
      console.error('Error creating client in backend:', error);
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
};

/**
 * Hook for updating a client
 */
export const useUpdateClientBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...clientData }) => {
      console.log('Updating client in backend:', id, clientData);
      return await clientsBackendApi.updateClient(id, clientData);
    },
    onSuccess: (data, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client updated successfully');
    },
    onError: (error) => {
      console.error('Error updating client in backend:', error);
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
};

/**
 * Hook for deleting a client
 */
export const useDeleteClientBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId) => {
      console.log('Deleting client in backend:', clientId);
      return await clientsBackendApi.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.stats() });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting client in backend:', error);
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
};

/**
 * Hook for client search
 */
export const useClientSearchBackend = () => {
  return useMutation({
    mutationFn: async ({ query, limit = 10 }) => {
      console.log('Searching clients in backend:', { query, limit });
      const result = await clientsBackendApi.searchClients(query, limit);
      console.log('Client search results from backend:', result);
      return result;
    },
    onError: (error) => {
      console.error('Error searching clients in backend:', error);
      toast.error(`Search failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting clients by agent
 */
export const useClientsByAgentBackend = (agentId) => {
  return useQuery({
    queryKey: ['clients', 'agent', agentId],
    queryFn: async () => {
      console.log('Fetching clients by agent from backend:', agentId);
      const result = await clientsBackendApi.getClientsByAgent(agentId);
      console.log('Agent clients fetched from backend:', result);
      return result;
    },
    enabled: !!agentId,
    staleTime: 30 * 1000,
    onError: (error) => {
      console.error('Error fetching agent clients from backend:', error);
      toast.error(`Failed to load agent clients: ${error.message}`);
    },
  });
};

/**
 * Hook for assigning clients to agents
 */
export const useAssignClientBackend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, agentId }) => {
      console.log('Assigning client to agent in backend:', { clientId, agentId });
      const result = await clientsBackendApi.assignClientToAgent(clientId, agentId);
      console.log('Client assigned to agent in backend:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      const { clientId, agentId } = variables;
      console.log('Client successfully assigned to agent in backend:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: ['clients', 'agent', agentId] });
      
      toast.success('Client assigned successfully');
    },
    onError: (error) => {
      console.error('Error assigning client to agent in backend:', error);
      toast.error(`Failed to assign client: ${error.message}`);
    },
  });
};

/**
 * Hook for bulk client operations
 */
export const useBulkClientOperationsBackend = () => {
  const queryClient = useQueryClient();
  
  const bulkUpdate = useMutation({
    mutationFn: async ({ clientIds, updateData }) => {
      console.log('Bulk updating clients in backend:', { clientIds, updateData });
      return await clientsBackendApi.request('/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ clientIds, updateData })
      });
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
      console.log('Bulk deleting clients in backend:', clientIds);
      return await clientsBackendApi.request('/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ clientIds })
      });
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

  return { bulkUpdate, bulkDelete };
};

/**
 * Hook for client export
 */
export const useClientExportBackend = () => {
  return useMutation({
    mutationFn: async (exportParams) => {
      console.log('Exporting clients from backend:', exportParams);
      return await clientsBackendApi.exportClients(exportParams);
    },
    onSuccess: () => {
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      console.error('Error exporting clients from backend:', error);
      toast.error(`Export failed: ${error.message}`);
    },
  });
};

/**
 * Hook for uploading documents
 */
export const useUploadDocumentBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, documentType, file }) => {
      console.log('Uploading document in backend:', clientId, documentType, file);
      return await clientsBackendApi.uploadDocument(clientId, documentType, file);
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.documents(clientId) });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Error uploading document in backend:', error);
      toast.error(`Upload failed: ${error.message}`);
    },
  });
};

/**
 * Hook for getting client documents
 */
export const useClientDocumentsBackend = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.documents(clientId),
    queryFn: async () => {
      console.log('Fetching client documents from backend:', clientId);
      return await clientsBackendApi.getClientDocuments(clientId);
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for getting client notes
 */
export const useClientNotesBackend = (clientId) => {
  return useQuery({
    queryKey: clientsQueryKeys.notes(clientId),
    queryFn: async () => {
      console.log('Fetching client notes from backend:', clientId);
      return await clientsBackendApi.request(`/${clientId}/notes`);
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for adding client notes
 */
export const useAddClientNoteBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, content, priority, category }) => {
      console.log('Adding client note in backend:', { clientId, content, priority, category });
      return await clientsBackendApi.request(`/${clientId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content, priority, category })
      });
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.notes(clientId) });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(clientId) });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Error adding client note in backend:', error);
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
};

/**
 * Hook for updating client notes
 */
export const useUpdateClientNoteBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, noteId, content }) => {
      console.log('Updating client note in backend:', { clientId, noteId, content });
      return await clientsBackendApi.request(`/${clientId}/notes/${noteId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.notes(clientId) });
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      console.error('Error updating client note in backend:', error);
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
};

/**
 * Hook for deleting client notes
 */
export const useDeleteClientNoteBackend = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, noteId }) => {
      console.log('Deleting client note in backend:', { clientId, noteId });
      return await clientsBackendApi.request(`/${clientId}/notes/${noteId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: (data, variables) => {
      const { clientId } = variables;
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.notes(clientId) });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting client note in backend:', error);
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });
};

/**
 * Hook for client statistics
 */
export const useClientStatsBackend = () => {
  return useQuery({
    queryKey: clientsQueryKeys.stats(),
    queryFn: async () => {
      console.log('Fetching client stats from backend');
      return await clientsBackendApi.getClientStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
