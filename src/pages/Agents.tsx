import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, User, Building, TrendingUp, Calendar, DollarSign, Award, Target, Phone, Mail, MapPin } from 'lucide-react';
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
import { agentsApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Agents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    location: 'all',
    performance: 'all'
  });
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid, kanban

  // Fetch agents with filters
  const { data: agentsData, isLoading, error } = useQuery({
    queryKey: ['agents', filters, searchTerm],
    queryFn: () => agentsApi.getAgents({ ...filters, search: searchTerm }),
    enabled: hasPermission('agents', 'view')
  });

  // Fetch agent statistics
  const { data: statsData } = useQuery({
    queryKey: ['agentStats'],
    queryFn: () => agentsApi.getAgentStats(),
    enabled: hasPermission('agents', 'view')
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: (agentId) => agentsApi.deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agentStats']);
      toast.success('Agent deleted successfully');
      setSelectedAgents([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete agent');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (agentIds) => agentsApi.bulkDeleteAgents(agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      queryClient.invalidateQueries(['agentStats']);
      toast.success(`${selectedAgents.length} agents deleted successfully`);
      setSelectedAgents([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete agents');
    }
  });

  const handleDeleteAgent = (agentId) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgentMutation.mutate(agentId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedAgents.length} agents?`)) {
      bulkDeleteMutation.mutate(selectedAgents);
    }
  };

  const handleAgentSelect = (agentId, isSelected) => {
    if (isSelected) {
      setSelectedAgents(prev => [...prev, agentId]);
    } else {
      setSelectedAgents(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedAgents(agentsData?.agents?.map(agent => agent._id) || []);
    } else {
      setSelectedAgents([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Inactive': return 'secondary';
      case 'Suspended': return 'destructive';
      case 'Pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return 'default';
    if (performance >= 60) return 'outline';
    return 'destructive';
  };

  if (!hasPermission('agents', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the agents module.
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
              {error.message || 'Failed to load agents'}
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
              <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
              <p className="text-sm text-gray-600">
                Manage insurance agents, track performance, and monitor sales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('agents', 'create') && (
                <Button onClick={() => navigate('/agents/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agent
                </Button>
              )}
              
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              
              <Button variant="outline">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData?.growth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.active || 0}</div>
              <p className="text-xs text-muted-foreground">
                {statsData?.activePercentage || 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statsData?.totalSales?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData?.salesGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.avgPerformance || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Target: {statsData?.targetPerformance || 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search agents by name, ID, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.performance} onValueChange={(value) => setFilters(prev => ({ ...prev, performance: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (60-79%)</SelectItem>
                    <SelectItem value="low">Low (<60%)</SelectItem>
                  </SelectContent>
                </Select>
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
        {selectedAgents.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedAgents.length} agents selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Target className="w-4 h-4 mr-2" />
                    Set Targets
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAgents([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Agents ({agentsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="active">Active ({statsData?.active || 0})</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers ({statsData?.topPerformers || 0})</TabsTrigger>
            <TabsTrigger value="new">New ({statsData?.newAgents || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {viewMode === 'table' && (
              <Card>
                <CardHeader>
                  <CardTitle>Agents List</CardTitle>
                  <CardDescription>
                    View and manage all insurance agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentsData?.agents?.map((agent) => (
                      <div key={agent._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedAgents.includes(agent._id)}
                            onChange={(e) => handleAgentSelect(agent._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{agent.name}</h3>
                                <Badge variant={getStatusColor(agent.status)}>
                                  {agent.status}
                                </Badge>
                                <Badge variant={getPerformanceColor(agent.performance)}>
                                  {agent.performance || 0}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{agent.agentId}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {agent.location || 'Location N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {agent.phone || 'Phone N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Mail className="w-3 h-3 mr-1" />
                                  {agent.email || 'Email N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/agents/${agent._id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('agents', 'edit') && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/agents/${agent._id}/edit`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('agents', 'delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent._id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(agentsData?.agents || []).map((agent) => (
                  <Card key={agent._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {agent.agentId} • {agent.type}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate(`/agents/${agent._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission('agents', 'edit') && (
                              <DropdownMenuItem onClick={() => navigate(`/agents/${agent._id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('agents', 'delete') && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteAgent(agent._id)}
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
                          <span className="font-medium w-20">Status:</span>
                          <Badge variant={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Performance:</span>
                          <Badge variant={getPerformanceColor(agent.performance)}>
                            {agent.performance || 0}%
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Location:</span>
                          <span className="text-gray-600">{agent.location || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {agent.phone || 'N/A'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {/* Active agents content - similar structure */}
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-6">
            {/* Top performers content - similar structure */}
          </TabsContent>

          <TabsContent value="new" className="space-y-6">
            {/* New agents content - similar structure */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Agents;