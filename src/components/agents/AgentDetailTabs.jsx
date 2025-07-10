
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Award,
  Target,
  BarChart3,
  Clock
} from 'lucide-react';

const AgentDetailTabs = ({ agent }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockClients = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', policies: 2, premium: 5000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', policies: 1, premium: 2500 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive', policies: 3, premium: 7500 }
  ];

  const mockPolicies = [
    { id: 1, number: 'POL-2024-001', type: 'Health', client: 'John Doe', premium: 2500, status: 'Active' },
    { id: 2, number: 'POL-2024-002', type: 'Life', client: 'Jane Smith', premium: 2500, status: 'Active' },
    { id: 3, number: 'POL-2024-003', type: 'Auto', client: 'Bob Johnson', premium: 1500, status: 'Expired' }
  ];

  const mockCommissions = [
    { id: 1, policy: 'POL-2024-001', amount: 250, rate: 10, status: 'Paid', date: '2024-01-15' },
    { id: 2, policy: 'POL-2024-002', amount: 250, rate: 10, status: 'Pending', date: '2024-01-20' },
    { id: 3, policy: 'POL-2024-003', amount: 150, rate: 10, status: 'Paid', date: '2024-01-10' }
  ];

  const mockPerformance = {
    monthly: [
      { month: 'Jan', clients: 5, policies: 8, premium: 12000, commission: 1200 },
      { month: 'Feb', clients: 3, policies: 5, premium: 8000, commission: 800 },
      { month: 'Mar', clients: 7, policies: 10, premium: 15000, commission: 1500 }
    ],
    targets: {
      monthly: { policies: 8, premium: 15000 },
      quarterly: { policies: 24, premium: 45000 },
      annual: { policies: 96, premium: 180000 }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-red-100 text-red-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Paid: 'bg-green-100 text-green-800',
      Expired: 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={statusConfig[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="clients">Clients</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
        <TabsTrigger value="commissions">Commissions</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{agent.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{agent.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">{agent.region}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">Joined: {agent.joinDate || 'Jan 2024'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Specialization</label>
                <p className="text-sm mt-1">{agent.specialization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">License Number</label>
                <p className="text-sm mt-1">{agent.licenseNumber || 'IRDAI-AG-25896-12/14'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                <p className="text-sm mt-1">{agent.commissionRate || 12.5}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employment Type</label>
                <p className="text-sm mt-1">{agent.employmentType || 'Full Time'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Bank Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Bank Name</label>
                <p className="text-sm mt-1">{agent.bankDetails?.bankName || 'Chase Bank'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Number</label>
                <p className="text-sm mt-1">{agent.bankDetails?.accountNumber || '****1234'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Routing Number</label>
                <p className="text-sm mt-1">{agent.bankDetails?.routingNumber || '****5678'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Clients</span>
                <span className="font-medium">{agent.clientsCount || 45}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Active Policies</span>
                <span className="font-medium">{agent.policiesCount || 67}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Premium</span>
                <span className="font-medium">${agent.totalPremium?.toLocaleString() || '125,000'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Conversion Rate</span>
                <span className="font-medium">{agent.conversionRate || 75.5}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="clients" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Client Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Policies</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>{client.policies}</TableCell>
                      <TableCell>${client.premium.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="policies" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Policy Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Premium</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="font-medium">{policy.number}</TableCell>
                      <TableCell>{policy.type}</TableCell>
                      <TableCell>{policy.client}</TableCell>
                      <TableCell>${policy.premium.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="commissions" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Commissions</p>
                  <p className="text-2xl font-bold">$15,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">$3,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paid</p>
                  <p className="text-2xl font-bold">$12,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCommissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">{commission.policy}</TableCell>
                      <TableCell>${commission.amount}</TableCell>
                      <TableCell>{commission.rate}%</TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>{new Date(commission.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Targets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Performance Targets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Monthly Policies</span>
                  <span className="text-sm text-gray-500">8/8</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Monthly Premium</span>
                  <span className="text-sm text-gray-500">$15,000/$15,000</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Quarterly Policies</span>
                  <span className="text-sm text-gray-500">23/24</span>
                </div>
                <Progress value={96} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Monthly Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPerformance.monthly.map((month, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-500">{month.clients} clients, {month.policies} policies</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${month.premium.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Commission: ${month.commission}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium">Top Performer Q1 2024</p>
                  <p className="text-sm text-gray-500">Exceeded targets by 150%</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Client Champion</p>
                  <p className="text-sm text-gray-500">Highest client satisfaction</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Sales Leader</p>
                  <p className="text-sm text-gray-500">Top sales for 3 months</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AgentDetailTabs;
