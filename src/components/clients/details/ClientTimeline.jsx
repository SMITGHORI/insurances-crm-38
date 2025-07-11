
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  FileText, 
  Phone, 
  Mail, 
  Shield,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const ClientTimeline = ({ clientId }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Mock timeline data - replace with actual API call
  const mockTimelineEvents = [
    {
      id: '1',
      type: 'policy_created',
      title: 'New Policy Created',
      description: 'Health Insurance Policy HLT2024001 created',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      user: 'Agent Smith',
      metadata: { policyNumber: 'HLT2024001', premium: 25000 }
    },
    {
      id: '2',
      type: 'document_uploaded',
      title: 'Document Uploaded',
      description: 'PAN Card document uploaded',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      user: 'System Admin',
      metadata: { documentType: 'PAN', fileName: 'pan_card.pdf' }
    },
    {
      id: '3',
      type: 'contact_made',
      title: 'Client Contact',
      description: 'Phone call made to discuss policy options',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      user: 'Agent Smith',
      metadata: { contactType: 'Phone', duration: '15 minutes' }
    },
    {
      id: '4',
      type: 'client_created',
      title: 'Client Account Created',
      description: 'New client account created in the system',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      user: 'System Admin',
      metadata: { clientId: 'CL001', clientType: 'Individual' }
    },
    {
      id: '5',
      type: 'payment_received',
      title: 'Payment Received',
      description: 'Premium payment received for policy HLT2024001',
      timestamp: new Date(Date.now() - 518400000), // 6 days ago
      user: 'Finance Team',
      metadata: { amount: 25000, paymentMethod: 'Online Transfer' }
    }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'policy_created', label: 'Policies' },
    { value: 'document_uploaded', label: 'Documents' },
    { value: 'contact_made', label: 'Communications' },
    { value: 'payment_received', label: 'Payments' }
  ];

  const filteredEvents = selectedFilter === 'all' 
    ? mockTimelineEvents 
    : mockTimelineEvents.filter(event => event.type === selectedFilter);

  const getEventIcon = (type) => {
    switch (type) {
      case 'policy_created': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'document_uploaded': return <FileText className="h-4 w-4 text-green-600" />;
      case 'contact_made': return <Phone className="h-4 w-4 text-orange-600" />;
      case 'payment_received': return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'client_created': return <User className="h-4 w-4 text-gray-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'policy_created': return 'border-blue-200 bg-blue-50';
      case 'document_uploaded': return 'border-green-200 bg-green-50';
      case 'contact_made': return 'border-orange-200 bg-orange-50';
      case 'payment_received': return 'border-purple-200 bg-purple-50';
      case 'client_created': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Client Timeline</span>
            </CardTitle>
            
            {/* Filter Controls */}
            <div className="flex space-x-2">
              {eventTypes.map(type => (
                <Badge
                  key={type.value}
                  variant={selectedFilter === type.value ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedFilter(type.value)}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No timeline events found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
              
              {/* Timeline Events */}
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center z-10">
                      {getEventIcon(event.type)}
                    </div>
                    
                    {/* Event Content */}
                    <div className={`flex-1 p-4 rounded-lg border ${getEventColor(event.type)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{event.user}</span>
                        </div>
                        
                        {event.metadata && (
                          <div className="flex items-center space-x-2">
                            {Object.entries(event.metadata).map(([key, value]) => (
                              <span key={key} className="bg-white px-2 py-1 rounded">
                                {key}: {typeof value === 'number' && key.includes('amount') || key.includes('premium') 
                                  ? `₹${value.toLocaleString()}` 
                                  : value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTimeline;
