import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, RefreshCw, Eye, Edit, Trash2, Phone, Mail, Calendar, User, DollarSign, Target, TrendingUp, Clock, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { AdvancedCard } from '@/components/ui/advanced-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermissions } from '@/hooks/usePermissions'

// Mock data for Leads
const mockLeads = [
  {
    id: '1',
    leadId: 'LD-2024-001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    company: 'Tech Solutions Inc',
    source: 'Website',
    productInterest: 'Business Insurance',
    status: 'New',
    budget: 5000,
    assignedTo: 'Agent Johnson',
    priority: 'High',
    followUps: 2,
    notes: 3,
    lastContact: '2024-01-15',
    nextFollowUp: '2024-01-20'
  },
  {
    id: '2',
    leadId: 'LD-2024-002',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+1-555-0124',
    company: 'Healthcare Plus',
    source: 'Referral',
    productInterest: 'Health Insurance',
    status: 'Qualified',
    budget: 8000,
    assignedTo: 'Agent Davis',
    priority: 'Medium',
    followUps: 4,
    notes: 5,
    lastContact: '2024-01-12',
    nextFollowUp: '2024-01-18'
  },
  {
    id: '3',
    leadId: 'LD-2024-003',
    firstName: 'Mike',
    lastName: 'Brown',
    email: 'mike.brown@email.com',
    phone: '+1-555-0125',
    company: 'Auto Dealership',
    source: 'Cold Call',
    productInterest: 'Vehicle Insurance',
    status: 'Contacted',
    budget: 3000,
    assignedTo: 'Agent Johnson',
    priority: 'Low',
    followUps: 1,
    notes: 2,
    lastContact: '2024-01-10',
    nextFollowUp: '2024-01-25'
  },
  {
    id: '4',
    leadId: 'LD-2024-004',
    firstName: 'Lisa',
    lastName: 'Garcia',
    email: 'lisa.garcia@email.com',
    phone: '+1-555-0126',
    company: 'Real Estate Corp',
    source: 'Social Media',
    productInterest: 'Property Insurance',
    status: 'New',
    budget: 12000,
    assignedTo: 'Agent Davis',
    priority: 'High',
    followUps: 0,
    notes: 1,
    lastContact: '2024-01-14',
    nextFollowUp: '2024-01-22'
  },
  {
    id: '5',
    leadId: 'LD-2024-005',
    firstName: 'David',
    lastName: 'Lee',
    email: 'david.lee@email.com',
    phone: '+1-555-0127',
    company: 'Travel Agency',
    source: 'Website',
    productInterest: 'Travel Insurance',
    status: 'Qualified',
    budget: 2000,
    assignedTo: 'Agent Johnson',
    priority: 'Medium',
    followUps: 3,
    notes: 4,
    lastContact: '2024-01-08',
    nextFollowUp: '2024-01-16'
  }
]

const leadSources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Trade Show', 'Advertisement', 'Partner']
const leadStatuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost']
const priorities = ['Low', 'Medium', 'High', 'Critical']
const productInterests = ['Business Insurance', 'Health Insurance', 'Vehicle Insurance', 'Property Insurance', 'Life Insurance', 'Travel Insurance']

export default function Leads() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [editingLead, setEditingLead] = useState(null)

  // Filter leads based on selected filters
  const filteredLeads = useMemo(() => {
    return mockLeads.filter(lead => {
      const sourceMatch = selectedSource === 'all' || lead.source === selectedSource
      const statusMatch = selectedStatus === 'all' || lead.status === selectedStatus
      const priorityMatch = selectedPriority === 'all' || lead.priority === selectedPriority
      return sourceMatch && statusMatch && priorityMatch
    })
  }, [selectedSource, selectedStatus, selectedPriority])

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredLeads.length
    const newLeads = filteredLeads.filter(l => l.status === 'New').length
    const qualified = filteredLeads.filter(l => l.status === 'Qualified').length
    const totalBudget = filteredLeads.reduce((sum, l) => sum + l.budget, 0)
    const avgBudget = total > 0 ? Math.round(totalBudget / total) : 0

    return [
      { label: 'Total Leads', value: total, trend: 'up', trendValue: '+15%' },
      { label: 'New Leads', value: newLeads, trend: 'up', trendValue: '+8%' },
      { label: 'Qualified', value: qualified, trend: 'up', trendValue: '+12%' },
      { label: 'Avg Budget', value: `$${avgBudget.toLocaleString()}`, trend: 'up', trendValue: '+6%' }
    ]
  }, [filteredLeads])

  // Data table columns
  const columns = [
    {
      key: 'leadId',
      label: 'Lead ID',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium text-primary">{value}</div>
      )
    },
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{`${row.firstName} ${row.lastName}`}</div>
          <div className="text-sm text-muted-foreground">{row.company}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm">{value}</div>
          <div className="text-sm text-muted-foreground">{row.phone}</div>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (value, row) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'productInterest',
      label: 'Product Interest',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => {
        const variants = {
          'New': 'secondary',
          'Contacted': 'default',
          'Qualified': 'default',
          'Proposal Sent': 'outline',
          'Negotiation': 'secondary',
          'Closed Won': 'default',
          'Closed Lost': 'destructive'
        }
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value, row) => {
        const variants = {
          'Low': 'outline',
          'Medium': 'default',
          'High': 'secondary',
          'Critical': 'destructive'
        }
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>
      }
    },
    {
      key: 'budget',
      label: 'Budget',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">${value.toLocaleString()}</div>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">{value}</div>
      )
    }
  ]

  // Handle actions
  const handleView = (lead) => {
    setSelectedLead(lead)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (lead) => {
    setEditingLead({ ...lead })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (lead) => {
    // Handle delete logic
    console.log('Delete lead:', lead)
  }

  const handleCreate = () => {
    setEditingLead({
      leadId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      source: 'Website',
      productInterest: 'Business Insurance',
      status: 'New',
      budget: 0,
      assignedTo: '',
      priority: 'Medium',
      followUps: 0,
      notes: 0,
      lastContact: '',
      nextFollowUp: ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleSave = () => {
    // Handle save logic
    console.log('Save lead:', editingLead)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingLead(null)
  }

  const canCreate = hasPermission('leads', 'create')
  const canEdit = hasPermission('leads', 'update')
  const canDelete = hasPermission('leads', 'delete')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            Track and manage potential clients through the sales pipeline
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Lead
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, index) => (
          <AdvancedCard
            key={index}
            title={metric.label}
            metrics={[metric]}
            className="h-full"
          />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="source">Lead Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {leadSources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {leadStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map(priority => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <DataTable
        data={filteredLeads}
        columns={columns}
        actions={[
          {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: handleView,
            variant: 'outline'
          },
          ...(canEdit ? [{
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: handleEdit,
            variant: 'outline'
          }] : []),
          ...(canDelete ? [{
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDelete,
            variant: 'destructive'
          }] : [])
        ]}
        bulkActions={[
          {
            label: 'Export Selected',
            icon: <Download className="h-4 w-4" />,
            onClick: (selected) => console.log('Export:', selected),
            variant: 'outline'
          },
          ...(canDelete ? [{
            label: 'Delete Selected',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (selected) => console.log('Delete:', selected),
            variant: 'destructive'
          }] : [])
        ]}
        onRowClick={handleView}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={setIsCreateDialogOpen || setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Create New Lead' : 'Edit Lead'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen ? 'Fill in the details to create a new lead' : 'Update the lead information'}
            </DialogDescription>
          </DialogHeader>
          <LeadForm
            lead={editingLead}
            onSave={handleSave}
            onCancel={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setEditingLead(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View comprehensive information about the lead
            </DialogDescription>
          </DialogHeader>
          {selectedLead && <LeadView lead={selectedLead} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Lead Form Component
function LeadForm({ lead, onSave, onCancel }) {
  const [formData, setFormData] = useState(lead || {})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter first name"
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter last name"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Enter phone number"
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <div>
          <Label htmlFor="source">Lead Source</Label>
          <Select value={formData.source || 'Website'} onValueChange={(value) => handleChange('source', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadSources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="productInterest">Product Interest</Label>
          <Select value={formData.productInterest || 'Business Insurance'} onValueChange={(value) => handleChange('productInterest', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {productInterests.map(product => (
                <SelectItem key={product} value={product}>{product}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'New'} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leadStatuses.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget || ''}
            onChange={(e) => handleChange('budget', parseFloat(e.target.value) || 0)}
            placeholder="Enter budget amount"
            required
          />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority || 'Medium'} onValueChange={(value) => handleChange('priority', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(priority => (
                <SelectItem key={priority} value={priority}>{priority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo || ''}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            placeholder="Enter assigned agent"
            required
          />
        </div>
        <div>
          <Label htmlFor="nextFollowUp">Next Follow-up</Label>
          <Input
            id="nextFollowUp"
            type="date"
            value={formData.nextFollowUp || ''}
            onChange={(e) => handleChange('nextFollowUp', e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {lead?.id ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  )
}

// Lead View Component
function LeadView({ lead }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lead ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lead.leadId}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              lead.status === 'New' ? 'secondary' :
              lead.status === 'Qualified' ? 'default' :
              lead.status === 'Closed Won' ? 'default' :
              lead.status === 'Closed Lost' ? 'destructive' : 'outline'
            }>
              {lead.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              lead.priority === 'Low' ? 'outline' :
              lead.priority === 'Medium' ? 'default' :
              lead.priority === 'High' ? 'secondary' : 'destructive'
            }>
              {lead.priority}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <div className="text-sm">{`${lead.firstName} ${lead.lastName}`}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <div className="text-sm">{lead.company}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="text-sm">{lead.email}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="text-sm">{lead.phone}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Lead Source</Label>
                  <div className="text-sm">{lead.source}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Product Interest</Label>
                  <div className="text-sm">{lead.productInterest}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                  <div className="text-sm font-medium">${lead.budget.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <div className="text-sm">{lead.assignedTo}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Last Contact</Label>
                  <div className="text-sm">{lead.lastContact}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Next Follow-up</Label>
                  <div className="text-sm">{lead.nextFollowUp}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followUps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups ({lead.followUps})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Follow-up management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes ({lead.notes})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Notes management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Activity timeline coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}