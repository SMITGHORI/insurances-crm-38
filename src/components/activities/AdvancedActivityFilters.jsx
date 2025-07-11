
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Filter,
  X,
  Calendar,
  Users,
  Tag,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const AdvancedActivityFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset,
  availableFilters = {}
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const removeFilter = (key) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key] && filters[key] !== 'all' && filters[key] !== ''
  ).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-destructive"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {availableFilters.types?.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Operation</Label>
            <Select
              value={filters.operation || 'all'}
              onValueChange={(value) => handleFilterChange('operation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Operations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                {availableFilters.operations?.map(operation => (
                  <SelectItem key={operation} value={operation}>
                    {operation.charAt(0).toUpperCase() + operation.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User</Label>
            <Select
              value={filters.userId || 'all'}
              onValueChange={(value) => handleFilterChange('userId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {availableFilters.users?.map(user => (
                  <SelectItem key={user.userId} value={user.userId}>
                    {user.userName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={filters.severity || 'all'}
                  onValueChange={(value) => handleFilterChange('severity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    {availableFilters.severities?.map(severity => (
                      <SelectItem key={severity} value={severity}>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            severity === 'critical' ? 'text-red-500' :
                            severity === 'high' ? 'text-orange-500' :
                            severity === 'medium' ? 'text-yellow-500' :
                            'text-green-500'
                          }`} />
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {availableFilters.categories?.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ').charAt(0).toUpperCase() + category.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <DatePicker
                  selected={filters.startDate ? new Date(filters.startDate) : null}
                  onSelect={(date) => handleFilterChange('startDate', date?.toISOString())}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <DatePicker
                  selected={filters.endDate ? new Date(filters.endDate) : null}
                  onSelect={(date) => handleFilterChange('endDate', date?.toISOString())}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Search in Details</Label>
              <Input
                placeholder="Search activity details..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status Options</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-archived"
                    checked={filters.includeArchived || false}
                    onCheckedChange={(checked) => handleFilterChange('includeArchived', checked)}
                  />
                  <Label htmlFor="include-archived">Include Archived</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="errors-only"
                    checked={filters.errorsOnly || false}
                    onCheckedChange={(checked) => handleFilterChange('errorsOnly', checked)}
                  />
                  <Label htmlFor="errors-only">Errors Only</Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium mb-2 block">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || value === 'all' || value === '') return null;
                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    <span className="text-xs">
                      {key}: {typeof value === 'string' ? value : 'custom'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFilter(key)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedActivityFilters;
