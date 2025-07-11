
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Send, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const QuotationTimeline = ({ quotationId }) => {
  // This would normally come from an API call
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Quotation Created',
      description: 'Quotation QT-2025-0001 was created',
      timestamp: '2025-01-10T09:00:00Z',
      user: 'John Agent',
      status: 'completed'
    },
    {
      id: 2,
      type: 'updated',
      title: 'Details Updated',
      description: 'Premium amount and coverage details were updated',
      timestamp: '2025-01-10T10:30:00Z',
      user: 'John Agent',
      status: 'completed'
    },
    {
      id: 3,
      type: 'sent',
      title: 'Quotation Sent',
      description: 'Quotation was sent to client@example.com',
      timestamp: '2025-01-10T11:15:00Z',
      user: 'John Agent',
      status: 'completed'
    },
    {
      id: 4,
      type: 'viewed',
      title: 'Client Viewed',
      description: 'Client opened and viewed the quotation',
      timestamp: '2025-01-10T14:22:00Z',
      user: 'Client',
      status: 'completed'
    },
    {
      id: 5,
      type: 'follow-up',
      title: 'Follow-up Scheduled',
      description: 'Follow-up call scheduled for tomorrow',
      timestamp: '2025-01-11T09:00:00Z',
      user: 'System',
      status: 'pending'
    }
  ];

  const getEventIcon = (type) => {
    const iconMap = {
      created: FileText,
      updated: FileText,
      sent: Send,
      viewed: Eye,
      accepted: CheckCircle,
      rejected: XCircle,
      expired: Clock,
      'follow-up': Calendar
    };

    const IconComponent = iconMap[type] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEventColor = (type, status) => {
    if (status === 'pending') return 'text-yellow-600 bg-yellow-50';
    
    const colorMap = {
      created: 'text-blue-600 bg-blue-50',
      updated: 'text-purple-600 bg-purple-50',
      sent: 'text-green-600 bg-green-50',
      viewed: 'text-indigo-600 bg-indigo-50',
      accepted: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50',
      expired: 'text-orange-600 bg-orange-50',
      'follow-up': 'text-gray-600 bg-gray-50'
    };

    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.completed;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Timeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {timelineEvents.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {timelineEvents.filter(e => e.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {timelineEvents.filter(e => e.type === 'sent').length}
              </p>
              <p className="text-sm text-gray-600">Sent Count</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {timelineEvents.filter(e => e.type === 'updated').length}
              </p>
              <p className="text-sm text-gray-600">Updates Made</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Events */}
      <Card>
        <CardHeader>
          <CardTitle>Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {/* Timeline Line */}
                {index < timelineEvents.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className="flex gap-4">
                  {/* Event Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event.type, event.status)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {event.user}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(
              timelineEvents.reduce((acc, event) => {
                acc[event.type] = (acc[event.type] || 0) + 1;
                return acc;
              }, {})
            ).map(([type, count]) => (
              <div key={type} className="text-center p-3 border rounded">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${getEventColor(type, 'completed')}`}>
                  {getEventIcon(type)}
                </div>
                <p className="font-semibold">{count}</p>
                <p className="text-xs text-gray-600 capitalize">{type.replace('-', ' ')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timelineEvents
              .filter(event => {
                const eventDate = new Date(event.timestamp);
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return eventDate > sevenDaysAgo;
              })
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event.type, event.status)}`}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                  </div>
                  {getStatusBadge(event.status)}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationTimeline;
