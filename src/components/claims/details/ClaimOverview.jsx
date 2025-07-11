
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  FileText,
  Building,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import ClaimStatusBadge from '../ClaimStatusBadge';
import ClaimPriorityBadge from '../ClaimPriorityBadge';

const ClaimOverview = ({ claim }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Claim Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Claim Number</span>
              <span className="font-medium">{claim.claimNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status</span>
              <ClaimStatusBadge status={claim.status} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Priority</span>
              <ClaimPriorityBadge priority={claim.priority} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Type</span>
              <Badge variant="outline">{claim.claimType}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Incident Date</span>
              <span className="font-medium">{formatDate(claim.incidentDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Reported Date</span>
              <span className="font-medium">{formatDate(claim.reportedDate)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Claim Amount</span>
              <span className="font-medium text-lg">{formatCurrency(claim.claimAmount)}</span>
            </div>
            {claim.approvedAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Approved Amount</span>
                <span className="font-medium text-green-600">{formatCurrency(claim.approvedAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Deductible</span>
              <span className="font-medium">{formatCurrency(claim.deductible)}</span>
            </div>
            {claim.financial && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Paid</span>
                  <span className="font-medium">{formatCurrency(claim.financial.totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Outstanding</span>
                  <span className="font-medium text-orange-600">{formatCurrency(claim.financial.outstanding)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client and Policy Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.clientId ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="font-medium">
                    {claim.clientId.firstName} {claim.clientId.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="font-medium">{claim.clientId.email}</span>
                </div>
                {claim.clientId.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">{claim.clientId.phoneNumber}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No client information available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Policy Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.policyId ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Policy Number</span>
                  <span className="font-medium">{claim.policyId.policyNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Policy Type</span>
                  <Badge variant="outline">{claim.policyId.policyType}</Badge>
                </div>
                {claim.policyId.coverageAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Coverage</span>
                    <span className="font-medium">{formatCurrency(claim.policyId.coverageAmount)}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No policy information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{claim.description}</p>
        </CardContent>
      </Card>

      {/* Location and Contact Details */}
      {(claim.incidentLocation || claim.contactDetails) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {claim.incidentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Incident Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {claim.incidentLocation.address && (
                  <p className="text-sm">{claim.incidentLocation.address}</p>
                )}
                <p className="text-sm">
                  {claim.incidentLocation.city && `${claim.incidentLocation.city}, `}
                  {claim.incidentLocation.state && `${claim.incidentLocation.state} `}
                  {claim.incidentLocation.zipCode}
                </p>
              </CardContent>
            </Card>
          )}

          {claim.contactDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {claim.contactDetails.primaryContact && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Primary Contact</span>
                    <span className="font-medium">{claim.contactDetails.primaryContact}</span>
                  </div>
                )}
                {claim.contactDetails.phoneNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">{claim.contactDetails.phoneNumber}</span>
                  </div>
                )}
                {claim.contactDetails.email && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="font-medium">{claim.contactDetails.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Assigned Agent */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Assignment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Assigned To</span>
            <span className="font-medium">
              {claim.assignedTo ? 
                `${claim.assignedTo.firstName} ${claim.assignedTo.lastName}` : 
                'Unassigned'
              }
            </span>
          </div>
          {claim.estimatedSettlement && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estimated Settlement</span>
              <span className="font-medium">{formatDate(claim.estimatedSettlement)}</span>
            </div>
          )}
          {claim.actualSettlement && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Actual Settlement</span>
              <span className="font-medium">{formatDate(claim.actualSettlement)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClaimOverview;
