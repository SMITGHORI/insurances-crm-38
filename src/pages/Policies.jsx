
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePolicies, usePolicyStats, useExpiringPolicies } from '@/hooks/usePolicies';
import { Plus, Search, Filter, Download, AlertTriangle, TrendingUp, FileText, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { PageSkeleton } from '@/components/ui/professional-skeleton';

const Policies = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Prepare query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== 'All' && { status: statusFilter }),
    ...(typeFilter !== 'all' && { type: typeFilter })
  };

  // Fetch data using MongoDB hooks
  const { data: policiesData, isLoading: policiesLoading, error: policiesError } = usePolicies(queryParams);
  const { data: statsData, isLoading: statsLoading } = usePolicyStats();
  const { data: expiringData, isLoading: expiringLoading } = useExpiringPolicies(30);

  const policies = policiesData?.data || [];
  const pagination = policiesData?.pagination;
  const stats = statsData || {};
  const expiringPolicies = expiringData || [];

  const loading = policiesLoading || statsLoading || expiringLoading;

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, typeFilter]);

  // Handle errors
  useEffect(() => {
    if (policiesError) {
      console.error('Policies error:', policiesError);
      toast.error('Failed to load policies from database');
    }
  }, [policiesError]);

  const handleCreatePolicy = () => {
    navigate('/policies/create');
  };

  const handleViewPolicy = (policyId) => {
    navigate(`/policies/${policyId}`);
  };

  const handleEditPolicy = (policyId) => {
    navigate(`/policies/edit/${policyId}`);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Expired':
        return 'destructive';
      case 'Cancelled':
        return 'secondary';
      case 'Proposal':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      'health': 'bg-blue-100 text-blue-800',
      'life': 'bg-green-100 text-green-800',
      'motor': 'bg-orange-100 text-orange-800',
      'home': 'bg-purple-100 text-purple-800',
      'travel': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Policies Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Real-time data from database
          </p>
        </div>
        <Button onClick={handleCreatePolicy} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Total Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              {stats.totalPolicies || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {stats.activePolicies || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <AlertTriangle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {expiringPolicies.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
              <Users className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              Total Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              ₹{((stats.totalPremium || 0) / 100000).toFixed(1)}L
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search policies by number, client, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-base sm:text-lg">Policies List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {policies.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'All' || typeFilter !== 'all'
                  ? 'No policies match your current filters'
                  : 'Get started by creating your first policy'}
              </p>
              <Button onClick={handleCreatePolicy}>
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              {!isMobile && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Policy Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Premium
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {policies.map((policy) => (
                        <tr key={policy._id || policy.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {policy.policyNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {policy.insuranceCompany}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {policy.client?.name || 'Unknown Client'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {policy.client?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getTypeBadgeColor(policy.type)}>
                              {policy.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{parseInt(policy.premium || 0).toLocaleString()}
                            <div className="text-xs text-gray-500">
                              {policy.paymentFrequency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusBadgeVariant(policy.status)}>
                              {policy.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPolicy(policy._id || policy.id)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPolicy(policy._id || policy.id)}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Mobile Cards */}
              {isMobile && (
                <div className="space-y-3 p-3">
                  {policies.map((policy) => (
                    <Card key={policy._id || policy.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4" onClick={() => handleViewPolicy(policy._id || policy.id)}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm text-gray-900 truncate">
                              {policy.policyNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {policy.insuranceCompany}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(policy.status)} className="ml-2">
                            {policy.status}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                          <span>{policy.client?.name || 'Unknown Client'}</span>
                          <Badge className={getTypeBadgeColor(policy.type)} size="sm">
                            {policy.type}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            ₹{parseInt(policy.premium || 0).toLocaleString()}
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPolicy(policy._id || policy.id);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalItems)} of {pagination.totalItems} policies
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
