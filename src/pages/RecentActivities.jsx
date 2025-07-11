
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Star,
  Clock,
  AlertCircle,
  TrendingUp,
  Database,
  Wifi,
  RefreshCw,
  Settings,
  Download,
  BarChart3,
  Filter,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ActivityFilters from '@/components/activities/ActivityFilters';
import ActivityTabs from '@/components/activities/ActivityTabs';
import ActivitiesMobileView from '@/components/activities/ActivitiesMobileView';
import ActivitiesDesktopView from '@/components/activities/ActivitiesDesktopView';
import ActivityManager from '@/components/activities/ActivityManager';
import AdvancedActivityFilters from '@/components/activities/AdvancedActivityFilters';
import ActivityAnalytics from '@/components/activities/ActivityAnalytics';
import ActivityViewModal from '@/components/activities/ActivityViewModal';
import { useActivities, useRealtimeActivities, useActivityStats, useActivityFilters } from '@/hooks/useRecentActivities';
import { useActivityWebSocket } from '@/hooks/useActivityWebSocket';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useDebouncedValue } from '@/hooks/useDebouncedSearch';

const RecentActivities = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: 'all',
    operation: 'all',
    dateFilter: 'all',
    severity: 'all',
    category: 'all'
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const isMobile = useIsMobile();

  // Debounced search for better performance
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  // Memoized query parameters
  const queryParams = useMemo(() => ({
    search: debouncedSearchQuery,
    type: activeTab !== 'all' ? activeTab : filters.type,
    operation: filters.operation,
    dateFilter: filters.dateFilter,
    severity: filters.severity,
    category: filters.category,
    page: 1,
    limit: 100
  }), [debouncedSearchQuery, activeTab, filters]);

  // Use MongoDB-connected activities hooks
  const { data: activitiesData, isLoading, error, refetch } = useActivities(queryParams);
  const { data: statsData } = useActivityStats('7d');
  const { data: filtersData } = useActivityFilters();

  // Set up real-time updates
  const { refreshActivities } = useRealtimeActivities();

  // WebSocket connection for real-time updates
  const handleActivityUpdate = useCallback((data, updateType) => {
    switch (updateType) {
      case 'new':
      case 'updated':
        refreshActivities();
        break;
      case 'initial':
        // Handle initial activity load if needed
        break;
      case 'stats':
        // Handle stats update if needed
        break;
    }
  }, [refreshActivities]);

  const { isConnected: wsConnected, requestRefresh } = useActivityWebSocket(handleActivityUpdate);

  // Memoized activities data from MongoDB
  const activities = useMemo(() => activitiesData?.activities || [], [activitiesData]);

  // Memoized filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        debouncedSearchQuery === '' ||
        (activity.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.action?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.userName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.entityName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '') ||
        (activity.details?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || '');
      
      let matchesTab = true;
      if (activeTab !== 'all') {
        matchesTab = activity.type === activeTab;
      }
      
      return matchesSearch && matchesTab;
    });
  }, [activities, debouncedSearchQuery, activeTab]);

  // Activity counts for tabs
  const activityCounts = useMemo(() => {
    const counts = { total: activities.length };
    activities.forEach(activity => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
    });
    return counts;
  }, [activities]);

  // Set up real-time listeners for cross-module updates
  useEffect(() => {
    console.log('Setting up real-time MongoDB listeners for activities');
    
    const handleModuleUpdate = (event) => {
      console.log(`Activities module received ${event.type} event, refreshing data`);
      toast.info('Activities updated', {
        description: 'Real-time sync from MongoDB'
      });
      refreshActivities();
    };

    const events = [
      'client-updated', 'client-created', 'client-deleted',
      'policy-updated', 'policy-created', 'policy-deleted',
      'claim-updated', 'claim-created', 'claim-deleted',
      'lead-updated', 'lead-created', 'lead-deleted',
      'quotation-updated', 'quotation-created', 'quotation-deleted',
      'offer-updated', 'offer-created', 'offer-deleted',
      'broadcast-sent', 'broadcast-created'
    ];

    events.forEach(eventType => {
      window.addEventListener(eventType, handleModuleUpdate);
    });

    return () => {
      events.forEach(eventType => {
        window.removeEventListener(eventType, handleModuleUpdate);
      });
    };
  }, [refreshActivities]);

  // Callback functions
  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveTab('all');
    setFilters({
      type: 'all',
      operation: 'all',
      dateFilter: 'all',
      severity: 'all',
      category: 'all'
    });
    setSelectedActivityIds([]);
    toast.success('Filters have been reset');
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      console.log('Manual refresh of activities from MongoDB');
      toast.loading('Refreshing activities from MongoDB...');
      await refetch();
      if (wsConnected) {
        requestRefresh();
      }
      toast.success('Activities refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh activities:', error);
      toast.error('Failed to refresh activities');
    }
  }, [refetch, wsConnected, requestRefresh]);

  const handleExportActivities = useCallback(() => {
    try {
      const csvContent = [
        ['ID', 'Description', 'Type', 'Operation', 'User', 'Entity', 'Date', 'Status'],
        ...filteredActivities.map(activity => [
          activity.activityId,
          activity.description,
          activity.type,
          activity.operation,
          activity.userName,
          `${activity.entityType}: ${activity.entityName}`,
          new Date(activity.createdAt).toLocaleString(),
          activity.isSuccessful ? 'Success' : 'Failed'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activities-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Activities exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export activities');
    }
  }, [filteredActivities]);

  const handleViewActivity = useCallback((activity) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
  }, []);

  const handleUpdateActivities = useCallback(() => {
    refreshActivities();
  }, [refreshActivities]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client': return <Users className="h-4 w-4 text-blue-500" />;
      case 'policy': return <FileText className="h-4 w-4 text-green-500" />;
      case 'claim': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'quotation': return <Quote className="h-4 w-4 text-purple-500" />;
      case 'lead': return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Activities</h3>
          <p className="text-gray-500 mb-4">Failed to load activities from MongoDB</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recent Activities</h1>
          <p className="text-gray-500">
            Real-time activity monitoring from MongoDB
            {wsConnected && (
              <span className="inline-flex items-center gap-1 ml-2">
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600 text-sm">Live</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowManager(!showManager)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage
          </Button>
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
            onClick={handleExportActivities}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics View */}
      {showAnalytics && (
        <ActivityAnalytics 
          data={statsData}
          timeframe="7d"
        />
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <AdvancedActivityFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
          availableFilters={filtersData?.filters || {}}
        />
      )}

      {/* Basic Filters */}
      {!showAdvancedFilters && (
        <ActivityFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          availableFilters={filtersData?.filters || {}}
        />
      )}

      {/* Activity Tabs */}
      <ActivityTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activityCounts={activityCounts}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-blue-600">{activities.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {activities.length > 0 ? 
                    Math.round((activities.filter(a => a.isSuccessful).length / activities.length) * 100) 
                    : 100}%
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(activities.map(a => a.userId)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {activities.filter(a => !a.isSuccessful).length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Manager */}
      {showManager && (
        <ActivityManager
          activities={filteredActivities}
          onUpdate={handleUpdateActivities}
          selectedIds={selectedActivityIds}
          onSelectionChange={setSelectedActivityIds}
        />
      )}

      {/* Activities List */}
      {isMobile ? (
        <ActivitiesMobileView
          activities={filteredActivities}
          loading={isLoading}
          onView={handleViewActivity}
        />
      ) : (
        <ActivitiesDesktopView
          activities={filteredActivities}
          loading={isLoading}
          getActivityIcon={getActivityIcon}
          formatDate={formatDate}
          onView={handleViewActivity}
        />
      )}

      {/* Activity View Modal */}
      <ActivityViewModal
        activity={selectedActivity}
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
      />
    </div>
  );
};

export default RecentActivities;
