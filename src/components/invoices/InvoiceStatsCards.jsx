
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useInvoiceStatsBackend } from '@/hooks/useInvoicesBackend';

const InvoiceStatsCards = ({ filterParams = {} }) => {
  const { data: statsResponse, isLoading } = useInvoiceStatsBackend(filterParams);
  const stats = statsResponse?.data || {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    draft: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0
  };

  const statsCards = [
    {
      title: 'Total Invoices',
      value: stats.total,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All invoices'
    },
    {
      title: 'Paid',
      value: stats.paid,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      description: formatCurrency(stats.paidAmount)
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Send,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: formatCurrency(stats.pendingAmount)
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      description: formatCurrency(stats.overdueAmount)
    },
    {
      title: 'Total Value',
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'All invoices value'
    },
    {
      title: 'Collection Rate',
      value: stats.totalAmount > 0 ? `${Math.round((stats.paidAmount / stats.totalAmount) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Payment success rate'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                {stat.title === 'Overdue' && stats.overdue > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InvoiceStatsCards;
