
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Quote, 
  TrendingUp, 
  User,
  Clock,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ activity, onView, onSelect, selected }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'client': return <Users className="h-4 w-4 text-blue-500" />;
      case 'policy': return <FileText className="h-4 w-4 text-green-500" />;
      case 'claim': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'quotation': return <Quote className="h-4 w-4 text-purple-500" />;
      case 'lead': return <TrendingUp className="h-4 w-4 text-indigo-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOperationColor = (operation) => {
    switch (operation) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <Card className={`border-l-4 ${getSeverityColor(activity.severity)} hover:shadow-md transition-shadow ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-gray-900 truncate">
                  {activity.description || activity.action}
                </h4>
                <Badge 
                  className={`text-xs ${getOperationColor(activity.operation)}`}
                  variant="secondary"
                >
                  {activity.operation}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">{activity.entityType}:</span> {activity.entityName}
                </p>
                <p className="text-xs text-gray-500">
                  by <span className="font-medium">{activity.userName}</span>
                  {activity.userRole && (
                    <span className="ml-1 text-gray-400">({activity.userRole})</span>
                  )}
                </p>
                {activity.details && (
                  <p className="text-xs text-gray-500 truncate">
                    {activity.details}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </div>
                
                <div className="flex items-center gap-1">
                  {activity.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView?.(activity)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelect?.(activity)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityItem;
