
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Building, 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const QuotationOverview = ({ quotation }) => {
  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading quotation details...</p>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      viewed: { color: 'bg-purple-100 text-purple-800', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-orange-100 text-orange-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isExpired = new Date(quotation.validUntil) < new Date();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{quotation.quoteId}</CardTitle>
              <p className="text-gray-600 mt-1">
                Created on {formatDate(quotation.createdAt)}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {getStatusBadge(quotation.status)}
              {isExpired && quotation.status !== 'accepted' && (
                <Badge className="bg-red-100 text-red-800">Expired</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{quotation.clientName}</p>
              <p className="text-sm text-gray-600">Client ID: {quotation.clientId}</p>
            </div>
            {quotation.clientId?.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{quotation.clientId.email}</p>
              </div>
            )}
            {quotation.clientId?.phone && (
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{quotation.clientId.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Insurance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-gray-600">{quotation.insuranceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Company</p>
              <p className="text-sm text-gray-600">{quotation.insuranceCompany}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Products</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {quotation.products?.map((product, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {typeof product === 'string' ? product : product.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Sum Insured</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(quotation.sumInsured)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Premium</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(quotation.premium)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agent Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              Agent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold">{quotation.agentName}</p>
              <p className="text-sm text-gray-600">Agent ID: {quotation.agentId}</p>
            </div>
            {quotation.agentId?.email && (
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{quotation.agentId.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Valid Until</p>
              <p className="text-sm text-gray-600">
                {formatDate(quotation.validUntil)}
              </p>
              {isExpired && (
                <p className="text-xs text-red-600 mt-1">Expired</p>
              )}
            </div>
            {quotation.sentDate && (
              <div>
                <p className="text-sm font-medium">Sent Date</p>
                <p className="text-sm text-gray-600">
                  {formatDate(quotation.sentDate)}
                </p>
              </div>
            )}
            {quotation.viewedAt && (
              <div>
                <p className="text-sm font-medium">Viewed At</p>
                <p className="text-sm text-gray-600">
                  {formatDate(quotation.viewedAt)}
                </p>
              </div>
            )}
            {quotation.acceptedAt && (
              <div>
                <p className="text-sm font-medium">Accepted At</p>
                <p className="text-sm text-gray-600">
                  {formatDate(quotation.acceptedAt)}
                </p>
              </div>
            )}
            {quotation.rejectedAt && (
              <div>
                <p className="text-sm font-medium">Rejected At</p>
                <p className="text-sm text-gray-600">
                  {formatDate(quotation.rejectedAt)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Current Status</p>
              <div className="mt-1">{getStatusBadge(quotation.status)}</div>
            </div>
            <div>
              <p className="text-sm font-medium">Email Status</p>
              <Badge variant={quotation.emailSent ? "default" : "outline"}>
                {quotation.emailSent ? "Sent" : "Not Sent"}
              </Badge>
            </div>
            {quotation.rejectionReason && (
              <div>
                <p className="text-sm font-medium">Rejection Reason</p>
                <p className="text-sm text-gray-600">{quotation.rejectionReason}</p>
              </div>
            )}
            {quotation.convertedToPolicy && (
              <div>
                <p className="text-sm font-medium">Converted to Policy</p>
                <p className="text-sm text-gray-600">{quotation.convertedToPolicy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {quotation.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{quotation.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachments Section */}
      {quotation.attachments && quotation.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quotation.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{attachment.fileName}</span>
                    <span className="text-xs text-gray-500">
                      ({(attachment.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationOverview;
