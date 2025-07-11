
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvoicesTable from '@/components/invoices/InvoicesTable';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoiceStatsCards from '@/components/invoices/InvoiceStatsCards';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PaymentReminderManager from '@/components/invoices/PaymentReminderManager';
import { useInvoicesBackend } from '@/hooks/useInvoicesBackend';

const Invoices = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState({
    status: 'all',
    dateRange: 'all',
    clientId: 'all',
    searchTerm: '',
    page: 1,
    limit: 50
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'issueDate',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  // Use backend hooks for data fetching
  const { data: invoicesData, isLoading, error } = useInvoicesBackend(filterParams);

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };
  
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
    
    // Update filter params to include sorting
    setFilterParams(prev => ({
      ...prev,
      sortBy: key,
      sortOrder: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
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
      dateRange: 'all',
      clientId: 'all',
      searchTerm: '',
      page: 1,
      limit: 50
    });
    setActiveFilters({});
  };
  
  const handleExportInvoices = (invoices) => {
    // In a real app, this would generate a CSV/Excel file
    toast.success(`Exported ${invoices.length} invoices to CSV`);
  };

  const handleFilterChange = (newFilters) => {
    setFilterParams(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };

  // Show professional loading skeleton
  if (isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="p-6">
          <div className="text-center text-red-600">
            <h2 className="text-lg font-semibold mb-2">Error Loading Invoices</h2>
            <p className="text-sm">{error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      {/* Statistics Cards */}
      <InvoiceStatsCards filterParams={filterParams} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="reminders">Payment Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
            <InvoiceFilters 
              filterParams={filterParams} 
              setFilterParams={handleFilterChange}
              activeFilters={activeFilters}
              updateActiveFilters={updateActiveFilters}
              clearAllFilters={clearAllFilters}
            />
          </Card>
          
          <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
            <InvoicesTable 
              invoicesData={invoicesData}
              filterParams={filterParams} 
              sortConfig={sortConfig}
              handleSort={handleSort}
              handleExport={handleExportInvoices}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
            <InvoiceFilters 
              filterParams={{...filterParams, status: 'draft'}} 
              setFilterParams={handleFilterChange}
              activeFilters={activeFilters}
              updateActiveFilters={updateActiveFilters}
              clearAllFilters={clearAllFilters}
            />
          </Card>
          
          <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
            <InvoicesTable 
              invoicesData={invoicesData}
              filterParams={{...filterParams, status: 'draft'}} 
              sortConfig={sortConfig}
              handleSort={handleSort}
              handleExport={handleExportInvoices}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          <Card className="mb-4 sm:mb-6 border-0 shadow-sm">
            <InvoiceFilters 
              filterParams={{...filterParams, status: 'sent'}} 
              setFilterParams={handleFilterChange}
              activeFilters={activeFilters}
              updateActiveFilters={updateActiveFilters}
              clearAllFilters={clearAllFilters}
            />
          </Card>
          
          <div className="max-w-full overflow-x-hidden mb-20 sm:mb-0">
            <InvoicesTable 
              invoicesData={invoicesData}
              filterParams={{...filterParams, status: 'sent'}} 
              sortConfig={sortConfig}
              handleSort={handleSort}
              handleExport={handleExportInvoices}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <PaymentReminderManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
