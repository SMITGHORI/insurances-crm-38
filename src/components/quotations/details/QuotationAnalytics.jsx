
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Clock, 
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

const QuotationAnalytics = ({ quotationId }) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data - would come from API
  const analyticsData = {
    performance: {
      views: 145,
      viewsChange: 12.5,
      conversionRate: 15.2,
      conversionChange: -2.1,
      avgResponseTime: '2.4 hours',
      responseTimeChange: -15.3
    },
    engagement: {
      emailOpens: 89,
      linkClicks: 34,
      documentsDownloaded: 12,
      timeSpent: '8m 32s'
    },
    comparison: {
      industryAvg: {
        conversionRate: 18.5,
        responseTime: '3.2 hours',
        viewRate: 65.2
      },
      yourAvg: {
        conversionRate: 15.2,
        responseTime: '2.4 hours',
        viewRate: 72.1
      }
    },
    trends: [
      { period: 'Jan', quotations: 45, conversions: 8 },
      { period: 'Feb', quotations: 52, conversions: 12 },
      { period: 'Mar', quotations: 38, conversions: 6 },
      { period: 'Apr', quotations: 61, conversions: 15 },
      { period: 'May', quotations: 48, conversions: 9 },
      { period: 'Jun', quotations: 55, conversions: 11 }
    ]
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Analytics Dashboard</CardTitle>
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={timeRange === range ? 'default' : 'outline'}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={analyticsData.performance.views}
          change={analyticsData.performance.viewsChange}
          trend="up"
          icon={Eye}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${analyticsData.performance.conversionRate}%`}
          change={analyticsData.performance.conversionChange}
          trend="down"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg Response Time"
          value={analyticsData.performance.avgResponseTime}
          change={analyticsData.performance.responseTimeChange}
          trend="up"
          icon={Clock}
        />
        <MetricCard
          title="Email Opens"
          value={analyticsData.engagement.emailOpens}
          icon={Users}
        />
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.engagement.emailOpens}
              </div>
              <p className="text-sm text-gray-600">Email Opens</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.engagement.linkClicks}
              </div>
              <p className="text-sm text-gray-600">Link Clicks</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.engagement.documentsDownloaded}
              </div>
              <p className="text-sm text-gray-600">Downloads</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.engagement.timeSpent}
              </div>
              <p className="text-sm text-gray-600">Avg Time Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Industry Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Conversion Rate</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">You: {analyticsData.comparison.yourAvg.conversionRate}%</Badge>
                    <Badge>Industry: {analyticsData.comparison.industryAvg.conversionRate}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(analyticsData.comparison.yourAvg.conversionRate / analyticsData.comparison.industryAvg.conversionRate) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Response Time</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">You: {analyticsData.comparison.yourAvg.responseTime}</Badge>
                    <Badge>Industry: {analyticsData.comparison.industryAvg.responseTime}</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">View Rate</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">You: {analyticsData.comparison.yourAvg.viewRate}%</Badge>
                    <Badge>Industry: {analyticsData.comparison.industryAvg.viewRate}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '110%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{trend.period}</div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{trend.quotations}</span> quotations
                      </div>
                      <div className="text-xs text-gray-500">
                        {trend.conversions} conversions ({((trend.conversions / trend.quotations) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(trend.conversions / trend.quotations) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm font-medium text-blue-800">Improve Response Time</p>
              <p className="text-sm text-blue-700">Your response time is better than industry average. Consider automating follow-ups to maintain this advantage.</p>
            </div>
            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm font-medium text-yellow-800">Increase Conversion Rate</p>
              <p className="text-sm text-yellow-700">Your conversion rate is below industry average. Consider personalizing quotations and adding value propositions.</p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-sm font-medium text-green-800">Excellent View Rate</p>
              <p className="text-sm text-green-700">Your quotations are being viewed more than industry average. Keep up the good work with email subject lines!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationAnalytics;
