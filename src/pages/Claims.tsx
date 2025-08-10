import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, FileText, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Calendar, UserCheck } from 'lucide-react';
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
import { claimsApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Claims = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    assignedTo: 'all'
  });
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, grid, kanban

  // Fetch claims with filters
  const { data: claimsData, isLoading, error } = useQuery({
    queryKey: ['claims', filters, searchTerm],
    queryFn: () => claimsApi.getClaims({ ...filters, search: searchTerm }),
    enabled: hasPermission('claims', 'view')
  });

  // Fetch claim statistics
  const { data: statsData } = useQuery({
    queryKey: ['claimStats'],
    queryFn: () => claimsApi.getClaimStats(),
    enabled: hasPermission('claims', 'view')
  });

  // Delete claim mutation
  const deleteClaimMutation = useMutation({
    mutationFn: (claimId) => claimsApi.deleteClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries(['claims']);
      queryClient.invalidateQueries(['claimStats']);
      toast.success('Claim deleted successfully');
      setSelectedClaims([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete claim');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (claimIds) => claimsApi.bulkDeleteClaims(claimIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['claims']);
      queryClient.invalidateQueries(['claimStats']);
      toast.success(`${selectedClaims.length} claims deleted successfully`);
      setSelectedClaims([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete claims');
    }
  });

  const handleDeleteClaim = (claimId) => {
    if (confirm('Are you sure you want to delete this claim?')) {
      deleteClaimMutation.mutate(claimId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedClaims.length} claims?`)) {
      bulkDeleteMutation.mutate(selectedClaims);
    }
  };

  const handleClaimSelect = (claimId, isSelected) => {
    if (isSelected) {
      setSelectedClaims(prev => [...prev, claimId]);
    } else {
      setSelectedClaims(prev => prev.filter(id => id !== claimId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedClaims(claimsData?.claims?.map(claim => claim._id) || []);
    } else {
      setSelectedClaims([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Pending': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Under Review': return 'outline';
      case 'Settled': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'outline';
      case 'Low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!hasPermission('claims', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the claims module.
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
              {error.message || 'Failed to load claims'}
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
              <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
              <p className="text-sm text-gray-600">
                Process insurance claims, track status, and manage settlements
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('claims', 'create') && (
                <Button onClick={() => navigate('/claims/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Claim
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
              <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.pending || 0}</div>
              <p className="text-xs text-muted-foreground">
                {statsData?.pendingPercentage || 0}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statsData?.totalAmount?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData?.amountGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Settled Claims</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.settled || 0}</div>
              <p className="text-xs text-muted-foreground">
                {statsData?.settledPercentage || 0}% of total
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
                    placeholder="Search claims by number, client name..."
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Settled">Settled</SelectItem>
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

                <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
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
        {selectedClaims.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedClaims.length} claims selected
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
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign To
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedClaims([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Claims ({claimsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({statsData?.pending || 0})</TabsTrigger>
            <TabsTrigger value="under-review">Under Review ({statsData?.underReview || 0})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({statsData?.approved || 0})</TabsTrigger>
            <TabsTrigger value="settled">Settled ({statsData?.settled || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {viewMode === 'table' && (
              <Card>
                <CardHeader>
                  <CardTitle>Claims List</CardTitle>
                  <CardDescription>
                    View and manage all insurance claims
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {claimsData?.claims?.map((claim) => (
                      <div key={claim._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedClaims.includes(claim._id)}
                            onChange={(e) => handleClaimSelect(claim._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{claim.claimNumber}</h3>
                              <Badge variant={getStatusColor(claim.status)}>
                                {claim.status}
                              </Badge>
                              <Badge variant={getPriorityColor(claim.priority)}>
                                {claim.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{claim.clientId?.name || 'Client Name'}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{claim.type} • {claim.policyId?.policyNumber || 'Policy N/A'}</span>
                              <span>₹{claim.claimAmount?.toLocaleString()} claimed</span>
                              <span>{claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/claims/${claim._id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission('claims', 'edit') && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/claims/${claim._id}/edit`)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('claims', 'delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClaim(claim._id)}>
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
                {(claimsData?.claims || []).map((claim) => (
                  <Card key={claim._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                          <CardDescription className="text-sm">
                            {claim.type} • {claim.status}
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
                            <DropdownMenuItem onClick={() => navigate(`/claims/${claim._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission('claims', 'edit') && (
                              <DropdownMenuItem onClick={() => navigate(`/claims/${claim._id}/edit`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {hasPermission('claims', 'delete') && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClaim(claim._id)}
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
                          <span className="text-gray-600">{claim.clientId?.name || 'Client Name'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Policy:</span>
                          <span className="text-gray-600">{claim.policyId?.policyNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Amount:</span>
                          <span className="text-gray-600">₹{claim.claimAmount?.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                          <Badge variant={getPriorityColor(claim.priority)}>
                            {claim.priority}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {claim.incidentDate ? new Date(claim.incidentDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {/* Pending claims content - similar structure */}
          </TabsContent>

          <TabsContent value="under-review" className="space-y-6">
            {/* Under review claims content - similar structure */}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            {/* Approved claims content - similar structure */}
          </TabsContent>

          <TabsContent value="settled" className="space-y-6">
            {/* Settled claims content - similar structure */}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Claims;