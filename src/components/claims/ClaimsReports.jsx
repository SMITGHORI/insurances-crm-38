
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useClaimsStats, useClaimsAgingReport, useSettlementReport } from '../../hooks/useClaimsBackend';

const ClaimsReports = () => {
  const [reportPeriod, setReportPeriod] = useState('month');
  const { data: stats, isLoading: statsLoading } = useClaimsStats({ period: reportPeriod });
  const { data: agingReport, isLoading: agingLoading } = useClaimsAgingReport();
  const { data: settlementReport, isLoading: settlementLoading } = useSettlementReport();

  // Sample data for charts (replace with real data from API)
  const claimsByStatus = [
    { name: 'Reported', value: 45, color: '#3B82F6' },
    { name: 'Under Review', value: 32, color: '#F59E0B' },
    { name: 'Approved', value: 23, color: '#10B981' },
    { name: 'Rejected', value: 12, color: '#EF4444' },
    { name: 'Settled', value: 18, color: '#8B5CF6' }
  ];

  const claimsByType = [
    { type: 'Auto', claims: 65, amount: 450000 },
    { type: 'Home', claims: 42, amount: 320000 },
    { type: 'Health', claims: 38, amount: 280000 },
    { type: 'Life', claims: 15, amount: 750000 },
    { type: 'Travel', claims: 23, amount: 45000 }
  ];

  const monthlyTrends = [
    { month: 'Jan', reported: 45, settled: 38, amount: 380000 },
    { month: 'Feb', reported: 52, settled: 42, amount: 420000 },
    { month: 'Mar', reported: 48, settled: 45, amount: 456000 },
    { month: 'Apr', reported: 61, settled: 48, amount: 502000 },
    { month: 'May', reported: 55, settled: 52, amount: 478000 },
    { month: 'Jun', reported: 67, settled: 55, amount: 523000 }
  ];

  const agingData = [
    { range: '0-30 days', count: 45, percentage: 35 },
    { range: '31-60 days', count: 32, percentage: 25 },
    { range: '61-90 days', count: 25, percentage: 20 },
    { range: '91-180 days', count: 18, percentage: 14 },
    { range: '180+ days', count: 8, percentage: 6 }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleExportReport = (reportType) => {
    // Implement export functionality
    console.log(`Exporting ${reportType} report`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Claims Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive analysis of claims data and trends</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="aging">Aging</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Claims by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Claims by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={claimsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {claimsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Claims by Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Claims by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={claimsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Claims']} />
                    <Bar dataKey="claims" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Claims</p>
                    <p className="text-2xl font-bold">183</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold">$2.1M</p>
                    <p className="text-xs text-green-600">+8% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Processing</p>
                    <p className="text-2xl font-bold">12 days</p>
                    <p className="text-xs text-red-600">+2 days from last month</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-green-600">+3% from last month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Claims Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="reported" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Reported"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="settled" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Settled"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aging Tab */}
        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Claims Aging Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agingData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{item.range}</div>
                      <div className="text-sm text-gray-600">{item.count} claims</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Processing Time</span>
                    <span className="font-medium">12 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Fastest Resolution</span>
                    <span className="font-medium text-green-600">2 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Slowest Resolution</span>
                    <span className="font-medium text-red-600">45 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>On-time Completion Rate</span>
                    <span className="font-medium">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settlement Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Settlements</span>
                    <span className="font-medium">$1.8M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Settlement</span>
                    <span className="font-medium">$12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Settlement Rate</span>
                    <span className="font-medium text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dispute Rate</span>
                    <span className="font-medium text-orange-600">8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimsReports;
