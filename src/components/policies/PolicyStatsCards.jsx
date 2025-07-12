
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePolicyStats, useExpiringPolicies } from '@/hooks/usePolicies';
import { FileText, TrendingUp, AlertTriangle, Users, DollarSign, Calendar } from 'lucide-react';

const PolicyStatsCards = () => {
  const { data: stats, isLoading: statsLoading } = usePolicyStats();
  const { data: expiringPolicies, isLoading: expiringLoading } = useExpiringPolicies(30);

  const loading = statsLoading || expiringLoading;

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-4 sm:mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="h-4 bg-gray-200 rounded"></CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pt-0">
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = stats || {};
  const expiringCount = expiringPolicies?.length || 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 mb-4 sm:mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <FileText className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Total Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-gray-900">
            {statsData.totalPolicies || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            All policies in system
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Active Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {statsData.activePolicies || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Currently active
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <AlertTriangle className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-orange-600">
            {expiringCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Next 30 days
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <Users className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Expired
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {statsData.expiredPolicies || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Need renewal
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <DollarSign className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Total Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            ₹{((statsData.totalPremium || 0) / 100000).toFixed(1)}L
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Annual value
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
            <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            Recent
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {statsData.recentPolicies || 0}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyStatsCards;
