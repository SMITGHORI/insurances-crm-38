import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, Download, RefreshCw, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Clock, DollarSign, Calendar, User, FileText, MessageSquare } from 'lucide-react'
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

// Mock data for Claims
const mockClaims = [
  {
    id: '1',
    claimNumber: 'CLM-2024-001',
    clientName: 'John Smith',
    policyNumber: 'POL-2024-001',
    claimType: 'Vehicle',
    status: 'Pending',
    priority: 'High',
    amount: 5000,
    incidentDate: '2024-01-15',
    assignedTo: 'Agent Johnson',
    description: 'Vehicle accident on highway',
    documents: 3,
    notes: 2,
    timeline: 4
  },
  {
    id: '2',
    claimNumber: 'CLM-2024-002',
    clientName: 'Sarah Wilson',
    policyNumber: 'POL-2024-002',
    claimType: 'Health',
    status: 'Approved',
    priority: 'Medium',
    amount: 2500,
    incidentDate: '2024-01-10',
    assignedTo: 'Agent Davis',
    description: 'Medical procedure coverage',
    documents: 5,
    notes: 3,
    timeline: 6
  },
  {
    id: '3',
    claimNumber: 'CLM-2024-003',
    clientName: 'Mike Brown',
    policyNumber: 'POL-2024-003',
    claimType: 'Property',
    status: 'Under Review',
    priority: 'Low',
    amount: 8000,
    incidentDate: '2024-01-08',
    assignedTo: 'Agent Johnson',
    description: 'Property damage from storm',
    documents: 4,
    notes: 1,
    timeline: 3
  },
  {
    id: '4',
    claimNumber: 'CLM-2024-004',
    clientName: 'Lisa Garcia',
    policyNumber: 'POL-2024-004',
    claimType: 'Life',
    status: 'Pending',
    priority: 'High',
    amount: 100000,
    incidentDate: '2024-01-12',
    assignedTo: 'Agent Davis',
    description: 'Life insurance claim',
    documents: 8,
    notes: 4,
    timeline: 7
  },
  {
    id: '5',
    claimNumber: 'CLM-2024-005',
    clientName: 'David Lee',
    policyNumber: 'POL-2024-005',
    claimType: 'Vehicle',
    status: 'Rejected',
    priority: 'Medium',
    amount: 3000,
    incidentDate: '2024-01-05',
    assignedTo: 'Agent Johnson',
    description: 'Vehicle theft claim',
    documents: 2,
    notes: 1,
    timeline: 2
  }
]

const claimTypes = ['Vehicle', 'Health', 'Property', 'Life', 'Travel', 'Business']
const claimStatuses = ['Pending', 'Under Review', 'Approved', 'Rejected', 'Closed']
const priorities = ['Low', 'Medium', 'High', 'Critical']

export default function Claims() {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const [selectedClaimType, setSelectedClaimType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [editingClaim, setEditingClaim] = useState(null)

  // Filter claims based on selected filters
  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const typeMatch = selectedClaimType === 'all' || claim.claimType === selectedClaimType
      const statusMatch = selectedStatus === 'all' || claim.status === selectedStatus
      const priorityMatch = selectedPriority === 'all' || claim.priority === selectedPriority
      return typeMatch && statusMatch && priorityMatch
    })
  }, [selectedClaimType, selectedStatus, selectedPriority])

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredClaims.length
    const pending = filteredClaims.filter(c => c.status === 'Pending').length
    const approved = filteredClaims.filter(c => c.status === 'Approved').length
    const totalAmount = filteredClaims.reduce((sum, c) => sum + c.amount, 0)
    const avgAmount = total > 0 ? Math.round(totalAmount / total) : 0

    return [
      { label: 'Total Claims', value: total, trend: 'up', trendValue: '+12%' },
      { label: 'Pending', value: pending, trend: 'neutral', trendValue: '0%' },
      { label: 'Approved', value: approved, trend: 'up', trendValue: '+8%' },
      { label: 'Avg Amount', value: `$${avgAmount.toLocaleString()}`, trend: 'up', trendValue: '+5%' }
    ]
  }, [filteredClaims])

  // Data table columns
  const columns = [
    {
      key: 'claimNumber',
      label: 'Claim Number',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium text-primary">{value}</div>
      )
    },
    {
      key: 'clientName',
      label: 'Client',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'policyNumber',
      label: 'Policy Number',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-muted-foreground">{value}</div>
      )
    },
    {
      key: 'claimType',
      label: 'Type',
      sortable: true,
      render: (value, row) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value, row) => {
        const variants = {
          'Pending': 'secondary',
          'Under Review': 'default',
          'Approved': 'default',
          'Rejected': 'destructive',
          'Closed': 'outline'
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
      key: 'amount',
      label: 'Amount',
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
  const handleView = (claim) => {
    setSelectedClaim(claim)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (claim) => {
    setEditingClaim({ ...claim })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (claim) => {
    // Handle delete logic
    console.log('Delete claim:', claim)
  }

  const handleCreate = () => {
    setEditingClaim({
      claimNumber: '',
      clientName: '',
      policyNumber: '',
      claimType: 'Vehicle',
      status: 'Pending',
      priority: 'Medium',
      amount: 0,
      incidentDate: '',
      assignedTo: '',
      description: ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleSave = () => {
    // Handle save logic
    console.log('Save claim:', editingClaim)
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingClaim(null)
  }

  const canCreate = hasPermission('claims', 'create')
  const canEdit = hasPermission('claims', 'update')
  const canDelete = hasPermission('claims', 'delete')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
          <p className="text-muted-foreground">
            Manage and track insurance claims across all policy types
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
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
              <Label htmlFor="claimType">Claim Type</Label>
              <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {claimTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                  {claimStatuses.map(status => (
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

      {/* Claims Table */}
      <DataTable
        data={filteredClaims}
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
              {isCreateDialogOpen ? 'Create New Claim' : 'Edit Claim'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen ? 'Fill in the details to create a new claim' : 'Update the claim information'}
            </DialogDescription>
          </DialogHeader>
          <ClaimForm
            claim={editingClaim}
            onSave={handleSave}
            onCancel={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              setEditingClaim(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              View comprehensive information about the claim
            </DialogDescription>
          </DialogHeader>
          {selectedClaim && <ClaimView claim={selectedClaim} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Claim Form Component
function ClaimForm({ claim, onSave, onCancel }) {
  const [formData, setFormData] = useState(claim || {})

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
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            value={formData.clientName || ''}
            onChange={(e) => handleChange('clientName', e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>
        <div>
          <Label htmlFor="policyNumber">Policy Number</Label>
          <Input
            id="policyNumber"
            value={formData.policyNumber || ''}
            onChange={(e) => handleChange('policyNumber', e.target.value)}
            placeholder="Enter policy number"
            required
          />
        </div>
        <div>
          <Label htmlFor="claimType">Claim Type</Label>
          <Select value={formData.claimType || 'Vehicle'} onValueChange={(value) => handleChange('claimType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {claimTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="Enter claim amount"
            required
          />
        </div>
        <div>
          <Label htmlFor="incidentDate">Incident Date</Label>
          <Input
            id="incidentDate"
            type="date"
            value={formData.incidentDate || ''}
            onChange={(e) => handleChange('incidentDate', e.target.value)}
            required
          />
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
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the claim details"
          rows={4}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {claim?.id ? 'Update Claim' : 'Create Claim'}
        </Button>
      </div>
    </form>
  )
}

// Claim View Component
function ClaimView({ claim }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Claim Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claim.claimNumber}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              claim.status === 'Pending' ? 'secondary' :
              claim.status === 'Approved' ? 'default' :
              claim.status === 'Rejected' ? 'destructive' : 'outline'
            }>
              {claim.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={
              claim.priority === 'Low' ? 'outline' :
              claim.priority === 'Medium' ? 'default' :
              claim.priority === 'High' ? 'secondary' : 'destructive'
            }>
              {claim.priority}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                  <div className="text-sm">{claim.clientName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Policy Number</Label>
                  <div className="text-sm">{claim.policyNumber}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Claim Type</Label>
                  <div className="text-sm">{claim.claimType}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <div className="text-sm font-medium">${claim.amount.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Incident Date</Label>
                  <div className="text-sm">{claim.incidentDate}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Assigned To</Label>
                  <div className="text-sm">{claim.assignedTo}</div>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="text-sm mt-1">{claim.description}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({claim.documents})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Document management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notes ({claim.notes})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Notes management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline ({claim.timeline})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Timeline management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}