
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  FileText,
  CreditCard
} from 'lucide-react';
import { getClientName } from '@/schemas/clientSchemas';

const ClientOverview = ({ client }) => {
  if (!client) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'individual': return <User className="h-5 w-5" />;
      case 'corporate': return <Building className="h-5 w-5" />;
      case 'group': return <Users className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const clientName = getClientName(client);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getClientTypeIcon(client.clientType)}
              <div>
                <CardTitle className="text-2xl">{clientName}</CardTitle>
                <p className="text-sm text-gray-600 capitalize">
                  {client.clientType || 'Individual'} Client • ID: {client.clientId}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(client.status)}>
              {client.status || 'Active'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.altPhone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{client.altPhone} (Alt)</span>
              </div>
            )}
            {(client.address || client.city || client.state) && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div className="text-sm">
                  {client.address && <div>{client.address}</div>}
                  {(client.city || client.state) && (
                    <div>{client.city}{client.city && client.state && ', '}{client.state}</div>
                  )}
                  {client.pincode && <div>{client.pincode}</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Client Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.clientType === 'individual' && (
              <>
                {client.dob && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date of Birth</span>
                    <span className="text-sm">{new Date(client.dob).toLocaleDateString()}</span>
                  </div>
                )}
                {client.gender && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Gender</span>
                    <span className="text-sm capitalize">{client.gender}</span>
                  </div>
                )}
                {client.occupation && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Occupation</span>
                    <span className="text-sm">{client.occupation}</span>
                  </div>
                )}
                {client.annualIncome && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Annual Income</span>
                    <span className="text-sm">₹{client.annualIncome.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}

            {client.clientType === 'corporate' && (
              <>
                {client.registrationNo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Registration No</span>
                    <span className="text-sm">{client.registrationNo}</span>
                  </div>
                )}
                {client.industry && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Industry</span>
                    <span className="text-sm">{client.industry}</span>
                  </div>
                )}
                {client.employeeCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Employees</span>
                    <span className="text-sm">{client.employeeCount}</span>
                  </div>
                )}
              </>
            )}

            {client.clientType === 'group' && (
              <>
                {client.groupType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Group Type</span>
                    <span className="text-sm capitalize">{client.groupType}</span>
                  </div>
                )}
                {client.memberCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Members</span>
                    <span className="text-sm">{client.memberCount}</span>
                  </div>
                )}
              </>
            )}

            {client.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Client Since</span>
                <span className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Policy Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Policies</span>
              <span className="text-sm font-bold">{client.totalPolicies || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Premium</span>
              <span className="text-sm font-bold">₹{(client.totalPremium || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Policies</span>
              <span className="text-sm">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {client.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientOverview;
