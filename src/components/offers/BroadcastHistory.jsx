
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useBroadcasts, useDeleteBroadcast, useBroadcastStats } from '@/hooks/useOffersAndBroadcasts';

const BroadcastHistory = () => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    channel: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [selectedBroadcast, setSelectedBroadcast] = useState(null);

  const { data: broadcastsData, isLoading } = useBroadcasts({
    ...filters,
    page: 1,
    limit: 50
  });

  const { data: statsData } = useBroadcastStats(selectedBroadcast);
  const deleteBroadcastMutation = useDeleteBroadcast();

  const broadcasts = broadcastsData?.data || [];
  const totalBroadcasts = broadcastsData?.pagination?.totalItems || 0;

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      offer: 'bg-orange-100 text-orange-800',
      festival: 'bg-purple-100 text-purple-800',
      announcement: 'bg-blue-100 text-blue-800',
      promotion: 'bg-green-100 text-green-800',
      newsletter: 'bg-indigo-100 text-indigo-800',
      reminder: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (broadcastId) => {
    if (window.confirm('Are you sure you want to delete this broadcast?')) {
      try {
        await deleteBroadcastMutation.mutateAsync(broadcastId);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Broadcast History</h3>
          <p className="text-sm text-gray-500">{totalBroadcasts} total broadcasts</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search broadcasts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="offer">Offers</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="newsletter">Newsletter</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.channel} onValueChange={(value) => handleFilterChange('channel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="scheduledAt">Scheduled Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Broadcast List */}
      <div className="space-y-4">
        {broadcasts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts found</h3>
              <p className="text-gray-500">No broadcasts match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          broadcasts.map((broadcast) => (
            <Card key={broadcast._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                      <Badge className={getTypeColor(broadcast.type)}>
                        {broadcast.type}
                      </Badge>
                      <Badge className={getStatusColor(broadcast.status)}>
                        {broadcast.status}
                      </Badge>
                    </div>

                    {broadcast.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{broadcast.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(broadcast.createdAt)}</span>
                      </div>
                      
                      {broadcast.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {formatDate(broadcast.scheduledAt)}</span>
                        </div>
                      )}

                      {broadcast.stats?.totalRecipients && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{broadcast.stats.totalRecipients} recipients</span>
                        </div>
                      )}
                    </div>

                    {/* Channels */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-500">Channels:</span>
                      {broadcast.channels?.map(channel => (
                        <div key={channel} className="flex items-center gap-1">
                          {channel === 'email' && <Mail className="h-4 w-4" />}
                          {channel === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                          <span className="text-sm capitalize">{channel}</span>
                        </div>
                      ))}
                    </div>

                    {/* Stats Summary */}
                    {broadcast.stats && (
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">
                          ✓ Sent: {broadcast.stats.sentCount || 0}
                        </span>
                        <span className="text-blue-600">
                          📧 Delivered: {broadcast.stats.deliveredCount || 0}
                        </span>
                        {broadcast.stats.failedCount > 0 && (
                          <span className="text-red-600">
                            ✗ Failed: {broadcast.stats.failedCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedBroadcast(broadcast._id)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    {broadcast.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(broadcast._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Modal/Panel */}
      {selectedBroadcast && statsData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Broadcast Statistics</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBroadcast(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statsData.data?.broadcast?.stats?.totalRecipients || 0}
                </div>
                <div className="text-sm text-gray-500">Total Recipients</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsData.data?.broadcast?.stats?.sentCount || 0}
                </div>
                <div className="text-sm text-gray-500">Messages Sent</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {statsData.data?.broadcast?.stats?.deliveredCount || 0}
                </div>
                <div className="text-sm text-gray-500">Delivered</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statsData.data?.broadcast?.stats?.failedCount || 0}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BroadcastHistory;
