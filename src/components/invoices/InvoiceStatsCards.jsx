
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { useInvoiceStats } from '@/hooks/useInvoices';
import { 
  DollarSign, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react';

const InvoiceStatsCards = ({ filterParams = {} }) => {
  const { data: stats, isLoading, error } = useInvoiceStats(filterParams);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats?.data) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Failed to load invoice statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsData = stats.data;
  
  // Calculate percentages and trends
  const totalInvoices = statsData.total || 0;
  const paidPercentage = totalInvoices > 0 ? (statsData.paid / totalInvoices) * 100 : 0;
  const overduePercentage = totalInvoices > 0 ? (statsData.overdue / totalInvoices) * 100 : 0;
  const collectionRate = statsData.totalAmount > 0 ? (statsData.paidAmount / statsData.totalAmount) * 100 : 0;
  const outstandingAmount = (statsData.pendingAmount || 0) + (statsData.overdueAmount || 0);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(statsData.totalAmount || 0),
      subtitle: `${totalInvoices} invoices`,
      icon: DollarSign,
      trend: {
        value: collectionRate,
        label: `${collectionRate.toFixed(1)}% collected`,
        isPositive: collectionRate >= 75
      },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Paid Invoices',
      value: statsData.paid || 0,
      subtitle: formatCurrency(statsData.paidAmount || 0),
      icon: CheckCircle,
      trend: {
        value: paidPercentage,
        label: `${paidPercentage.toFixed(1)}% of total`,
        isPositive: paidPercentage >= 60
      },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Payment',
      value: statsData.pending || 0,
      subtitle: formatCurrency(statsData.pendingAmount || 0),
      icon: Clock,
      trend: {
        value: statsData.pending || 0,
        label: 'awaiting payment',
        isNeutral: true
      },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Overdue',
      value: statsData.overdue || 0,
      subtitle: formatCurrency(statsData.overdueAmount || 0),
      icon: AlertTriangle,
      trend: {
        value: overduePercentage,
        label: `${overduePercentage.toFixed(1)}% overdue`,
        isPositive: overduePercentage < 10
      },
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend.isNeutral ? Calendar : 
                           stat.trend.isPositive ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {typeof stat.value === 'number' && stat.value > 999999 
                      ? `${(stat.value / 1000000).toFixed(1)}M`
                      : stat.value
                    }
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </p>
                    <div className={`flex items-center text-xs ${
                      stat.trend.isNeutral ? 'text-muted-foreground' :
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {stat.trend.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Collection Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Collection Overview</span>
            <Badge variant="outline">
              {formatCurrency(outstandingAmount)} outstanding
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Collection Rate</span>
              <span className="font-medium">{collectionRate.toFixed(1)}%</span>
            </div>
            <Progress value={collectionRate} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(statsData.paidAmount || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Collected</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(statsData.pendingAmount || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  {formatCurrency(statsData.overdueAmount || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Invoice Value</span>
                <span className="font-medium">
                  {formatCurrency(totalInvoices > 0 ? (statsData.totalAmount || 0) / totalInvoices : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Draft Invoices</span>
                <Badge variant="outline">
                  {statsData.draft || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Collection Health</span>
                <Badge variant={collectionRate >= 80 ? "default" : collectionRate >= 60 ? "secondary" : "destructive"}>
                  {collectionRate >= 80 ? "Excellent" : collectionRate >= 60 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsData.overdue > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    {statsData.overdue} overdue invoice{statsData.overdue !== 1 ? 's' : ''} need attention
                  </span>
                </div>
              )}
              {statsData.draft > 0 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {statsData.draft} draft invoice{statsData.draft !== 1 ? 's' : ''} ready to send
                  </span>
                </div>
              )}
              {statsData.pending > 0 && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    {statsData.pending} invoice{statsData.pending !== 1 ? 's' : ''} awaiting payment
                  </span>
                </div>
              )}
              {statsData.overdue === 0 && statsData.draft === 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">All invoices are up to date!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceStatsCards;
