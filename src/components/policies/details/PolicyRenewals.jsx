
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Plus, 
  Calendar, 
  DollarSign,
  User,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRenewPolicy } from '@/hooks/usePolicyFeatures';

const PolicyRenewals = ({ policyId }) => {
  const [showRenewalForm, setShowRenewalForm] = useState(false);
  const [renewalData, setRenewalData] = useState({
    newEndDate: '',
    newPremium: '',
    commissionRate: '',
    commissionAmount: '',
    notes: ''
  });

  const renewPolicy = useRenewPolicy();

  // Mock renewal history - in real app, this would come from the policy data
  const renewalHistory = [
    {
      id: 1,
      renewalDate: '2024-01-01',
      previousEndDate: '2023-12-31',
      newEndDate: '2024-12-31',
      premium: 25000,
      commission: { rate: 10, amount: 2500 },
      renewedBy: { name: 'Agent Smith' },
      renewedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      renewalDate: '2023-01-01',
      previousEndDate: '2022-12-31',
      newEndDate: '2023-12-31',
      premium: 22000,
      commission: { rate: 10, amount: 2200 },
      renewedBy: { name: 'Agent John' },
      renewedAt: '2023-01-01T10:00:00Z'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRenewal = async () => {
    if (!renewalData.newEndDate || !renewalData.newPremium) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await renewPolicy.mutateAsync({
        policyId,
        renewalData: {
          newEndDate: renewalData.newEndDate,
          newPremium: parseFloat(renewalData.newPremium),
          commission: {
            rate: parseFloat(renewalData.commissionRate) || 0,
            amount: parseFloat(renewalData.commissionAmount) || 0
          },
          notes: renewalData.notes
        }
      });

      setRenewalData({
        newEndDate: '',
        newPremium: '',
        commissionRate: '',
        commissionAmount: '',
        notes: ''
      });
      setShowRenewalForm(false);
    } catch (error) {
      console.error('Renewal error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Policy Renewals</h3>
          <p className="text-sm text-gray-600">Track policy renewal history and manage renewals</p>
        </div>
        <Button onClick={() => setShowRenewalForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Renew Policy
        </Button>
      </div>

      {/* Renewal Form */}
      {showRenewalForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2" />
              Renew Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">New End Date *</label>
                <Input
                  type="date"
                  value={renewalData.newEndDate}
                  onChange={(e) => setRenewalData({...renewalData, newEndDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Premium Amount *</label>
                <Input
                  type="number"
                  value={renewalData.newPremium}
                  onChange={(e) => setRenewalData({...renewalData, newPremium: e.target.value})}
                  placeholder="Enter new premium amount"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Commission Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={renewalData.commissionRate}
                  onChange={(e) => setRenewalData({...renewalData, commissionRate: e.target.value})}
                  placeholder="Enter commission rate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Commission Amount</label>
                <Input
                  type="number"
                  value={renewalData.commissionAmount}
                  onChange={(e) => setRenewalData({...renewalData, commissionAmount: e.target.value})}
                  placeholder="Enter commission amount"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Renewal Notes</label>
              <textarea
                value={renewalData.notes}
                onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
                placeholder="Add any notes about this renewal..."
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleRenewal}
                disabled={renewPolicy.isLoading}
              >
                {renewPolicy.isLoading ? 'Processing...' : 'Renew Policy'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRenewalForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renewal History */}
      <div className="space-y-4">
        {renewalHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No renewals yet</h3>
              <p className="text-gray-500 mb-4">Renewal history will appear here when the policy is renewed</p>
              <Button onClick={() => setShowRenewalForm(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start First Renewal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Renewal History</h4>
            {renewalHistory.map((renewal) => (
              <Card key={renewal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-medium">Policy Renewed</h5>
                        <p className="text-sm text-gray-600">
                          Renewed on {formatDate(renewal.renewalDate)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Previous Period</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatDate(renewal.previousEndDate)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-600">New End Date</span>
                      </div>
                      <p className="text-sm font-medium">
                        {formatDate(renewal.newEndDate)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">Premium</span>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(renewal.premium)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>Renewed by {renewal.renewedBy.name}</span>
                    </div>
                    {renewal.commission && (
                      <span>
                        Commission: {renewal.commission.rate}% - {formatCurrency(renewal.commission.amount)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Renewal Statistics */}
      {renewalHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Renewal Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{renewalHistory.length}</p>
                <p className="text-sm text-gray-600">Total Renewals</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₹{renewalHistory.reduce((sum, r) => sum + r.premium, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Premium Collected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{renewalHistory.reduce((sum, r) => sum + (r.commission?.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Commission</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyRenewals;
