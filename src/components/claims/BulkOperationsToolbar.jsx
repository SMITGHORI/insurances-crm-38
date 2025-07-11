
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import claimsBackendApi from '../../services/api/claimsApiBackend';

const BulkOperationsToolbar = ({ 
  selectedClaims, 
  onClearSelection, 
  onBulkAction,
  agents = []
}) => {
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAgent, setBulkAgent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (selectedClaims.length === 0) {
    return null;
  }

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      toast.error('Please select a status');
      return;
    }

    setIsLoading(true);
    try {
      await claimsBackendApi.bulkUpdateClaims(selectedClaims, { status: bulkStatus });
      toast.success(`Updated ${selectedClaims.length} claims to ${bulkStatus}`);
      onBulkAction('status_update', selectedClaims);
      onClearSelection();
      setBulkStatus('');
    } catch (error) {
      console.error('Bulk status update error:', error);
      toast.error('Failed to update claim statuses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAgent) {
      toast.error('Please select an agent');
      return;
    }

    setIsLoading(true);
    try {
      await claimsBackendApi.bulkAssignClaims(selectedClaims, bulkAgent);
      toast.success(`Assigned ${selectedClaims.length} claims to agent`);
      onBulkAction('assign', selectedClaims);
      onClearSelection();
      setBulkAgent('');
    } catch (error) {
      console.error('Bulk assign error:', error);
      toast.error('Failed to assign claims');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedClaims.length} claims? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    try {
      // Delete claims one by one (if bulk delete endpoint doesn't exist)
      for (const claimId of selectedClaims) {
        await claimsBackendApi.deleteClaim(claimId);
      }
      toast.success(`Deleted ${selectedClaims.length} claims`);
      onBulkAction('delete', selectedClaims);
      onClearSelection();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete claims');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedClaims.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Bulk Status Update */}
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Reported">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reported
                  </div>
                </SelectItem>
                <SelectItem value="Under Review">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Under Review
                  </div>
                </SelectItem>
                <SelectItem value="Approved">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Approved
                  </div>
                </SelectItem>
                <SelectItem value="Rejected">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Rejected
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || isLoading}
            >
              Update Status
            </Button>
          </div>

          {/* Bulk Assign */}
          <div className="flex items-center gap-2">
            <Select value={bulkAgent} onValueChange={setBulkAgent}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Assign to" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {agent.firstName} {agent.lastName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkAssign}
              disabled={!bulkAgent || isLoading}
            >
              Assign
            </Button>
          </div>

          {/* Bulk Delete */}
          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;
