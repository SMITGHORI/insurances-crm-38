
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Minus, TrendingUp, Zap } from 'lucide-react';

const ClaimPriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'Low':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Minus
        };
      case 'Medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: TrendingUp
        };
      case 'High':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: AlertTriangle
        };
      case 'Urgent':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: Zap
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Minus
        };
    }
  };

  const config = getPriorityConfig(priority);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} font-medium flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {priority}
    </Badge>
  );
};

export default ClaimPriorityBadge;
