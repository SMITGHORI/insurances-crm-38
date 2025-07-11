
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Plus, 
  Eye, 
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientPolicies = ({ clientId }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('all');

  // Mock data - replace with actual API call
  const mockPolicies = [
    {
      id: 'POL001',
      type: 'Health',
      policyNumber: 'HLT2024001',
      premium: 25000,
      coverageAmount: 500000,
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      nextDueDate: '2024-07-15'
    },
    {
      id: 'POL002',
      type: 'Motor',
      policyNumber: 'MTR2024002',
      premium: 15000,
      coverageAmount: 300000,
      status: 'Active',
      startDate: '2024-03-10',
      endDate: '2025-03-09',
      nextDueDate: '2024-09-10'
    },
    {
      id: 'POL003',
      type: 'Life',
      policyNumber: 'LIF2024003',
      premium: 50000,
      coverageAmount: 1000000,
      status: 'Pending',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      nextDueDate: '2024-12-01'
    }
  ];

  const policyTypes = ['all', 'Health', 'Motor', 'Life', 'Property'];

  const filteredPolicies = selectedType === 'all' 
    ? mockPolicies 
    : mockPolicies.filter(policy => policy.type === selectedType);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTotalPremium = () => {
    return filteredPolicies.reduce((sum, policy) => sum + policy.premium, 0);
  };

  const getActivePoliciesCount = () => {
    return filteredPolicies.filter(policy => policy.status === 'Active').length;
  };

  return (
    <div className="space-y-6">
      {/* Policy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-2xl font-bold">{filteredPolicies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-2xl font-bold text-green-600">{getActivePoliciesCount()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Premium</p>
                <p className="text-2xl font-bold">₹{getTotalPremium().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Policies</CardTitle>
            <Button onClick={() => navigate('/policies/create')} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Policy</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-6">
            {policyTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Policies List */}
          {filteredPolicies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No policies found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolicies.map(policy => (
                <div key={policy.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="font-semibold">{policy.policyNumber}</h4>
                        <Badge variant="outline">{policy.type}</Badge>
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Premium:</span> ₹{policy.premium.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Coverage:</span> ₹{policy.coverageAmount.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Valid Until:</span> {new Date(policy.endDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Next Due:</span> {new Date(policy.nextDueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/policies/${policy.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPolicies;
