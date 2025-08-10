import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AdvancedCard } from '../components/ui/advanced-card';
import { DataTable } from '../components/ui/data-table';
import { usePermissions } from '../hooks/usePermissions';
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, Send, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp, Users, FileText, Star, Award, Target, Activity } from 'lucide-react';

// Mock data for agents
const mockAgents = [
  {
    id: 'A001',
    agentId: 'AG-2024-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@insurance.com',
    phone: '+91-98765-43210',
    status: 'Active',
    role: 'Senior Agent',
    department: 'Sales',
    joiningDate: '2020-03-15',
    experience: '4 years',
    licenseNumber: 'LIC-123456',
    commissionRate: 15,
    target: 1000000,
    achieved: 850000,
    performance: 85,
    clients: 45,
    policies: 120,
    claims: 8,
    leads: 25,
    rating: 4.8,
    specializations: ['Life Insurance', 'Health Insurance'],
    documents: ['license.pdf', 'certification.pdf'],
    notes: 'Top performing agent with excellent client relationships',
    achievements: [
      { date: '2024-01-15', achievement: 'Exceeded monthly target by 20%' },
      { date: '2023-12-20', achievement: 'Best Agent of the Month' }
    ]
  },
  {
    id: 'A002',
    agentId: 'AG-2024-002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@insurance.com',
    phone: '+91-98765-43211',
    status: 'Active',
    role: 'Agent',
    department: 'Sales',
    joiningDate: '2022-06-10',
    experience: '2 years',
    licenseNumber: 'LIC-123457',
    commissionRate: 12,
    target: 800000,
    achieved: 720000,
    performance: 90,
    clients: 32,
    policies: 85,
    claims: 5,
    leads: 18,
    rating: 4.6,
    specializations: ['Motor Insurance', 'Property Insurance'],
    documents: ['license.pdf', 'training_cert.pdf'],
    notes: 'Young and enthusiastic agent with good potential',
    achievements: [
      { date: '2024-01-10', achievement: 'Achieved quarterly target' }
    ]
  },
  {
    id: 'A003',
    agentId: 'AG-2024-003',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@insurance.com',
    phone: '+91-98765-43212',
    status: 'Inactive',
    role: 'Agent',
    department: 'Sales',
    joiningDate: '2021-09-20',
    experience: '3 years',
    licenseNumber: 'LIC-123458',
    commissionRate: 12,
    target: 900000,
    achieved: 450000,
    performance: 50,
    clients: 28,
    policies: 65,
    claims: 12,
    leads: 15,
    rating: 3.9,
    specializations: ['Travel Insurance', 'Life Insurance'],
    documents: ['license.pdf'],
    notes: 'Currently on leave due to personal reasons',
    achievements: [
      { date: '2023-08-15', achievement: 'Completed advanced training' }
    ]
  }
];

const Agents = () => {
  const [agents, setAgents] = useState(mockAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editingAgent, setEditingAgent] = useState({});

  const { hasPermission } = usePermissions();

  // Filter agents based on search and filters
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          agent.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || agent.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [agents, searchTerm, statusFilter, departmentFilter]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'Active').length;
    const inactive = agents.filter(a => a.status === 'Inactive').length;
    const totalTarget = agents.reduce((sum, a) => sum + a.target, 0);
    const totalAchieved = agents.reduce((sum, a) => sum + a.achieved, 0);
    const avgPerformance = agents.reduce((sum, a) => sum + a.performance, 0) / agents.length;
    const totalClients = agents.reduce((sum, a) => sum + a.clients, 0);
    const totalPolicies = agents.reduce((sum, a) => sum + a.policies, 0);

    return { total, active, inactive, totalTarget, totalAchieved, avgPerformance, totalClients, totalPolicies };
  }, [agents]);

  // Data table columns
  const columns = [
    {
      accessorKey: 'agentId',
      header: 'Agent ID',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.agentId}</div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Agent Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{`${row.original.firstName} ${row.original.lastName}`}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      )
    },
    {
      accessorKey: 'role',
      header: 'Role & Department',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.role}</div>
          <div className="text-sm text-muted-foreground">{row.original.department}</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          Active: { variant: 'default', icon: CheckCircle },
          Inactive: { variant: 'secondary', icon: Clock },
          Suspended: { variant: 'destructive', icon: XCircle }
        };
        const config = statusConfig[status] || statusConfig.Inactive;
        const Icon = config.icon;
        
        return (
          <Badge variant={config.variant} className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {status}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'performance',
      header: 'Performance',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.original.performance}%</div>
          <div className="text-sm text-muted-foreground">
            ₹{(row.original.achieved / 100000).toFixed(1)}L / ₹{(row.original.target / 100000).toFixed(1)}L
          </div>
        </div>
      )
    },
    {
      accessorKey: 'metrics',
      header: 'Key Metrics',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.original.clients} clients</div>
          <div className="text-sm text-muted-foreground">
            {row.original.policies} policies
          </div>
        </div>
      )
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{row.original.rating}</span>
        </div>
      )
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.experience}</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission('agents', 'read') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('agents', 'update') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('agents', 'delete') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  // Handle actions
  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (agent) => {
    setEditingAgent({ ...agent });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCreate = (newAgent) => {
    const agent = {
      ...newAgent,
      id: `A${String(agents.length + 1).padStart(3, '0')}`,
      agentId: `AG-2024-${String(agents.length + 1).padStart(3, '0')}`,
      joiningDate: new Date().toISOString().split('T')[0],
      performance: 0,
      clients: 0,
      policies: 0,
      claims: 0,
      leads: 0,
      rating: 0,
      achievements: []
    };
    setAgents(prev => [agent, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = (updatedAgent) => {
    setAgents(prev => prev.map(a => 
      a.id === updatedAgent.id ? updatedAgent : a
    ));
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage insurance agents and their performance
          </p>
        </div>
        {hasPermission('agents', 'create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new agent
                </DialogDescription>
              </DialogHeader>
              <AgentForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedCard
          title="Total Agents"
          value={summaryMetrics.total}
          description="All agents in system"
          icon={Users}
          trend="+8%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Active Agents"
          value={summaryMetrics.active}
          description="Currently active"
          icon={CheckCircle}
          trend="+5%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Avg Performance"
          value={`${summaryMetrics.avgPerformance.toFixed(1)}%`}
          description="Target achievement rate"
          icon={Target}
          trend="+12%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Total Clients"
          value={summaryMetrics.totalClients}
          description="Managed by agents"
          icon={Activity}
          trend="+15%"
          trendDirection="up"
        />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summaryMetrics.totalTarget / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              Combined target for all agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achieved</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summaryMetrics.totalAchieved / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              Combined achievement by all agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalPolicies}</div>
            <p className="text-xs text-muted-foreground">
              Policies sold by all agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="department-filter">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Claims">Claims</SelectItem>
                  <SelectItem value="Underwriting">Underwriting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            Manage and track all insurance agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredAgents}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
            <DialogDescription>
              View agent information and performance
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <AgentView agent={selectedAgent} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information
            </DialogDescription>
          </DialogHeader>
          <AgentForm
            agent={editingAgent}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Agent Form Component
const AgentForm = ({ agent = {}, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    firstName: agent.firstName || '',
    lastName: agent.lastName || '',
    email: agent.email || '',
    phone: agent.phone || '',
    status: agent.status || 'Active',
    role: agent.role || 'Agent',
    department: agent.department || 'Sales',
    joiningDate: agent.joiningDate || '',
    experience: agent.experience || '',
    licenseNumber: agent.licenseNumber || '',
    commissionRate: agent.commissionRate || 12,
    target: agent.target || 0,
    specializations: agent.specializations || [],
    notes: agent.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Agent">Agent</SelectItem>
              <SelectItem value="Senior Agent">Senior Agent</SelectItem>
              <SelectItem value="Team Lead">Team Lead</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Claims">Claims</SelectItem>
              <SelectItem value="Underwriting">Underwriting</SelectItem>
              <SelectItem value="Customer Service">Customer Service</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="joiningDate">Joining Date</Label>
          <Input
            id="joiningDate"
            type="date"
            value={formData.joiningDate}
            onChange={(e) => handleChange('joiningDate', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            value={formData.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            placeholder="e.g., 3 years"
          />
        </div>
        <div>
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => handleChange('licenseNumber', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="commissionRate">Commission Rate (%)</Label>
          <Input
            id="commissionRate"
            type="number"
            value={formData.commissionRate}
            onChange={(e) => handleChange('commissionRate', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="target">Target (₹)</Label>
          <Input
            id="target"
            type="number"
            value={formData.target}
            onChange={(e) => handleChange('target', parseInt(e.target.value))}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Agent
        </Button>
      </div>
    </form>
  );
};

// Agent View Component
const AgentView = ({ agent }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent ID:</span>
                  <span className="font-medium">{agent.agentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{`${agent.firstName} ${agent.lastName}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{agent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{agent.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                    {agent.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium">{agent.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{agent.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Joining Date:</span>
                  <span className="font-medium">{agent.joiningDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">{agent.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Number:</span>
                  <span className="font-medium">{agent.licenseNumber}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {agent.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{agent.notes || 'No notes available'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">₹{(agent.target / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achieved:</span>
                  <span className="font-medium">₹{(agent.achieved / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Performance:</span>
                  <span className="font-medium">{agent.performance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission Rate:</span>
                  <span className="font-medium">{agent.commissionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clients:</span>
                  <span className="font-medium">{agent.clients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policies:</span>
                  <span className="font-medium">{agent.policies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claims:</span>
                  <span className="font-medium">{agent.claims}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leads:</span>
                  <span className="font-medium">{agent.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{agent.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {agent.documents && agent.documents.length > 0 ? (
                <div className="space-y-2">
                  {agent.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <span>{doc}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No documents attached</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {agent.achievements && agent.achievements.length > 0 ? (
                <div className="space-y-3">
                  {agent.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.date}</div>
                        <div className="text-sm text-muted-foreground">{achievement.achievement}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No achievements recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send Performance Report
        </Button>
      </div>
    </div>
  );
};

export default Agents;