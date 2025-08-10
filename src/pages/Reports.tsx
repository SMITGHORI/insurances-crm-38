import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, FileText, TrendingUp, Calendar, DollarSign, BarChart3, PieChart, LineChart, Download as DownloadIcon, Share2, Printer, Eye as ViewIcon, Clock } from 'lucide-react';
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
import { reportsApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    category: 'all'
  });
  const [selectedReports, setSelectedReports] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch reports with filters
  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ['reports', filters, searchTerm, dateRange],
    queryFn: () => reportsApi.getReports({ ...filters, search: searchTerm, ...dateRange }),
    enabled: hasPermission('reports', 'view')
  });

  // Fetch report statistics
  const { data: statsData } = useQuery({
    queryKey: ['reportStats'],
    queryFn: () => reportsApi.getReportStats(),
    enabled: hasPermission('reports', 'view')
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: (reportConfig) => reportsApi.generateReport(reportConfig),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['reportStats']);
      toast.success('Report generated successfully');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate report');
    }
  });

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: (reportId) => reportsApi.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['reportStats']);
      toast.success('Report deleted successfully');
      setSelectedReports([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete report');
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (reportIds) => reportsApi.bulkDeleteReports(reportIds),
    onSuccess: () => {
      queryClient.invalidateQueries(['reports']);
      queryClient.invalidateQueries(['reportStats']);
      toast.success(`${selectedReports.length} reports deleted successfully`);
      setSelectedReports([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete reports');
    }
  });

  const handleGenerateReport = (reportType) => {
    const reportConfig = {
      type: reportType,
      dateRange: dateRange,
      filters: filters,
      format: 'pdf'
    };
    generateReportMutation.mutate(reportConfig);
  };

  const handleDeleteReport = (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      deleteReportMutation.mutate(reportId);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) {
      bulkDeleteMutation.mutate(selectedReports);
    }
  };

  const handleReportSelect = (reportId, isSelected) => {
    if (isSelected) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedReports(reportsData?.reports?.map(report => report._id) || []);
    } else {
      setSelectedReports([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Processing': return 'secondary';
      case 'Failed': return 'destructive';
      case 'Pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sales': return <BarChart3 className="h-5 w-5" />;
      case 'claims': return <FileText className="h-5 w-5" />;
      case 'financial': return <DollarSign className="h-5 w-5" />;
      case 'performance': return <TrendingUp className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'claims': return 'bg-green-100 text-green-800';
      case 'financial': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission('reports', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the reports module.
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
              {error.message || 'Failed to load reports'}
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-600">
                Generate, view, and analyze comprehensive business reports
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {hasPermission('reports', 'create') && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Report
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
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
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
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.thisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">
                Reports generated this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <DownloadIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.totalDownloads || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{statsData?.downloadGrowth || 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Generation Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData?.avgGenerationTime || 0}s</div>
              <p className="text-xs text-muted-foreground">
                Average time to generate reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Report Generation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Report Generation</CardTitle>
            <CardDescription>
              Generate common reports with one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col"
                onClick={() => handleGenerateReport('sales')}
                disabled={generateReportMutation.isPending}
              >
                <BarChart3 className="h-8 w-8 mb-2" />
                <span>Sales Report</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col"
                onClick={() => handleGenerateReport('claims')}
                disabled={generateReportMutation.isPending}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span>Claims Report</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col"
                onClick={() => handleGenerateReport('financial')}
                disabled={generateReportMutation.isPending}
              >
                <DollarSign className="h-8 w-8 mb-2" />
                <span>Financial Report</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-24 flex-col"
                onClick={() => handleGenerateReport('performance')}
                disabled={generateReportMutation.isPending}
              >
                <TrendingUp className="h-8 w-8 mb-2" />
                <span>Performance Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-1 gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search reports by name, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="claims">Claims</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Operations Toolbar */}
        {selectedReports.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedReports.length} reports selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Selected
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReports([])}>
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Reports ({reportsData?.total || 0})</TabsTrigger>
            <TabsTrigger value="recent">Recent ({statsData?.recent || 0})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({statsData?.favorites || 0})</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled ({statsData?.scheduled || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(reportsData?.reports || []).map((report) => (
                  <Card key={report._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(report.type)}`}>
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{report.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {report.type} • {report.status}
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
                            <DropdownMenuItem onClick={() => navigate(`/reports/${report._id}`)}>
                              <ViewIcon className="w-4 h-4 mr-2" />
                              View Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(report.downloadUrl, '_blank')}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </DropdownMenuItem>
                            {hasPermission('reports', 'delete') && (
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReport(report._id)}
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
                          <span className="font-medium w-20">Size:</span>
                          <span className="text-gray-600">{report.fileSize || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Format:</span>
                          <span className="text-gray-600">{report.format || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium w-20">Generated:</span>
                          <span className="text-gray-600">
                            {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {report.downloads || 0} downloads
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {viewMode === 'list' && (
              <Card>
                <CardHeader>
                  <CardTitle>Reports List</CardTitle>
                  <CardDescription>
                    View and manage all generated reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(reportsData?.reports || []).map((report) => (
                      <div key={report._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedReports.includes(report._id)}
                            onChange={(e) => handleReportSelect(report._id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(report.type)}`}>
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{report.name}</h3>
                              <Badge variant={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                              <Badge variant="outline">
                                {report.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{report.description || 'No description'}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Size: {report.fileSize || 'N/A'}</span>
                              <span>Format: {report.format || 'N/A'}</span>
                              <span>Downloads: {report.downloads || 0}</span>
                              <span>{report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${report._id}`)}>
                            <ViewIcon className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => window.open(report.downloadUrl, '_blank')}>
                            <Download className="w-4 h-4" />
                          </Button>
                          {hasPermission('reports', 'delete') && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report._id)}>
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
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {/* Recent reports content - similar structure */}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            {/* Favorites content - similar structure */}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            {/* Scheduled reports content - similar structure */}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Report Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Configure and generate a custom report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Report Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="claims">Claims Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Format</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" />
              </div>
            </div>
                                 <div className="flex justify-end gap-2">
                       <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                         Cancel
                       </Button>
              <Button onClick={() => {
                handleGenerateReport('custom');
                setIsCreateDialogOpen(false);
              }}>
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;