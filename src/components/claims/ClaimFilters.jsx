
import React from 'react';
import { Search, Filter, Download, SortAsc, SortDesc, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  removeFilter,
  placeholderText = "Search claims..."
}) => {
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              className="pl-10 pr-3"
              placeholder={placeholderText}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-amba-blue focus:border-amba-blue"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => toggleSort('client')}
            >
              Client
              {sortField === 'client' && (
                sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => toggleSort('status')}
            >
              Status
              {sortField === 'status' && (
                sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              )}
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2"
              onClick={() => toggleSort('amount')}
            >
              Amount
              {sortField === 'amount' && (
                sortDirection === 'asc' ? 
                <SortAsc className="h-3 w-3" /> : 
                <SortDesc className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleExport}
            variant="outline"
            className="inline-flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      {activeFilters && activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter.name}: {filter.value}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1" 
                onClick={() => removeFilter(filter.name)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimFilters;
