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
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Mock data for quotations
const mockQuotations = [
  {
    id: 'Q001',
    quotationNumber: 'QT-2024-001',
    clientName: 'John Smith',
    clientId: 'C001',
    productType: 'Life Insurance',
    policyType: 'Term Life',
    sumAssured: 500000,
    premium: 2500,
    status: 'Draft',
    priority: 'High',
    validUntil: '2024-12-31',
    createdAt: '2024-01-15',
    assignedAgent: 'Agent A',
    source: 'Direct',
    notes: 'Client interested in term life coverage',
    documents: ['medical_report.pdf', 'income_proof.pdf'],
    followUps: [
      { date: '2024-01-20', note: 'Follow up call scheduled' },
      { date: '2024-01-25', note: 'Send detailed proposal' }
    ]
  },
  {
    id: 'Q002',
    quotationNumber: 'QT-2024-002',
    clientName: 'ABC Corporation',
    clientId: 'C002',
    productType: 'Group Health',
    policyType: 'Family Floater',
    sumAssured: 1000000,
    premium: 15000,
    status: 'Pending',
    priority: 'Medium',
    validUntil: '2024-11-30',
    createdAt: '2024-01-10',
    assignedAgent: 'Agent B',
    source: 'Referral',
    notes: 'Corporate group health plan for 50 employees',
    documents: ['company_profile.pdf', 'employee_list.pdf'],
    followUps: [
      { date: '2024-01-18', note: 'Meeting with HR manager' }
    ]
  },
  {
    id: 'Q003',
    quotationNumber: 'QT-2024-003',
    clientName: 'Sarah Johnson',
    clientId: 'C003',
    productType: 'Motor Insurance',
    policyType: 'Comprehensive',
    sumAssured: 800000,
    premium: 8000,
    status: 'Approved',
    priority: 'Low',
    validUntil: '2024-10-31',
    createdAt: '2024-01-05',
    assignedAgent: 'Agent C',
    source: 'Online',
    notes: 'New car insurance for luxury vehicle',
    documents: ['rc_book.pdf', 'driving_license.pdf'],
    followUps: [
      { date: '2024-01-12', note: 'Policy documents sent' }
    ]
  }
];

const Quotations = () => {
  const [quotations, setQuotations] = useState(mockQuotations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState({});

  const { hasPermission } = usePermissions();

  // Filter quotations based on search and filters
  const filteredQuotations = useMemo(() => {
    return quotations.filter(quotation => {
      const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quotation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quotation.productType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || quotation.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [quotations, searchTerm, statusFilter, priorityFilter]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = quotations.length;
    const draft = quotations.filter(q => q.status === 'Draft').length;
    const pending = quotations.filter(q => q.status === 'Pending').length;
    const approved = quotations.filter(q => q.status === 'Approved').length;
    const totalValue = quotations.reduce((sum, q) => sum + q.sumAssured, 0);
    const totalPremium = quotations.reduce((sum, q) => sum + q.premium, 0);

    return { total, draft, pending, approved, totalValue, totalPremium };
  }, [quotations]);

  // Data table columns
  const columns = [
    {
      accessorKey: 'quotationNumber',
      header: 'Quotation #',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.quotationNumber}</div>
      )
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.clientName}</div>
          <div className="text-sm text-muted-foreground">ID: {row.original.clientId}</div>
        </div>
      )
    },
    {
      accessorKey: 'productType',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.productType}</div>
          <div className="text-sm text-muted-foreground">{row.original.policyType}</div>
        </div>
      )
    },
    {
      accessorKey: 'sumAssured',
      header: 'Sum Assured',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">₹{row.original.sumAssured.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Premium: ₹{row.original.premium.toLocaleString()}</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          Draft: { variant: 'secondary', icon: Clock },
          Pending: { variant: 'default', icon: AlertCircle },
          Approved: { variant: 'default', icon: CheckCircle },
          Rejected: { variant: 'destructive', icon: XCircle }
        };
        const config = statusConfig[status] || statusConfig.Draft;
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
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority;
        const priorityConfig = {
          High: 'destructive',
          Medium: 'default',
          Low: 'secondary'
        };
        
        return (
          <Badge variant={priorityConfig[priority] || 'secondary'}>
            {priority}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.validUntil}</div>
      )
    },
    {
      accessorKey: 'assignedAgent',
      header: 'Agent',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.assignedAgent}</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission('quotations', 'read') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('quotations', 'update') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('quotations', 'delete') && (
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
  const handleView = (quotation) => {
    setSelectedQuotation(quotation);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (quotation) => {
    setEditingQuotation({ ...quotation });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleCreate = (newQuotation) => {
    const quotation = {
      ...newQuotation,
      id: `Q${String(quotations.length + 1).padStart(3, '0')}`,
      quotationNumber: `QT-2024-${String(quotations.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setQuotations(prev => [quotation, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = (updatedQuotation) => {
    setQuotations(prev => prev.map(q => 
      q.id === updatedQuotation.id ? updatedQuotation : q
    ));
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Manage insurance quotations and proposals
          </p>
        </div>
        {hasPermission('quotations', 'create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Quotation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Quotation</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new quotation
                </DialogDescription>
              </DialogHeader>
              <QuotationForm
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
          title="Total Quotations"
          value={summaryMetrics.total}
          description="All quotations in system"
          icon={Clock}
          trend="+12%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Draft Quotations"
          value={summaryMetrics.draft}
          description="Pending completion"
          icon={Clock}
          trend="+5%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Pending Approval"
          value={summaryMetrics.pending}
          description="Awaiting decision"
          icon={AlertCircle}
          trend="+8%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Total Value"
          value={`₹${(summaryMetrics.totalValue / 100000).toFixed(1)}L`}
          description="Sum assured across all quotations"
          icon={CheckCircle}
          trend="+15%"
          trendDirection="up"
        />
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
                  placeholder="Search quotations..."
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
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotations</CardTitle>
          <CardDescription>
            Manage and track all insurance quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredQuotations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
            <DialogDescription>
              View quotation information and details
            </DialogDescription>
          </DialogHeader>
          {selectedQuotation && (
            <QuotationView quotation={selectedQuotation} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
            <DialogDescription>
              Update quotation information
            </DialogDescription>
          </DialogHeader>
          <QuotationForm
            quotation={editingQuotation}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quotation Form Component
const QuotationForm = ({ quotation = {}, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    clientName: quotation.clientName || '',
    clientId: quotation.clientId || '',
    productType: quotation.productType || '',
    policyType: quotation.policyType || '',
    sumAssured: quotation.sumAssured || '',
    premium: quotation.premium || '',
    status: quotation.status || 'Draft',
    priority: quotation.priority || 'Medium',
    validUntil: quotation.validUntil || '',
    assignedAgent: quotation.assignedAgent || '',
    source: quotation.source || '',
    notes: quotation.notes || ''
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
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={formData.clientId}
            onChange={(e) => handleChange('clientId', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="productType">Product Type</Label>
          <Select value={formData.productType} onValueChange={(value) => handleChange('productType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Life Insurance">Life Insurance</SelectItem>
              <SelectItem value="Health Insurance">Health Insurance</SelectItem>
              <SelectItem value="Motor Insurance">Motor Insurance</SelectItem>
              <SelectItem value="Property Insurance">Property Insurance</SelectItem>
              <SelectItem value="Travel Insurance">Travel Insurance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="policyType">Policy Type</Label>
          <Input
            id="policyType"
            value={formData.policyType}
            onChange={(e) => handleChange('policyType', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="sumAssured">Sum Assured (₹)</Label>
          <Input
            id="sumAssured"
            type="number"
            value={formData.sumAssured}
            onChange={(e) => handleChange('sumAssured', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="premium">Premium (₹)</Label>
          <Input
            id="premium"
            type="number"
            value={formData.premium}
            onChange={(e) => handleChange('premium', parseInt(e.target.value))}
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
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="assignedAgent">Assigned Agent</Label>
          <Input
            id="assignedAgent"
            value={formData.assignedAgent}
            onChange={(e) => handleChange('assignedAgent', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="source">Source</Label>
          <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Direct">Direct</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
            </SelectContent>
          </Select>
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
          {isEditing ? 'Update' : 'Create'} Quotation
        </Button>
      </div>
    </form>
  );
};

// Quotation View Component
const QuotationView = ({ quotation }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quotation Number:</span>
                  <span className="font-medium">{quotation.quotationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{quotation.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client ID:</span>
                  <span className="font-medium">{quotation.clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Type:</span>
                  <span className="font-medium">{quotation.productType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy Type:</span>
                  <span className="font-medium">{quotation.policyType}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sum Assured:</span>
                  <span className="font-medium">₹{quotation.sumAssured.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium:</span>
                  <span className="font-medium">₹{quotation.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={quotation.status === 'Approved' ? 'default' : 'secondary'}>
                    {quotation.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={quotation.priority === 'High' ? 'destructive' : 'default'}>
                    {quotation.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until:</span>
                  <span className="font-medium">{quotation.validUntil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{quotation.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Agent:</span>
                  <span className="font-medium">{quotation.assignedAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{quotation.source}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{quotation.notes || 'No notes available'}</p>
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
              {quotation.documents && quotation.documents.length > 0 ? (
                <div className="space-y-2">
                  {quotation.documents.map((doc, index) => (
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

        <TabsContent value="followups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              {quotation.followUps && quotation.followUps.length > 0 ? (
                <div className="space-y-3">
                  {quotation.followUps.map((followUp, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">{followUp.date}</div>
                        <div className="text-sm text-muted-foreground">{followUp.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No follow-ups scheduled</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-medium">Quotation Created</div>
                    <div className="text-sm text-muted-foreground">{quotation.createdAt}</div>
                    <div className="text-sm">Quotation {quotation.quotationNumber} was created</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-muted rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="font-medium">Status Updated</div>
                    <div className="text-sm text-muted-foreground">Current status: {quotation.status}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send to Client
        </Button>
      </div>
    </div>
  );
};

export default Quotations;