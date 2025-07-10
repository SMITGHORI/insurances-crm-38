
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Archive, 
  Eye, 
  EyeOff, 
  Trash2, 
  Tag, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { activitiesApi } from '@/services/api/activitiesApi';

const ActivityManager = ({ activities, onUpdate, selectedIds, onSelectionChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkOperation = useCallback(async (operation, value = null) => {
    if (selectedIds.length === 0) {
      toast.error('Please select activities first');
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      switch (operation) {
        case 'archive':
          result = await activitiesApi.archiveActivities(selectedIds);
          toast.success(`${selectedIds.length} activities archived`);
          break;
        case 'hide':
          result = await activitiesApi.hideActivities(selectedIds);
          toast.success(`${selectedIds.length} activities hidden`);
          break;
        case 'show':
          result = await activitiesApi.showActivities(selectedIds);
          toast.success(`${selectedIds.length} activities restored`);
          break;
        case 'addTag':
          result = await activitiesApi.addTagToActivities(selectedIds, value);
          toast.success(`Tag "${value}" added to ${selectedIds.length} activities`);
          break;
        case 'changePriority':
          result = await activitiesApi.changePriorityOfActivities(selectedIds, value);
          toast.success(`Priority changed to ${value} for ${selectedIds.length} activities`);
          break;
        default:
          throw new Error('Unknown operation');
      }

      onUpdate();
      onSelectionChange([]);
    } catch (error) {
      console.error(`Bulk ${operation} failed:`, error);
      toast.error(`Failed to ${operation} activities`);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, onUpdate, onSelectionChange]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedIds.length} activities selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('archive')}
                  disabled={isProcessing}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('hide')}
                  disabled={isProcessing}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('show')}
                  disabled={isProcessing}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Show
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkOperation('changePriority', 'high')}
                  disabled={isProcessing}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  High Priority
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <div className="space-y-2">
        {activities.map((activity) => (
          <Card key={activity._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.includes(activity._id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectionChange([...selectedIds, activity._id]);
                    } else {
                      onSelectionChange(selectedIds.filter(id => id !== activity._id));
                    }
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{activity.description}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.entityType}: {activity.entityName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(activity.severity)}
                      <Badge 
                        className={`text-xs ${getPriorityColor(activity.priority)}`}
                        variant="secondary"
                      >
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {activity.operation}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        by {activity.userName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {activity.tags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivityManager;
