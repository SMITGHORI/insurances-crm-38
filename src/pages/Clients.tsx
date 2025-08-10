import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { clientsApi } from '@/services/api';
import ClientForm from '@/components/clients/ClientForm';
import ClientTable from '@/components/clients/ClientTable';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientStatsCards from '@/components/clients/ClientStatsCards';
import ClientExportDialog from '@/components/clients/ClientExportDialog';
import BulkOperationsToolbar from '@/components/clients/BulkOperationsToolbar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    clientType: 'all',
    agentId: 'all',
    source: 'all'
  });
  const [selectedClients, setSelectedClients] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid, kanban

  // Fetch clients with filters
  const { data: clientsData, isLoading, error } = useQuery({
    queryKey: ['clients', filters, searchTerm],
    queryFn: () => clientsApi.getClients({ ...filters, search: searchTerm }),
    enabled: hasPermission('clients', 'view')
  });

  // Fetch client statistics
  const { data: statsData } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => clientsApi.getClientStats(),
    enabled: hasPermission('clients', 'view')
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: (clientId) => clientsApi.deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['clientStats']);
      toast.success('Client deleted successfully');
      setSelectedClients([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete client');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (clientIds) => clientsApi.bulkDeleteClients(clientIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['clientStats']);
      toast.success(`${selectedClients.length} clients deleted successfully`);
      setSelectedClients([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete clients');
    }
  });

  const handleCreateClient = async (clientData) => {
    try {
      await clientsApi.createClient(clientData);
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['clientStats']);
      toast.success('Client created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create client');
    }
  };

  const handleDeleteClient = (clientId) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) {
      bulkDeleteMutation.mutate(selectedClients);
    }
  };

  const handleClientSelect = (clientId, isSelected) => {
    if (isSelected) {
      setSelectedClients(prev => [...prev, clientId]);
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedClients(clientsData?.clients?.map(client => client._id) || []);
    } else {
      setSelectedClients([]);
    }
  };

  if (!hasPermission('clients', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the clients module.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error.message || 'Failed to load clients'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-sm text-gray-600">
                Manage your client database, track relationships, and monitor engagement
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('clients', 'create') && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                      <DialogDescription>
                        Create a new client record with all necessary information
                      </DialogDescription>
                    </DialogHeader>
                    <ClientForm
                      onSubmit={handleCreateClient}
                      onCancel={() => setIsCreateDialogOpen(false)}
                      userRole={user?.role?.name}
                      userId={user?.id}
                    />
                  </DialogContent>
                </Dialog>
              )}
              
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              
              <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <ClientStatsCards stats={statsData} />

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <ClientFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Operations Toolbar */}
        {selectedClients.length > 0 && (
          <BulkOperationsToolbar
            selectedCount={selectedClients.length}
            onDelete={handleBulkDelete}
            onExport={() => setIsExportDialogOpen(true)}
            onAssignAgent={() => {/* TODO: Implement agent assignment */}}
          />
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Clients ({clientsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="individual">
              <UserPlus className="w-4 h-4 mr-2" />
              Individual ({statsData?.individual || 0})
            </TabsTrigger>
            <TabsTrigger value="corporate">
              <Building className="w-4 h-4 mr-2" />
              Corporate ({statsData?.corporate || 0})
            </TabsTrigger>
            <TabsTrigger value="group">
              <Users className="w-4 h-4 mr-2" />
              Group ({statsData?.group || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {viewMode === 'table' && (
              <ClientTable
                clients={clientsData?.clients || []}
                onClientSelect={handleClientSelect}
                onSelectAll={handleSelectAll}
                selectedClients={selectedClients}
                onEdit={(client) => navigate(`/clients/${client._id}/edit`)}
                onView={(client) => navigate(`/clients/${client._id}`)}
                onDelete={handleDeleteClient}
                hasEditPermission={hasPermission('clients', 'edit')}
                hasDeletePermission={hasPermission('clients', 'delete')}
              />
            )}
            
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(clientsData?.clients || []).map((client) => (
                  <Card key={client._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{client.name}</CardTitle>
                          <CardDescription className="text-sm">
                            {client.clientType} • {client.status}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/clients/${client._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission('clients', 'edit') && (
                              <DropdownMenuItem onClick={() => navigate(`/clients/${client._id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('clients', 'delete') && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClient(client._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Email:</span>
                          <span className="text-gray-600">{client.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Phone:</span>
                          <span className="text-gray-600">{client.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Location:</span>
                          <span className="text-gray-600">{client.city}, {client.state}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {client.totalPolicies || 0} policies
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            {/* Individual clients content - similar structure */}
          </TabsContent>

          <TabsContent value="corporate" className="space-y-6">
            {/* Corporate clients content - similar structure */}
          </TabsContent>

          <TabsContent value="group" className="space-y-6">
            {/* Group clients content - similar structure */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Export Dialog */}
      <ClientExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        selectedClients={selectedClients}
        totalClients={clientsData?.total || 0}
      />
    </div>
  );
};

export default Clients;