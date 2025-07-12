
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, FileText } from 'lucide-react';
import { useClientStats } from '@/hooks/useClients';

const ClientStatsCards = () => {
  const { data: stats, isLoading, error } = useClientStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Error loading client stats:', error);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Failed to load statistics: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = stats || {
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    prospectiveClients: 0,
    totalPremium: 0,
    totalPolicies: 0
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {/* Total Clients */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Clients
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(statsData.totalClients)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            All registered clients
          </p>
        </CardContent>
      </Card>

      {/* Active Clients */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Active Clients
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {formatNumber(statsData.activeClients)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {statsData.totalClients > 0 
              ? `${Math.round((statsData.activeClients / statsData.totalClients) * 100)}% of total`
              : '0% of total'
            }
          </p>
        </CardContent>
      </Card>

      {/* Prospective Clients */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Prospective
          </CardTitle>
          <UserPlus className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            {formatNumber(statsData.prospectiveClients)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Potential new clients
          </p>
        </CardContent>
      </Card>

      {/* Inactive Clients */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Inactive
          </CardTitle>
          <UserX className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">
            {formatNumber(statsData.inactiveClients)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Require attention
          </p>
        </CardContent>
      </Card>

      {/* Total Premium */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Premium
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(statsData.totalPremium)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Collected premiums
          </p>
        </CardContent>
      </Card>

      {/* Total Policies */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Policies
          </CardTitle>
          <FileText className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700">
            {formatNumber(statsData.totalPolicies)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Active policies
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientStatsCards;
