
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useClaimsBackend';

const ClaimStatsCards = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const defaultStats = {
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalClaimAmount: 0,
    averageProcessingTime: 0,
    rejectionRate: 0
  };

  const currentStats = stats || defaultStats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Claims',
      value: currentStats.totalClaims?.toLocaleString() || '0',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All time claims'
    },
    {
      title: 'Pending Review',
      value: currentStats.pendingClaims?.toLocaleString() || '0',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Awaiting review'
    },
    {
      title: 'Approved Claims',
      value: currentStats.approvedClaims?.toLocaleString() || '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Successfully approved'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(currentStats.totalClaimAmount || 0),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Total claim value'
    },
    {
      title: 'Avg Processing',
      value: `${currentStats.averageProcessingTime || 0} days`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Average time to process'
    },
    {
      title: 'Rejection Rate',
      value: `${(currentStats.rejectionRate || 0).toFixed(1)}%`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Claims rejected'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ClaimStatsCards;
