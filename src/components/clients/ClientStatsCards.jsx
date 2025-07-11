
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX, UserPlus, DollarSign, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import clientsBackendApi from '@/services/api/clientsApiBackend';

const ClientStatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['clientStats'],
    queryFn: () => clientsBackendApi.request('/stats/summary'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const statsData = stats?.data || {
    totalClients: 0,
    activeClients: 0,
    inactiveClients: 0,
    prospectiveClients: 0,
    totalPremium: 0,
    totalPolicies: 0
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: statsData.totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Clients',
      value: statsData.activeClients,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Inactive Clients',
      value: statsData.inactiveClients,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Prospective Clients',
      value: statsData.prospectiveClients,
      icon: UserPlus,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Premium',
      value: `₹${statsData.totalPremium.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Policies',
      value: statsData.totalPolicies,
      icon: Shield,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
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

export default ClientStatsCards;
