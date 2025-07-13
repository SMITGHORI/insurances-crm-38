
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuotationsTable from '@/components/quotations/QuotationsTable';
import QuotationFilters from '@/components/quotations/QuotationFilters';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useQuotations, useExportQuotations } from '@/hooks/useQuotations';
import QuotationStatsCards from '@/components/quotations/QuotationStatsCards';

const Quotations = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    insuranceType: 'all',
    dateRange: 'all',
    agentId: 'all',
    searchTerm: '',
    page: 1,
    limit: 10
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState({});

  // Fetch quotations with current filters
  const { 
    data: quotationsData, 
    isLoading, 
    error,
    refetch 
  } = useQuotations({
    ...filterParams,
    sortBy: sortConfig.key,
    sortOrder: sortConfig.direction,
    search: filterParams.searchTerm
  });

  const exportMutation = useExportQuotations();

  const handleCreateQuotation = () => {
    navigate('/quotations/create');
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const updateActiveFilters = (filterName, value) => {
    setActiveFilters(prev => {
      if (!value || value === 'all') {
        const newFilters = { ...prev };
        delete newFilters[filterName];
        return newFilters;
      } else {
        return { ...prev, [filterName]: value };
      }
    });
  };
  
  const clearAllFilters = () => {
    setFilterParams({
      status: 'all',
      insuranceType: 'all',
      dateRange: 'all',
      agentId: 'all',
      searchTerm: '',
      page: 1,
      limit: 10
    });
    setActiveFilters({});
  };
  
  const handleExportQuotations = () => {
    exportMutation.mutate({
      format: 'csv',
      filters: filterParams
    });
  };

  const handleFilterChange = (newFilters) => {
    setFilterParams(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilterParams(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">Error Loading Quotations</p>
            <p className="mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  const quotations = quotationsData?.quotations || [];
  const pagination = quotationsData?.pagination || {};

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Quotation Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleExportQuotations} 
            variant="outline"
            disabled={exportMutation.isLoading}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> 
            {exportMutation.isLoading ? 'Exporting...' : 'Export'}
          </Button>
          <Button onClick={handleCreateQuotation} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> {isMobile ? 'Create' : 'Create Quotation'}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <QuotationStatsCards className="mb-6" />

      <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
        <QuotationFilters 
          filterParams={filterParams} 
          setFilterParams={handleFilterChange}
          activeFilters={activeFilters}
          updateActiveFilters={updateActiveFilters}
          clearAllFilters={clearAllFilters}
        />
      </Card>
      
      <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
        <QuotationsTable 
          quotations={quotations}
          pagination={pagination}
          filterParams={filterParams} 
          sortConfig={sortConfig}
          handleSort={handleSort}
          handleExport={handleExportQuotations}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Quotations;
