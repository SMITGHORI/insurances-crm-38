
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import ClaimStatusBadge from '../ClaimStatusBadge';
import claimsBackendApi from '../../../services/api/claimsApiBackend';

const ClaimStatus = ({ claimId }) => {
  const [currentStatus, setCurrentStatus] = useState('');
  const [reason, setReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    { value: 'Reported', label: 'Reported', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    { value: 'Under Review', label: 'Under Review', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Pending', label: 'Pending', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' },
    { value: 'Approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'Rejected', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' },
    { value: 'Settled', label: 'Settled', icon: DollarSign, color: 'bg-emerald-100 text-emerald-800' },
    { value: 'Closed', label: 'Closed', icon: CheckCircle, color: 'bg-gray-100 text-gray-800' }
  ];

  const handleStatusUpdate = async () => {
    if (!currentStatus) {
      toast.error('Please select a status');
      return;
    }

    if (currentStatus === 'Approved' && !approvedAmount) {
      toast.error('Approved amount is required for approved claims');
      return;
    }

    setIsLoading(true);
    try {
      await claimsBackendApi.updateClaimStatus(
        claimId, 
        currentStatus, 
        reason, 
        approvedAmount ? parseFloat(approvedAmount) : undefined
      );
      
      toast.success('Claim status updated successfully');
      
      // Reset form
      setCurrentStatus('');
      setReason('');
      setApprovedAmount('');
      
      // Refresh the page or update parent component
      window.location.reload();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update claim status');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const statusConfig = statusOptions.find(opt => opt.value === status);
    if (!statusConfig) return Clock;
    return statusConfig.icon;
  };

  return (
    <div className="space-y-6">
      {/* Current Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Status Information</p>
                <p className="text-sm text-gray-500">Current claim processing status</p>
              </div>
            </div>
            <ClaimStatusBadge status="Under Review" />
          </div>
        </CardContent>
      </Card>

      {/* Status Update Form */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => {
                  const IconComponent = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {currentStatus === 'Approved' && (
            <div className="space-y-2">
              <Label htmlFor="approvedAmount">Approved Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="approvedAmount"
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="Enter approved amount"
                  className="pl-10"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason/Comments</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for status change (optional)"
              rows={3}
            />
          </div>

          <Button 
            onClick={handleStatusUpdate}
            disabled={isLoading || !currentStatus}
            className="w-full"
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample status history - in real implementation, this would come from API */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Claim Reported</p>
                  <Badge className="bg-blue-100 text-blue-800">Reported</Badge>
                </div>
                <p className="text-sm text-gray-500">Initial claim submission</p>
                <p className="text-xs text-gray-500">2 days ago by System</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Under Review</p>
                  <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
                </div>
                <p className="text-sm text-gray-500">Claim assigned to agent for review</p>
                <p className="text-xs text-gray-500">1 day ago by John Smith</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStatus('Approved')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStatus('Rejected')}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStatus('Pending')}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Pend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStatus('Settled')}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Settle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimStatus;
