
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Send,
  Eye,
  XCircle
} from 'lucide-react';
import { useQuotationsStats } from '@/hooks/useQuotations';
import { Skeleton } from '@/components/ui/skeleton';

const QuotationStatsCards = ({ className = '' }) => {
  const { data: stats, isLoading, error } = useQuotationsStats();

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const statusBreakdown = stats.statusBreakdown || {};
  const premiumStats = stats.premiumStats || {};

  const statsCards = [
    {
      title: 'Total Quotations',
      value: stats.totalQuotations || 0,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `Last ${stats.period || 30} days`
    },
    {
      title: 'Total Premium',
      value: formatCurrency(premiumStats.totalPremium),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `Avg: ${formatCurrency(premiumStats.averagePremium)}`
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate || 0}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${statusBreakdown.accepted || 0} accepted`
    },
    {
      title: 'Pending Action',
      value: (statusBreakdown.sent || 0) + (statusBreakdown.viewed || 0),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `${statusBreakdown.sent || 0} sent, ${statusBreakdown.viewed || 0} viewed`
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { 
                key: 'draft', 
                label: 'Draft', 
                icon: FileText, 
                color: 'bg-gray-100 text-gray-800' 
              },
              { 
                key: 'sent', 
                label: 'Sent', 
                icon: Send, 
                color: 'bg-blue-100 text-blue-800' 
              },
              { 
                key: 'viewed', 
                label: 'Viewed', 
                icon: Eye, 
                color: 'bg-purple-100 text-purple-800' 
              },
              { 
                key: 'accepted', 
                label: 'Accepted', 
                icon: CheckCircle, 
                color: 'bg-green-100 text-green-800' 
              },
              { 
                key: 'rejected', 
                label: 'Rejected', 
                icon: XCircle, 
                color: 'bg-red-100 text-red-800' 
              },
              { 
                key: 'expired', 
                label: 'Expired', 
                icon: Clock, 
                color: 'bg-orange-100 text-orange-800' 
              }
            ].map((status) => {
              const IconComponent = status.icon;
              const count = statusBreakdown[status.key] || 0;
              
              return (
                <div key={status.key} className="text-center">
                  <Badge className={`${status.color} flex items-center gap-1 justify-center mb-2`}>
                    <IconComponent size={12} />
                    {status.label}
                  </Badge>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationStatsCards;
