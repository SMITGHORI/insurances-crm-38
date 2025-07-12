
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';

const AgentStatsCards = ({ stats, isLoading, totalAgents }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const activeAgents = stats?.activeAgents || 0;
  const inactiveAgents = stats?.inactiveAgents || 0;
  const onboardingAgents = stats?.onboardingAgents || 0;
  const avgPerformance = stats?.avgPerformance || 0;

  // Calculate percentages and trends
  const activePercentage = totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0;
  const onboardingPercentage = totalAgents > 0 ? Math.round((onboardingAgents / totalAgents) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Agents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Agents
          </CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{totalAgents}</div>
          <p className="text-xs text-gray-500 mt-1">
            All registered agents
          </p>
        </CardContent>
      </Card>

      {/* Active Agents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Active Agents
          </CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeAgents}</div>
          <p className="text-xs text-gray-500 mt-1">
            {activePercentage}% of total agents
          </p>
        </CardContent>
      </Card>

      {/* Onboarding Agents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Onboarding
          </CardTitle>
          <UserPlus className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{onboardingAgents}</div>
          <p className="text-xs text-gray-500 mt-1">
            {onboardingPercentage}% pending activation
          </p>
        </CardContent>
      </Card>

      {/* Average Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Avg Performance
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{avgPerformance}%</div>
          <p className="text-xs text-gray-500 mt-1">
            Target achievement rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentStatsCards;
