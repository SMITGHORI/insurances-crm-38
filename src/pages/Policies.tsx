import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, Shield, FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react';
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
import { policiesApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Policies = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    insuranceCompany: 'all',
    agentId: 'all'
  });
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid, kanban

  // Fetch policies with filters
  const { data: policiesData, isLoading, error } = useQuery({
    queryKey: ['policies', filters, searchTerm],
    queryFn: () => policiesApi.getPolicies({ ...filters, search: searchTerm }),
    enabled: hasPermission('policies', 'view')
  });

  // Fetch policy statistics
  const { data: statsData } = useQuery({
    queryKey: ['policyStats'],
    queryFn: () => policiesApi.getPolicyStats(),
    enabled: hasPermission('policies', 'view')
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: (policyId) => policiesApi.deletePolicy(policyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      queryClient.invalidateQueries(['policyStats']);
      toast.success('Policy deleted successfully');
      setSelectedPolicies([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete policy');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (policyIds) => policiesApi.bulkDeletePolicies(policyIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      queryClient.invalidateQueries(['policyStats']);
      toast.success(`${selectedPolicies.length} policies deleted successfully`);
      setSelectedPolicies([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete policies');
    }
  });

  const handleDeletePolicy = (policyId) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      deletePolicyMutation.mutate(policyId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedPolicies.length} policies?`)) {
      bulkDeleteMutation.mutate(selectedPolicies);
    }
  };

  const handlePolicySelect = (policyId, isSelected) => {
    if (isSelected) {
      setSelectedPolicies(prev => [...prev, policyId]);
    } else {
      setSelectedPolicies(prev => prev.filter(id => id !== policyId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedPolicies(policiesData?.policies?.map(policy => policy._id) || []);
    } else {
      setSelectedPolicies([]);
    }
  };

  if (!hasPermission('policies', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the policies module.
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
              {error.message || 'Failed to load policies'}
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
              <h1 className="text-2xl font-bold text-gray-900">Policy Management</h1>
              <p className="text-sm text-gray-600">
                Manage insurance policies, track coverage, and monitor renewals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('policies', 'create') && (
                <Button onClick={() => navigate('/policies/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Policy
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
              <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
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
              <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statsData?.totalPremium?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData?.premiumGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Renewals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.dueRenewals || 0}</div>
              <p className="text-xs text-muted-foreground">
                Next 30 days
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
                    placeholder="Search policies by number, client name..."
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
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.insuranceCompany} onValueChange={(value) => setFilters(prev => ({ ...prev, insuranceCompany: value }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="LIC">LIC</SelectItem>
                    <SelectItem value="HDFC">HDFC</SelectItem>
                    <SelectItem value="ICICI">ICICI</SelectItem>
                    <SelectItem value="Bajaj">Bajaj</SelectItem>
                    <SelectItem value="Tata">Tata</SelectItem>
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
        {selectedPolicies.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedPolicies.length} policies selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPolicies([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Policies ({policiesData?.total || 0})</TabsTrigger>
            <TabsTrigger value="active">Active ({statsData?.active || 0})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({statsData?.expired || 0})</TabsTrigger>
            <TabsTrigger value="renewals">Due Renewals ({statsData?.dueRenewals || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {viewMode === 'table' && (
              <Card>
                <CardHeader>
                  <CardTitle>Policy List</CardTitle>
                  <CardDescription>
                    View and manage all insurance policies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {policiesData?.policies?.map((policy) => (
                      <div key={policy._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedPolicies.includes(policy._id)}
                            onChange={(e) => handlePolicySelect(policy._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{policy.policyNumber}</h3>
                              <Badge variant={policy.status === 'Active' ? 'default' : 'secondary'}>
                                {policy.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{policy.clientId?.name || 'Client Name'}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{policy.type} • {policy.insuranceCompany}</span>
                              <span>₹{policy.premium?.toLocaleString()} premium</span>
                              <span>₹{policy.sumAssured?.toLocaleString()} coverage</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/policies/${policy._id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('policies', 'edit') && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/policies/${policy._id}/edit`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('policies', 'delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePolicy(policy._id)}>
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
                {(policiesData?.policies || []).map((policy) => (
                  <Card key={policy._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{policy.policyNumber}</CardTitle>
                          <CardDescription className="text-sm">
                            {policy.type} • {policy.status}
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
                            <DropdownMenuItem onClick={() => navigate(`/policies/${policy._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission('policies', 'edit') && (
                              <DropdownMenuItem onClick={() => navigate(`/policies/${policy._id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('policies', 'delete') && (
                              <DropdownMenuItem 
                                onClick={() => handleDeletePolicy(policy._id)}
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
                          <span className="font-medium w-20">Client:</span>
                          <span className="text-gray-600">{policy.clientId?.name || 'Client Name'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Company:</span>
                          <span className="text-gray-600">{policy.insuranceCompany}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Premium:</span>
                          <span className="text-gray-600">₹{policy.premium?.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant={policy.status === 'Active' ? 'default' : 'secondary'}>
                          {policy.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {/* Active policies content - similar structure */}
          </TabsContent>

          <TabsContent value="expired" className="space-y-6">
            {/* Expired policies content - similar structure */}
          </TabsContent>

          <TabsContent value="renewals" className="space-y-6">
            {/* Due renewals content - similar structure */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Policies;