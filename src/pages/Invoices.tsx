import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { AdvancedCard } from '@/components/ui/advanced-card'
import { usePermissions } from '@/hooks/use-permissions'
import { useIsMobile } from '@/hooks/use-mobile'
import { Plus, Search, Filter, MoreHorizontal, FileText, DollarSign, Calendar, User, Building, Download, Eye, Edit, Trash2, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'

// Mock data for invoices
const mockInvoices = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2024-001',
    clientId: 'CL-001',
    clientName: 'John Smith',
    clientType: 'individual',
    policyId: 'POL-001',
    policyType: 'vehicle',
    amount: 2500.00,
    tax: 250.00,
    total: 2750.00,
    status: 'paid',
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    paymentDate: '2024-01-20',
    paymentMethod: 'credit_card',
    description: 'Annual vehicle insurance premium',
    notes: 'Payment received on time',
    documents: ['invoice.pdf', 'receipt.pdf'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2024-002',
    clientId: 'CL-002',
    clientName: 'ABC Corporation',
    clientType: 'corporate',
    policyId: 'POL-002',
    policyType: 'health',
    amount: 15000.00,
    tax: 1500.00,
    total: 16500.00,
    status: 'pending',
    dueDate: '2024-02-28',
    issueDate: '2024-01-20',
    paymentDate: null,
    paymentMethod: null,
    description: 'Group health insurance premium',
    notes: 'Awaiting payment confirmation',
    documents: ['invoice.pdf'],
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z'
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2024-003',
    clientId: 'CL-003',
    clientName: 'Sarah Johnson',
    clientType: 'individual',
    policyId: 'POL-003',
    policyType: 'travel',
    amount: 800.00,
    tax: 80.00,
    total: 880.00,
    status: 'overdue',
    dueDate: '2024-01-31',
    issueDate: '2024-01-01',
    paymentDate: null,
    paymentMethod: null,
    description: 'Travel insurance premium',
    notes: 'Payment overdue - reminder sent',
    documents: ['invoice.pdf', 'reminder.pdf'],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-31T16:00:00Z'
  },
  {
    id: 'INV-004',
    invoiceNumber: 'INV-2024-004',
    clientId: 'CL-004',
    clientName: 'XYZ Manufacturing',
    clientType: 'corporate',
    policyId: 'POL-004',
    policyType: 'property',
    amount: 25000.00,
    tax: 2500.00,
    total: 27500.00,
    status: 'draft',
    dueDate: '2024-03-15',
    issueDate: null,
    paymentDate: null,
    paymentMethod: null,
    description: 'Property insurance premium',
    notes: 'Draft invoice - pending approval',
    documents: ['draft.pdf'],
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },
  {
    id: 'INV-005',
    invoiceNumber: 'INV-2024-005',
    clientId: 'CL-005',
    clientName: 'Mike Wilson',
    clientType: 'individual',
    policyId: 'POL-005',
    policyType: 'life',
    amount: 3000.00,
    tax: 300.00,
    total: 3300.00,
    status: 'paid',
    dueDate: '2024-02-10',
    issueDate: '2024-01-10',
    paymentDate: '2024-01-12',
    paymentMethod: 'bank_transfer',
    description: 'Life insurance premium',
    notes: 'Payment received via bank transfer',
    documents: ['invoice.pdf', 'receipt.pdf'],
    createdAt: '2024-01-10T13:00:00Z',
    updatedAt: '2024-01-12T10:15:00Z'
  }
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
]

const clientTypeOptions = [
  { value: 'all', label: 'All Client Types' },
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'group', label: 'Group' }
]

const policyTypeOptions = [
  { value: 'all', label: 'All Policy Types' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'health', label: 'Health' },
  { value: 'travel', label: 'Travel' },
  { value: 'property', label: 'Property' },
  { value: 'life', label: 'Life' }
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { variant: 'secondary', icon: Clock },
    pending: { variant: 'default', icon: Clock },
    paid: { variant: 'default', icon: CheckCircle },
    overdue: { variant: 'destructive', icon: AlertCircle },
    cancelled: { variant: 'secondary', icon: AlertCircle }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

const getClientTypeBadge = (type: string) => {
  const typeConfig = {
    individual: { variant: 'default', icon: User },
    corporate: { variant: 'secondary', icon: Building },
    group: { variant: 'outline', icon: Building }
  }
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.individual
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  )
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const InvoiceForm = ({ invoice, onSubmit, onCancel }: { 
  invoice?: any, 
  onSubmit: (data: any) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState(invoice || {
    clientId: '',
    policyId: '',
    amount: '',
    tax: '',
    description: '',
    dueDate: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client ID</label>
          <Input
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            placeholder="Enter client ID"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Policy ID</label>
          <Input
            value={formData.policyId}
            onChange={(e) => setFormData({ ...formData, policyId: e.target.value })}
            placeholder="Enter policy ID"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tax</label>
          <Input
            type="number"
            step="0.01"
            value={formData.tax}
            onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter invoice description"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Due Date</label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Enter additional notes"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  )
}

const InvoiceView = ({ invoice, onClose }: { invoice: any, onClose: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
          <p className="text-sm text-muted-foreground">{invoice.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(invoice.total)}
          </div>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client ID:</span>
                  <span className="text-sm font-medium">{invoice.clientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client Name:</span>
                  <span className="text-sm font-medium">{invoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client Type:</span>
                  {getClientTypeBadge(invoice.clientType)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Policy Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Policy ID:</span>
                  <span className="text-sm font-medium">{invoice.policyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Policy Type:</span>
                  <Badge variant="outline">{invoice.policyType}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Issue Date:</span>
                <span className="text-sm font-medium">{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Due Date:</span>
                <span className="text-sm font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Date:</span>
                <span className="text-sm font-medium">{formatDate(invoice.paymentDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium">{invoice.paymentMethod || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Financial Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-medium">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-sm font-medium">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(invoice.total)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.documents && invoice.documents.length > 0 ? (
                <div className="space-y-2">
                  {invoice.documents.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No documents attached</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Invoice Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                  </div>
                </div>
                {invoice.issueDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Invoice Issued</p>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.issueDate)}</p>
                    </div>
                  </div>
                )}
                {invoice.paymentDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Payment Received</p>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.paymentDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(invoice.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}

export default function Invoices() {
  const { hasPermission } = usePermissions()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientTypeFilter, setClientTypeFilter] = useState('all')
  const [policyTypeFilter, setPolicyTypeFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)

  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientId.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      const matchesClientType = clientTypeFilter === 'all' || invoice.clientType === clientTypeFilter
      const matchesPolicyType = policyTypeFilter === 'all' || invoice.policyType === policyTypeFilter
      
      return matchesSearch && matchesStatus && matchesClientType && matchesPolicyType
    })
  }, [searchTerm, statusFilter, clientTypeFilter, policyTypeFilter])

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0)
  }, [filteredInvoices])

  const paidAmount = useMemo(() => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0)
  }, [filteredInvoices])

  const pendingAmount = useMemo(() => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + invoice.total, 0)
  }, [filteredInvoices])

  const overdueAmount = useMemo(() => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.total, 0)
  }, [filteredInvoices])

  const handleCreateInvoice = (data: any) => {
    // Handle invoice creation
    console.log('Creating invoice:', data)
    setIsCreateDialogOpen(false)
  }

  const handleEditInvoice = (data: any) => {
    // Handle invoice update
    console.log('Updating invoice:', data)
    setIsEditDialogOpen(false)
    setEditingInvoice(null)
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    // Handle invoice deletion
    console.log('Deleting invoice:', invoiceId)
  }

  const handleSendInvoice = (invoiceId: string) => {
    // Handle sending invoice
    console.log('Sending invoice:', invoiceId)
  }

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice Number',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.invoiceNumber}</div>
      )
    },
    {
      accessorKey: 'clientName',
      header: 'Client',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.clientName}</div>
          <div className="text-sm text-muted-foreground">{row.original.clientId}</div>
        </div>
      )
    },
    {
      accessorKey: 'policyType',
      header: 'Policy Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.policyType}</Badge>
      )
    },
    {
      accessorKey: 'total',
      header: 'Amount',
      cell: ({ row }: any) => (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(row.original.total)}</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(row.original.amount)} + {formatCurrency(row.original.tax)} tax
          </div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.dueDate)}</div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
              setSelectedInvoice(row.original)
              setIsViewDialogOpen(true)
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {hasPermission('invoices', 'update') && (
              <DropdownMenuItem onClick={() => {
                setEditingInvoice(row.original)
                setIsEditDialogOpen(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {hasPermission('invoices', 'delete') && (
              <DropdownMenuItem 
                onClick={() => handleDeleteInvoice(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSendInvoice(row.original.id)}>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all insurance invoices
          </p>
        </div>
        {hasPermission('invoices', 'create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Create a new invoice for a client and policy
                </DialogDescription>
              </DialogHeader>
              <InvoiceForm
                onSubmit={handleCreateInvoice}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedCard
          title="Total Invoices"
          subtitle={`${filteredInvoices.length} invoices`}
          description="Total value of all invoices"
          value={formatCurrency(totalAmount)}
          trend="+12.5%"
          trendDirection="up"
          icon={FileText}
          iconColor="text-blue-600"
        />
        <AdvancedCard
          title="Paid Invoices"
          subtitle={`${filteredInvoices.filter(i => i.status === 'paid').length} invoices`}
          description="Total amount received"
          value={formatCurrency(paidAmount)}
          trend="+8.2%"
          trendDirection="up"
          icon={CheckCircle}
          iconColor="text-green-600"
        />
        <AdvancedCard
          title="Pending Invoices"
          subtitle={`${filteredInvoices.filter(i => i.status === 'pending').length} invoices`}
          description="Amount awaiting payment"
          value={formatCurrency(pendingAmount)}
          trend="-2.1%"
          trendDirection="down"
          icon={Clock}
          iconColor="text-yellow-600"
        />
        <AdvancedCard
          title="Overdue Invoices"
          subtitle={`${filteredInvoices.filter(i => i.status === 'overdue').length} invoices`}
          description="Amount past due date"
          value={formatCurrency(overdueAmount)}
          trend="+15.3%"
          trendDirection="up"
          icon={AlertCircle}
          iconColor="text-red-600"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter invoices by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Type</label>
              <Select value={clientTypeFilter} onValueChange={setClientTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Policy Type</label>
              <Select value={policyTypeFilter} onValueChange={setPolicyTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {policyTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Manage and track all insurance invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredInvoices}
            searchKey="invoiceNumber"
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingInvoice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
              <DialogDescription>
                Update invoice information
              </DialogDescription>
            </DialogHeader>
            <InvoiceForm
              invoice={editingInvoice}
              onSubmit={handleEditInvoice}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingInvoice(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {selectedInvoice && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View complete invoice information
              </DialogDescription>
            </DialogHeader>
            <InvoiceView
              invoice={selectedInvoice}
              onClose={() => {
                setIsViewDialogOpen(false)
                setSelectedInvoice(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}