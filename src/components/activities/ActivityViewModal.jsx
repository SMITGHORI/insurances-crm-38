
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  User,
  MapPin,
  Globe,
  Monitor,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Tag,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const ActivityViewModal = ({ activity, isOpen, onClose }) => {
  if (!activity) return null;

  const getStatusIcon = (isSuccessful) => {
    return isSuccessful ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{activity.description}</h3>
              <div className="flex items-center gap-2">
                <Badge className={getOperationColor(activity.operation)}>
                  {activity.operation}
                </Badge>
                <Badge className={getSeverityColor(activity.severity)}>
                  {activity.severity}
                </Badge>
                <div className="flex items-center gap-1">
                  {getStatusIcon(activity.isSuccessful)}
                  <span className="text-sm">
                    {activity.isSuccessful ? 'Success' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View Entity
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(activity.createdAt), 'PPP p')}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })})
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">User:</span>
                  <span className="text-sm font-medium">{activity.userName}</span>
                  <Badge variant="outline" className="text-xs">
                    {activity.userRole}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Entity:</span>
                  <span className="text-sm font-medium">
                    {activity.entityType}: {activity.entityName}
                  </span>
                </div>

                {activity.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium">{activity.duration}ms</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Technical Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Activity ID:</span>
                  <span className="text-sm font-mono">{activity.activityId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">
                    {activity.category?.replace('_', ' ').charAt(0).toUpperCase() + 
                     activity.category?.replace('_', ' ').slice(1)}
                  </span>
                </div>

                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm text-gray-600">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {activity.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          {activity.metadata && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Metadata</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activity.metadata.ipAddress && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">IP Address:</span>
                      <span className="text-sm font-mono">{activity.metadata.ipAddress}</span>
                    </div>
                  )}
                  
                  {activity.metadata.device && (
                    <div className="flex items-center gap-2">
                      {activity.metadata.device === 'mobile' ? (
                        <Smartphone className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Monitor className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-600">Device:</span>
                      <span className="text-sm font-medium">{activity.metadata.device}</span>
                    </div>
                  )}
                  
                  {activity.metadata.browser && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Browser:</span>
                      <span className="text-sm font-medium">{activity.metadata.browser}</span>
                    </div>
                  )}
                  
                  {activity.metadata.method && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Method:</span>
                      <Badge variant="outline" className="text-xs">
                        {activity.metadata.method}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Change Details */}
          {activity.changeDetails && activity.changeDetails.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Changes Made</h4>
                <div className="space-y-2">
                  {activity.changeDetails.map((change, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{change.field}</span>
                        <Badge variant="outline" className="text-xs">
                          {change.dataType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Old Value:</span>
                          <div className="font-mono bg-red-50 p-2 rounded mt-1">
                            {change.oldValue || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">New Value:</span>
                          <div className="font-mono bg-green-50 p-2 rounded mt-1">
                            {change.newValue || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Error Information */}
          {!activity.isSuccessful && activity.errorMessage && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Error Details
                </h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-mono">
                    {activity.errorMessage}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {activity.details && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Additional Details</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{activity.details}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityViewModal;
