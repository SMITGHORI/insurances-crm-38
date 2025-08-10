
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Plus,
  Eye,
  ArrowRight,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdvancedCard } from '@/components/ui/advanced-card'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/usePermissions'

// Mock data for dashboard
const mockData = {
  clients: {
    total: 1247,
    newThisMonth: 89,
    active: 1189,
    inactive: 58,
    growth: 12.5
  },
  policies: {
    total: 2156,
    active: 1987,
    expired: 169,
    newThisMonth: 156,
    growth: 8.3
  },
  claims: {
    total: 342,
    pending: 89,
    approved: 198,
    rejected: 55,
    growth: -5.2
  },
  leads: {
    total: 567,
    new: 234,
    qualified: 189,
    converted: 144,
    growth: 23.7
  },
  revenue: {
    monthly: 1250000,
    previousMonth: 1180000,
    growth: 5.9,
    target: 1500000
  },
  recentActivity: [
    { id: 1, type: 'client', action: 'New client registered', time: '2 hours ago', user: 'Agent Johnson' },
    { id: 2, type: 'policy', action: 'Policy renewed', time: '4 hours ago', user: 'Agent Davis' },
    { id: 3, type: 'claim', action: 'Claim submitted', time: '6 hours ago', user: 'Agent Smith' },
    { id: 4, type: 'lead', action: 'Lead qualified', time: '8 hours ago', user: 'Agent Wilson' },
    { id: 5, type: 'policy', action: 'New policy issued', time: '1 day ago', user: 'Agent Brown' }
  ],
  topProducts: [
    { name: 'Vehicle Insurance', policies: 456, revenue: 234000 },
    { name: 'Health Insurance', policies: 389, revenue: 567000 },
    { name: 'Property Insurance', policies: 234, revenue: 189000 },
    { name: 'Life Insurance', policies: 123, revenue: 456000 },
    { name: 'Business Insurance', policies: 89, revenue: 234000 }
  ]
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => [
    {
      title: 'Total Clients',
      value: mockData.clients.total.toLocaleString(),
      trend: mockData.clients.growth > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(mockData.clients.growth)}%`,
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Policies',
      value: mockData.policies.active.toLocaleString(),
      trend: mockData.policies.growth > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(mockData.policies.growth)}%`,
      icon: <FileText className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Claims',
      value: mockData.claims.pending,
      trend: 'neutral',
      trendValue: '0%',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'New Leads',
      value: mockData.leads.new,
      trend: mockData.leads.growth > 0 ? 'up' : 'down',
      trendValue: `${Math.abs(mockData.leads.growth)}%`,
      icon: <Target className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ], [])

  // Quick action cards
  const quickActions = useMemo(() => [
    {
      title: 'New Client',
      description: 'Register a new client',
      icon: <Users className="h-8 w-8" />,
      action: () => navigate('/clients'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      canAccess: hasPermission('clients', 'create')
    },
    {
      title: 'New Policy',
      description: 'Create a new policy',
      icon: <FileText className="h-8 w-8" />,
      action: () => navigate('/policies'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      canAccess: hasPermission('policies', 'create')
    },
    {
      title: 'New Claim',
      description: 'Submit a new claim',
      icon: <AlertTriangle className="h-8 w-8" />,
      action: () => navigate('/claims'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      canAccess: hasPermission('claims', 'create')
    },
    {
      title: 'New Lead',
      description: 'Add a new lead',
      icon: <Target className="h-8 w-8" />,
      action: () => navigate('/leads'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      canAccess: hasPermission('leads', 'create')
    }
  ], [navigate, hasPermission])

  // Revenue overview
  const revenueMetrics = useMemo(() => [
    {
      label: 'Monthly Revenue',
      value: `$${(mockData.revenue.monthly / 1000000).toFixed(1)}M`,
      trend: 'up',
      trendValue: `+${mockData.revenue.growth}%`
    },
    {
      label: 'Target',
      value: `$${(mockData.revenue.target / 1000000).toFixed(1)}M`,
      trend: 'neutral',
      trendValue: '0%'
    },
    {
      label: 'Growth',
      value: `${mockData.revenue.growth}%`,
      trend: mockData.revenue.growth > 0 ? 'up' : 'down',
      trendValue: 'vs last month'
    }
  ], [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {metric.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-600" />}
                {metric.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-600" />}
                {metric.trend === 'neutral' && <Activity className="h-3 w-3 mr-1 text-gray-600" />}
                {metric.trendValue}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Overview
          </CardTitle>
          <CardDescription>
            Monthly revenue performance and targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revenueMetrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <div className="flex items-center justify-center gap-1 text-xs mt-1">
                  {metric.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
                  {metric.trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
                  {metric.trend === 'neutral' && <Activity className="h-3 w-3 text-gray-600" />}
                  <span className={metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                    {metric.trendValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.filter(action => action.canAccess).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <div className={action.color}>
                      {action.icon}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Products
            </CardTitle>
            <CardDescription>
              Best performing insurance products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.policies} policies
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${(product.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Performance Trends
            </CardTitle>
            <CardDescription>
              Monthly performance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance charts coming soon</p>
                <p className="text-sm">Interactive charts and analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Quick Module Access
          </CardTitle>
          <CardDescription>
            Navigate to different modules quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={() => navigate('/clients')}
            >
              <Users className="h-8 w-8 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Clients</div>
                <div className="text-sm text-muted-foreground">
                  {mockData.clients.total.toLocaleString()} total
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={() => navigate('/policies')}
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-medium">Policies</div>
                <div className="text-sm text-muted-foreground">
                  {mockData.policies.active.toLocaleString()} active
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={() => navigate('/claims')}
            >
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="text-center">
                <div className="font-medium">Claims</div>
                <div className="text-sm text-muted-foreground">
                  {mockData.claims.pending} pending
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={() => navigate('/leads')}
            >
              <Target className="h-8 w-8 text-purple-600" />
              <div className="text-center">
                <div className="font-medium">Leads</div>
                <div className="text-sm text-muted-foreground">
                  {mockData.leads.new} new
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
