
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { useClaimsDashboardStats } from '../../hooks/useClaims';
import { formatCurrency } from '@/lib/utils';

const ClaimStatsCards = () => {
  const { data: stats, isLoading, error } = useClaimsDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats?.data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Unable to load claims statistics
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = stats.data;

  const statCards = [
    {
      title: "Total Claims",
      value: statsData.totalClaims?.toLocaleString() || "0",
      description: "All time claims",
      icon: FileText,
      trend: "neutral"
    },
    {
      title: "Active Claims",
      value: statsData.activeClaims?.toLocaleString() || "0",
      description: "Currently processing",
      icon: Clock,
      trend: statsData.activeClaims > 0 ? "warning" : "positive"
    },
    {
      title: "Pending Approval",
      value: statsData.pendingApproval?.toLocaleString() || "0",
      description: "Awaiting review",
      icon: Timer,
      trend: statsData.pendingApproval > 5 ? "negative" : "neutral"
    },
    {
      title: "Recent Claims",
      value: statsData.recentClaims?.toLocaleString() || "0",
      description: "Last 7 days",
      icon: TrendingUp,
      trend: "positive"
    },
    {
      title: "High Priority",
      value: statsData.highPriorityClaims?.toLocaleString() || "0",
      description: "Urgent & High",
      icon: AlertTriangle,
      trend: statsData.highPriorityClaims > 0 ? "negative" : "positive"
    },
    {
      title: "Overdue Estimates",
      value: statsData.overdueEstimates?.toLocaleString() || "0",
      description: "Past settlement date",
      icon: XCircle,
      trend: statsData.overdueEstimates > 0 ? "negative" : "positive"
    }
  ];

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendBadge = (trend, value) => {
    if (value === "0") return null;
    
    switch (trend) {
      case 'positive':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Good</Badge>;
      case 'negative':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Attention</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Monitor</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${getTrendColor(stat.trend)}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div>
                  {getTrendBadge(stat.trend, stat.value)}
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
