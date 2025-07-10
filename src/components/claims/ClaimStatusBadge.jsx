
import React from 'react';
import { Badge } from '@/components/ui/badge';

const ClaimStatusBadge = ({ status }) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Reported':
        return 'secondary';
      case 'Under Review':
        return 'default';
      case 'Pending':
        return 'outline';
      case 'Approved':
        return 'default';
      case 'Rejected':
        return 'destructive';
      case 'Settled':
        return 'default';
      case 'Closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reported':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Settled':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={`${getStatusColor(status)} font-medium`}
    >
      {status}
    </Badge>
  );
};

export default ClaimStatusBadge;
