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
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, Send, Clock, CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp, Users, FileText } from 'lucide-react';

// Mock data for offers
const mockOffers = [
  {
    id: 'O001',
    offerNumber: 'OF-2024-001',
    quotationId: 'QT-2024-001',
    clientName: 'John Smith',
    clientId: 'C001',
    productType: 'Life Insurance',
    policyType: 'Term Life',
    sumAssured: 500000,
    premium: 2500,
    discount: 200,
    finalPremium: 2300,
    status: 'Pending',
    priority: 'High',
    validUntil: '2024-12-31',
    createdAt: '2024-01-15',
    assignedAgent: 'Agent A',
    source: 'Direct',
    notes: 'Special offer for new customers',
    terms: 'Standard terms apply',
    documents: ['offer_letter.pdf', 'terms_conditions.pdf'],
    followUps: [
      { date: '2024-01-20', note: 'Follow up call scheduled' },
      { date: '2024-01-25', note: 'Send detailed offer' }
    ],
    commission: 250,
    conversionRate: 0.8
  },
  {
    id: 'O002',
    offerNumber: 'OF-2024-002',
    quotationId: 'QT-2024-002',
    clientName: 'ABC Corporation',
    clientId: 'C002',
    productType: 'Group Health',
    policyType: 'Family Floater',
    sumAssured: 1000000,
    premium: 15000,
    discount: 1500,
    finalPremium: 13500,
    status: 'Accepted',
    priority: 'Medium',
    validUntil: '2024-11-30',
    createdAt: '2024-01-10',
    assignedAgent: 'Agent B',
    source: 'Referral',
    notes: 'Corporate group discount applied',
    terms: 'Group terms with special conditions',
    documents: ['corporate_offer.pdf', 'group_terms.pdf'],
    followUps: [
      { date: '2024-01-18', note: 'Meeting with HR manager' }
    ],
    commission: 1350,
    conversionRate: 1.0
  },
  {
    id: 'O003',
    offerNumber: 'OF-2024-003',
    quotationId: 'QT-2024-003',
    clientName: 'Sarah Johnson',
    clientId: 'C003',
    productType: 'Motor Insurance',
    policyType: 'Comprehensive',
    sumAssured: 800000,
    premium: 8000,
    discount: 400,
    finalPremium: 7600,
    status: 'Rejected',
    priority: 'Low',
    validUntil: '2024-10-31',
    createdAt: '2024-01-05',
    assignedAgent: 'Agent C',
    source: 'Online',
    notes: 'Competitive pricing offered',
    terms: 'Standard motor insurance terms',
    documents: ['motor_offer.pdf', 'vehicle_details.pdf'],
    followUps: [
      { date: '2024-01-12', note: 'Client declined offer' }
    ],
    commission: 760,
    conversionRate: 0.0
  }
];

const Offers = () => {
  const [offers, setOffers] = useState(mockOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [editingOffer, setEditingOffer] = useState({});

  const { hasPermission } = usePermissions();

  // Filter offers based on search and filters
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.offerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.productType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || offer.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [offers, searchTerm, statusFilter, priorityFilter]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = offers.length;
    const pending = offers.filter(o => o.status === 'Pending').length;
    const accepted = offers.filter(o => o.status === 'Accepted').length;
    const rejected = offers.filter(o => o.status === 'Rejected').length;
    const totalValue = offers.reduce((sum, o) => sum + o.sumAssured, 0);
    const totalPremium = offers.reduce((sum, o) => sum + o.finalPremium, 0);
    const totalDiscount = offers.reduce((sum, o) => sum + o.discount, 0);
    const avgConversionRate = offers.reduce((sum, o) => sum + o.conversionRate, 0) / offers.length;

    return { total, pending, accepted, rejected, totalValue, totalPremium, totalDiscount, avgConversionRate };
  }, [offers]);

  // Data table columns
  const columns = [
    {
      accessorKey: 'offerNumber',
      header: 'Offer #',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.offerNumber}</div>
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
      accessorKey: 'financial',
      header: 'Financial Details',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">₹{row.original.finalPremium.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">
            Original: ₹{row.original.premium.toLocaleString()}
          </div>
          <div className="text-sm text-green-600">
            Discount: ₹{row.original.discount.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          Pending: { variant: 'default', icon: Clock },
          Accepted: { variant: 'default', icon: CheckCircle },
          Rejected: { variant: 'destructive', icon: XCircle }
        };
        const config = statusConfig[status] || statusConfig.Pending;
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
      accessorKey: 'conversionRate',
      header: 'Conversion',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{(row.original.conversionRate * 100).toFixed(0)}%</div>
          <div className="text-sm text-muted-foreground">
            ₹{row.original.commission.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.validUntil}</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission('offers', 'read') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('offers', 'update') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {hasPermission('offers', 'delete') && (
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
  const handleView = (offer) => {
    setSelectedOffer(offer);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer({ ...offer });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      setOffers(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleCreate = (newOffer) => {
    const offer = {
      ...newOffer,
      id: `O${String(offers.length + 1).padStart(3, '0')}`,
      offerNumber: `OF-2024-${String(offers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      finalPremium: newOffer.premium - (newOffer.discount || 0),
      commission: Math.round((newOffer.premium - (newOffer.discount || 0)) * 0.1),
      conversionRate: 0.0
    };
    setOffers(prev => [offer, ...prev]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = (updatedOffer) => {
    const offer = {
      ...updatedOffer,
      finalPremium: updatedOffer.premium - (updatedOffer.discount || 0),
      commission: Math.round((updatedOffer.premium - (updatedOffer.discount || 0)) * 0.1)
    };
    setOffers(prev => prev.map(o => 
      o.id === offer.id ? offer : o
    ));
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">
            Manage insurance offers and proposals
          </p>
        </div>
        {hasPermission('offers', 'create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new offer
                </DialogDescription>
              </DialogHeader>
              <OfferForm
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
          title="Total Offers"
          value={summaryMetrics.total}
          description="All offers in system"
          icon={FileText}
          trend="+15%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Pending Offers"
          value={summaryMetrics.pending}
          description="Awaiting response"
          icon={Clock}
          trend="+8%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Accepted Offers"
          value={summaryMetrics.accepted}
          description="Successfully converted"
          icon={CheckCircle}
          trend="+12%"
          trendDirection="up"
        />
        <AdvancedCard
          title="Conversion Rate"
          value={`${(summaryMetrics.avgConversionRate * 100).toFixed(1)}%`}
          description="Average success rate"
          icon={TrendingUp}
          trend="+5%"
          trendDirection="up"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summaryMetrics.totalValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              Sum assured across all offers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Premium</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summaryMetrics.totalPremium / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Final premium after discounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(summaryMetrics.totalDiscount / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">
              Discounts offered to clients
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
                  placeholder="Search offers..."
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
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
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
          <CardTitle>Offers</CardTitle>
          <CardDescription>
            Manage and track all insurance offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredOffers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              View offer information and details
            </DialogDescription>
          </DialogHeader>
          {selectedOffer && (
            <OfferView offer={selectedOffer} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Update offer information
            </DialogDescription>
          </DialogHeader>
          <OfferForm
            offer={editingOffer}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditDialogOpen(false)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Offer Form Component
const OfferForm = ({ offer = {}, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    quotationId: offer.quotationId || '',
    clientName: offer.clientName || '',
    clientId: offer.clientId || '',
    productType: offer.productType || '',
    policyType: offer.policyType || '',
    sumAssured: offer.sumAssured || '',
    premium: offer.premium || '',
    discount: offer.discount || 0,
    status: offer.status || 'Pending',
    priority: offer.priority || 'Medium',
    validUntil: offer.validUntil || '',
    assignedAgent: offer.assignedAgent || '',
    source: offer.source || '',
    notes: offer.notes || '',
    terms: offer.terms || ''
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
          <Label htmlFor="quotationId">Quotation ID</Label>
          <Input
            id="quotationId"
            value={formData.quotationId}
            onChange={(e) => handleChange('quotationId', e.target.value)}
            required
          />
        </div>
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
          <Label htmlFor="premium">Original Premium (₹)</Label>
          <Input
            id="premium"
            type="number"
            value={formData.premium}
            onChange={(e) => handleChange('premium', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="discount">Discount (₹)</Label>
          <Input
            id="discount"
            type="number"
            value={formData.discount}
            onChange={(e) => handleChange('discount', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            value={formData.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Offer
        </Button>
      </div>
    </form>
  );
};

// Offer View Component
const OfferView = ({ offer }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer Number:</span>
                  <span className="font-medium">{offer.offerNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quotation ID:</span>
                  <span className="font-medium">{offer.quotationId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{offer.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client ID:</span>
                  <span className="font-medium">{offer.clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product Type:</span>
                  <span className="font-medium">{offer.productType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Policy Type:</span>
                  <span className="font-medium">{offer.policyType}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={offer.status === 'Accepted' ? 'default' : 'secondary'}>
                    {offer.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={offer.priority === 'High' ? 'destructive' : 'default'}>
                    {offer.priority}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid Until:</span>
                  <span className="font-medium">{offer.validUntil}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">{offer.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Agent:</span>
                  <span className="font-medium">{offer.assignedAgent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{offer.source}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{offer.notes || 'No notes available'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{offer.terms || 'Standard terms apply'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Premium Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sum Assured:</span>
                  <span className="font-medium">₹{offer.sumAssured.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Premium:</span>
                  <span className="font-medium">₹{offer.premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-medium text-green-600">₹{offer.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Final Premium:</span>
                  <span className="font-bold text-lg">₹{offer.finalPremium.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission & Conversion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission:</span>
                  <span className="font-medium">₹{offer.commission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conversion Rate:</span>
                  <span className="font-medium">{(offer.conversionRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Savings for Client:</span>
                  <span className="font-medium text-green-600">
                    {((offer.discount / offer.premium) * 100).toFixed(1)}%
                  </span>
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
              {offer.documents && offer.documents.length > 0 ? (
                <div className="space-y-2">
                  {offer.documents.map((doc, index) => (
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
              {offer.followUps && offer.followUps.length > 0 ? (
                <div className="space-y-3">
                  {offer.followUps.map((followUp, index) => (
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

export default Offers;