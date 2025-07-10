
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, FileUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClaimsTable from '@/components/claims/ClaimsTable';
import { useIsMobile } from '@/hooks/use-mobile';
import ClaimFilters from '@/components/claims/ClaimFilters';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import ClaimStatsCards from '@/components/claims/ClaimStatsCards';
import BulkOperationsToolbar from '@/components/claims/BulkOperationsToolbar';
import ClaimsReports from '@/components/claims/ClaimsReports';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart } from 'lucide-react';
import Protected from '@/components/Protected';
import { useClaims, useExportClaims } from '../hooks/useClaims';
import ClaimCreateForm from '@/components/claims/ClaimCreateForm';

const Claims = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    claimType: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Connect to MongoDB for claims data
  const { data: claimsResponse, isLoading, error } = useClaims({
    ...filterParams,
    search: filterParams.searchTerm,
    sortField,
    sortDirection
  });

  // Connect to MongoDB for export
  const exportClaimsMutation = useExportClaims();

  const claims = claimsResponse?.data || [];
  const pagination = claimsResponse?.pagination || {};

  const handleCreateClaim = () => {
    setShowCreateForm(true);
  };

  const handleCreateSuccess = (claim) => {
    setShowCreateForm(false);
    toast.success('Claim created successfully!');
    // Navigate to the created claim detail page
    navigate(`/claims/${claim._id}`);
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  const handleExport = async () => {
    try {
      console.log('Exporting claims from MongoDB with filters:', filterParams);
      
      // Use the MongoDB export API
      const result = await exportClaimsMutation.mutateAsync(filterParams);
      
      // Create and download CSV
      if (result.data && result.data.length > 0) {
        const csv = convertToCSV(result.data);
        downloadCSV(csv, 'claims-export.csv');
        toast.success(`Exported ${result.data.length} claims successfully`);
      } else {
        toast.info('No claims found to export');
      }
      
      console.log('Claims exported successfully from MongoDB');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export claims data from database');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBulkAction = (action, claimIds) => {
    console.log('Bulk action:', action, claimIds);
    // Handle bulk actions here - these will connect to MongoDB
  };

  const handleClaimSelection = (claimId, selected) => {
    if (selected) {
      setSelectedClaims(prev => [...prev, claimId]);
    } else {
      setSelectedClaims(prev => prev.filter(id => id !== claimId));
    }
  };

  const handleClearSelection = () => {
    setSelectedClaims([]);
  };

  const filterOptions = ['all', 'Auto', 'Home', 'Life', 'Health', 'Travel', 'Business', 'Disability', 'Property', 'Liability'];

  const setSelectedFilter = (value) => {
    setFilterParams({...filterParams, claimType: value, page: 1});
    updateActiveFilters('Claim Type', value === 'all' ? null : value);
  };

  const updateActiveFilters = (name, value) => {
    if (value === null) {
      setActiveFilters(activeFilters.filter(filter => filter.name !== name));
      return;
    }
    
    const existingFilterIndex = activeFilters.findIndex(filter => filter.name === name);
    if (existingFilterIndex !== -1) {
      const updatedFilters = [...activeFilters];
      updatedFilters[existingFilterIndex] = { name, value };
      setActiveFilters(updatedFilters);
    } else {
      setActiveFilters([...activeFilters, { name, value }]);
    }
  };

  const removeFilter = (filterName) => {
    if (filterName === 'Claim Type') {
      setFilterParams({...filterParams, claimType: 'all', page: 1});
    } else if (filterName === 'Status') {
      setFilterParams({...filterParams, status: 'all', page: 1});
    }
    setActiveFilters(activeFilters.filter(filter => filter.name !== filterName));
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Claims</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the database. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create New Claim</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Real-time database operations
          </p>
        </div>
        <ClaimCreateForm 
          onCancel={handleCreateCancel}
          onSuccess={handleCreateSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Claims Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connected to MongoDB • Real-time database operations
          </p>
        </div>
        <div className="flex gap-2">
          <Protected module="claims" action="view">
            <Dialog open={showReports} onOpenChange={setShowReports}>
              <DialogTrigger asChild>
                <Button variant="outline" className={isMobile ? "w-full" : ""}>
                  <BarChart className="mr-2 h-4 w-4" /> Reports
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Claims Reports & Analytics</DialogTitle>
                </DialogHeader>
                <ClaimsReports />
              </DialogContent>
            </Dialog>
          </Protected>
          
          <Protected module="claims" action="export">
            <Button 
              variant="outline" 
              className={isMobile ? "w-full" : ""}
              onClick={handleExport}
              disabled={exportClaimsMutation.isLoading}
            >
              <Download className="mr-2 h-4 w-4" /> 
              {exportClaimsMutation.isLoading ? 'Exporting...' : 'Export'}
            </Button>
          </Protected>
          
          <Protected module="claims" action="create">
            <Button onClick={handleCreateClaim} className={isMobile ? "w-full" : ""}>
              <Plus className="mr-2 h-4 w-4" /> Create Claim
            </Button>
          </Protected>
        </div>
      </div>

      {/* Claims Statistics Cards */}
      <ClaimStatsCards />

      <div className="mb-6">
        <ClaimFilters
          searchTerm={filterParams.searchTerm}
          setSearchTerm={(value) => setFilterParams({...filterParams, searchTerm: value, page: 1})}
          selectedFilter={filterParams.claimType}
          setSelectedFilter={setSelectedFilter}
          filterOptions={filterOptions}
          handleExport={handleExport}
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
          activeFilters={activeFilters}
          removeFilter={removeFilter}
        />
      </div>

      {/* Bulk Operations Toolbar */}
      <BulkOperationsToolbar
        selectedClaims={selectedClaims}
        onClearSelection={handleClearSelection}
        onBulkAction={handleBulkAction}
        agents={[]} // Add agents data here
      />

      <ClaimsTable 
        claims={claims}
        pagination={pagination}
        isLoading={isLoading}
        filterParams={filterParams} 
        setFilterParams={setFilterParams} 
        sortField={sortField}
        sortDirection={sortDirection}
        setSortField={setSortField}
        setSortDirection={setSortDirection}
        updateActiveFilters={updateActiveFilters}
        selectedClaims={selectedClaims}
        onClaimSelection={handleClaimSelection}
      />
    </div>
  );
};

export default Claims;
