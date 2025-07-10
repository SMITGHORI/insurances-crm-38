
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  User, 
  Building2, 
  Calendar, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail,
  Edit,
  CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/contexts/PermissionsContext';

const PolicyOverview = ({ policy }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('policies', 'edit');

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

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Expired': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-orange-100 text-orange-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Proposal': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!policy) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No policy data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{policy.policyNumber}</h2>
          <p className="text-gray-600">{policy.planName}</p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(policy.status)}>
            {policy.status}
          </Badge>
          {canEdit && (
            <Button 
              size="sm" 
              onClick={() => navigate(`/policies/${policy._id || policy.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Policy
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="font-medium">{policy.clientId?.displayName || policy.client?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Client ID</label>
              <p>{policy.clientId?.clientId || policy.client?.clientId || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <p>{policy.clientId?.email || policy.client?.email || 'N/A'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Client Type</label>
              <p className="capitalize">{policy.clientId?.clientType || policy.client?.type || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Policy Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Policy Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="capitalize">{policy.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="capitalize">{policy.category || 'Individual'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Insurance Company</label>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                <p>{policy.insuranceCompany}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Plan Name</label>
              <p>{policy.planName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Premium Amount</label>
              <p className="font-semibold text-lg text-green-600">
                {formatCurrency(policy.premium)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sum Assured</label>
              <p className="font-semibold text-lg">
                {formatCurrency(policy.sumAssured || policy.coverageAmount)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Frequency</label>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-gray-400" />
                <p className="capitalize">{policy.paymentFrequency}</p>
              </div>
            </div>
            {policy.commission && (
              <div>
                <label className="text-sm font-medium text-gray-500">Commission</label>
                <p>{policy.commission.rate}% - {formatCurrency(policy.commission.amount)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coverage Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Coverage Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p>{formatDate(policy.startDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <p>{formatDate(policy.endDate)}</p>
            </div>
            {policy.maturityDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Maturity Date</label>
                <p>{formatDate(policy.maturityDate)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Grace Period</label>
              <p>{policy.gracePeriod || 30} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      {(policy.beneficiaries?.length > 0 || policy.nominees?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Beneficiaries & Nominees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {policy.beneficiaries?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Beneficiaries</h4>
                <div className="space-y-2">
                  {policy.beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600">{beneficiary.relationship}</p>
                      </div>
                      <Badge variant="outline">{beneficiary.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {policy.nominees?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Nominees</h4>
                <div className="space-y-2">
                  {policy.nominees.map((nominee, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{nominee.name}</p>
                        <p className="text-sm text-gray-600">{nominee.relationship}</p>
                      </div>
                      <Badge variant="outline">{nominee.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyOverview;
