
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  Download, 
  SortAsc, 
  SortDesc,
  X,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ClaimFilters = ({
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  filterOptions,
  handleExport,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  activeFilters,
  removeFilter
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Reported', label: 'Reported' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Settled', label: 'Settled' },
    { value: 'Closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const amountRangeOptions = [
    { value: 'all', label: 'All Amounts' },
    { value: '0-1000', label: '$0 - $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000-50000', label: '$10,000 - $50,000' },
    { value: '50000+', label: '$50,000+' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'incidentDate', label: 'Incident Date' },
    { value: 'claimAmount', label: 'Claim Amount' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'claimNumber', label: 'Claim Number' }
  ];

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setDateRange('all');
    setAmountRange('all');
    activeFilters.forEach(filter => removeFilter(filter.name));
  };

  return (
    <div className="space-y-4">
      {/* Main Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search claims by number, client name, or description..."
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Claim Type" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'all' ? 'All Types' : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Controls */}
              <div className="flex gap-1">
                <Select value={sortField} onValueChange={setSortField}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortDirection}
                  className="px-3"
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced
              </Button>

              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters (Collapsible) */}
      <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Range</label>
                  <Select value={amountRange} onValueChange={setAmountRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amountRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleClearAllFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {filter.name}: {filter.value}
              <button
                onClick={() => removeFilter(filter.name)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default ClaimFilters;
