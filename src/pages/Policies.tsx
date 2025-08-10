import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTable } from '@/components/ui/data-table'
import { AdvancedCard } from '@/components/ui/advanced-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Shield, 
  FileText, 
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
  BarChart3,
  Activity,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

interface Policy {
  _id: string
  policyNumber: string
  policyType: 'life' | 'health' | 'motor' | 'property' | 'travel' | 'business'
  clientId: string
  clientName: string
  clientType: 'individual' | 'corporate' | 'group'
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'lapsed'
  startDate: string
  endDate: string
  premiumAmount: number
  sumInsured: number
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time'
  agentId: string
  agentName: string
  createdAt: string
  updatedAt: string
  
  // Policy specific details
  coverageDetails?: string
  exclusions?: string
  terms?: string
  documents?: string[]
  
  // Life Insurance specific
  nomineeName?: string
  nomineeRelation?: string
  nomineeContact?: string
  nomineeAddress?: string
  
  // Health Insurance specific
  familyMembers?: number
  preExistingConditions?: string[]
  waitingPeriod?: number
  
  // Motor Insurance specific
  vehicleNumber?: string
  vehicleType?: string
  engineNumber?: string
  chassisNumber?: string
  registrationYear?: number
  
  // Property Insurance specific
  propertyAddress?: string
  propertyType?: string
  constructionYear?: number
  occupancyType?: string
  
  // Business Insurance specific
  businessType?: string
  employeeCount?: number
  turnover?: number
  riskCategory?: string
}

const Policies: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data for demonstration
  useEffect(() => {
    const mockPolicies: Policy[] = [
      {
        _id: '1',
        policyNumber: 'POL001',
        policyType: 'life',
        clientId: 'CL001',
        clientName: 'John Doe',
        clientType: 'individual',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        premiumAmount: 15000,
        sumInsured: 1000000,
        premiumFrequency: 'yearly',
        agentId: 'AG001',
        agentName: 'Sarah Johnson',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        coverageDetails: 'Term life insurance with accidental death benefit',
        nomineeName: 'Jane Doe',
        nomineeRelation: 'Spouse',
        nomineeContact: '+91 98765 43210'
      },
      {
        _id: '2',
        policyNumber: 'POL002',
        policyType: 'health',
        clientId: 'CL002',
        clientName: 'TechCorp Solutions',
        clientType: 'corporate',
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2025-01-15',
        premiumAmount: 250000,
        sumInsured: 5000000,
        premiumFrequency: 'yearly',
        agentId: 'AG002',
        agentName: 'Mike Wilson',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        coverageDetails: 'Group health insurance for employees',
        familyMembers: 150,
        preExistingConditions: ['Diabetes', 'Hypertension'],
        waitingPeriod: 30
      },
      {
        _id: '3',
        policyNumber: 'POL003',
        policyType: 'motor',
        clientId: 'CL003',
        clientName: 'Rajesh Kumar',
        clientType: 'individual',
        status: 'active',
        startDate: '2024-02-01',
        endDate: '2025-02-01',
        premiumAmount: 8000,
        sumInsured: 500000,
        premiumFrequency: 'yearly',
        agentId: 'AG001',
        agentName: 'Sarah Johnson',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-01',
        coverageDetails: 'Comprehensive car insurance',
        vehicleNumber: 'MH01AB1234',
        vehicleType: 'Sedan',
        engineNumber: 'ENG123456',
        chassisNumber: 'CHS789012'
      }
    ]
    
    setPolicies(mockPolicies)
    setLoading(false)
  }, [])

  const filteredPolicies = policies.filter(policy => {
    if (filterType !== 'all' && policy.policyType !== filterType) return false
    if (filterStatus !== 'all' && policy.status !== filterStatus) return false
    return true
  })

  const columns = [
    {
      key: 'policyNumber',
      label: 'Policy Number',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'policyType',
      label: 'Type',
      sortable: true,
      render: (value: string) => {
        const variants = {
          life: 'default',
          health: 'secondary',
          motor: 'outline',
          property: 'destructive',
          travel: 'secondary',
          business: 'outline'
        } as const
        
        return (
          <Badge variant={variants[value as keyof typeof variants]} className="capitalize">
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'clientInfo',
      label: 'Client',
      render: (value: any, row: Policy) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {row.clientType === 'individual' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : row.clientType === 'corporate' ? (
              <Building2 className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">{row.clientName}</div>
            <div className="text-xs text-muted-foreground">
              {row.clientId} • {row.clientType}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const variants = {
          active: 'default',
          expired: 'secondary',
          cancelled: 'destructive',
          pending: 'outline',
          lapsed: 'secondary'
        } as const
        
        return (
          <Badge variant={variants[value as keyof typeof variants]}>
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'dates',
      label: 'Validity',
      render: (value: any, row: Policy) => (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-muted-foreground">From:</span> {new Date(row.startDate).toLocaleDateString()}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">To:</span> {new Date(row.endDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'financials',
      label: 'Premium & Coverage',
      sortable: true,
      render: (value: any, row: Policy) => (
        <div className="text-center">
          <div className="font-semibold text-green-600">
            ₹{row.premiumAmount.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">
            ₹{row.sumInsured.toLocaleString()} coverage
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {row.premiumFrequency}
          </div>
        </div>
      )
    },
    {
      key: 'agent',
      label: 'Agent',
      render: (value: any, row: Policy) => (
        <div className="text-sm">
          <div className="font-medium">{row.agentName}</div>
          <div className="text-xs text-muted-foreground">{row.agentId}</div>
        </div>
      )
    }
  ]

  const tableActions = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Policy) => {
        setSelectedPolicy(row)
        setIsViewDialogOpen(true)
      }
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Policy) => {
        setSelectedPolicy(row)
        setIsEditDialogOpen(true)
      },
      show: () => hasPermission('policies', 'update')
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Policy) => {
        if (confirm('Are you sure you want to delete this policy?')) {
          setPolicies(policies.filter(p => p._id !== row._id))
        }
      },
      show: () => hasPermission('policies', 'delete')
    }
  ]

  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows: Policy[]) => {
        console.log('Exporting:', selectedRows)
      }
    },
    {
      label: 'Renew Selected',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: (selectedRows: Policy[]) => {
        console.log('Renewing:', selectedRows)
      }
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (selectedRows: Policy[]) => {
        if (confirm(`Are you sure you want to delete ${selectedRows.length} policies?`)) {
          const ids = selectedRows.map(r => r._id)
          setPolicies(policies.filter(p => !ids.includes(p._id)))
        }
      },
      variant: 'destructive' as const
    }
  ]

  const stats = [
    {
      title: 'Total Policies',
      value: policies.length,
      icon: <Shield className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+18%',
      description: 'From last month'
    },
    {
      title: 'Active Policies',
      value: policies.filter(p => p.status === 'active').length,
      icon: <CheckCircle className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+12%',
      description: 'From last month'
    },
    {
      title: 'Total Premium',
      value: `₹${policies.reduce((sum, p) => sum + p.premiumAmount, 0).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+22%',
      description: 'From last month'
    },
    {
      title: 'Total Coverage',
      value: `₹${policies.reduce((sum, p) => sum + p.sumInsured, 0).toLocaleString()}`,
      icon: <BarChart3 className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+15%',
      description: 'From last month'
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
          <p className="text-muted-foreground">
            Manage insurance policies and coverage details
          </p>
        </div>
        {hasPermission('policies', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Policy
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <AdvancedCard
            key={index}
            title={stat.title}
            metrics={[
              {
                label: stat.description,
                value: stat.value,
                trend: stat.trend,
                trendValue: stat.trendValue
              }
            ]}
            className="bg-gradient-to-br from-background to-muted/50"
          >
            <div className="absolute top-4 left-4 text-primary/80">
              {stat.icon}
            </div>
          </AdvancedCard>
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
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label htmlFor="type-filter">Policy Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="life">Life</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Policy List</CardTitle>
          <CardDescription>
            View and manage all insurance policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredPolicies}
            columns={columns}
            actions={tableActions}
            bulkActions={bulkActions}
            searchable={true}
            filterable={true}
            sortable={true}
            pagination={true}
            pageSize={10}
            loading={loading}
            onRowClick={(row) => {
              setSelectedPolicy(row)
              setIsViewDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Create Policy Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Create a new insurance policy with coverage details
            </DialogDescription>
          </DialogHeader>
          
          <PolicyForm
            policy={null}
            onSubmit={(policyData) => {
              const newPolicy: Policy = {
                _id: Date.now().toString(),
                policyNumber: `POL${String(policies.length + 1).padStart(3, '0')}`,
                ...policyData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              setPolicies([...policies, newPolicy])
              setIsCreateDialogOpen(false)
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription>
              Update policy information and coverage details
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <PolicyForm
              policy={selectedPolicy}
              onSubmit={(policyData) => {
                setPolicies(policies.map(p => 
                  p._id === selectedPolicy._id 
                    ? { ...p, ...policyData, updatedAt: new Date().toISOString() }
                    : p
                ))
                setIsEditDialogOpen(false)
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Policy Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Policy Details</DialogTitle>
            <DialogDescription>
              View complete policy information and coverage
            </DialogDescription>
          </DialogHeader>
          
          {selectedPolicy && (
            <PolicyView policy={selectedPolicy} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Policy Form Component
interface PolicyFormProps {
  policy: Policy | null
  onSubmit: (data: Partial<Policy>) => void
  onCancel: () => void
}

const PolicyForm: React.FC<PolicyFormProps> = ({ policy, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Policy>>(
    policy || {
      policyType: 'life',
      status: 'pending',
      premiumFrequency: 'yearly'
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyType">Policy Type *</Label>
              <Select
                value={formData.policyType}
                onValueChange={(value) => setFormData({ ...formData, policyType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="life">Life Insurance</SelectItem>
                  <SelectItem value="health">Health Insurance</SelectItem>
                  <SelectItem value="motor">Motor Insurance</SelectItem>
                  <SelectItem value="property">Property Insurance</SelectItem>
                  <SelectItem value="travel">Travel Insurance</SelectItem>
                  <SelectItem value="business">Business Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              value={formData.clientId || ''}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="Enter client ID"
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coverageDetails">Coverage Details</Label>
            <Textarea
              id="coverageDetails"
              value={formData.coverageDetails || ''}
              onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
              placeholder="Describe what is covered under this policy"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exclusions">Exclusions</Label>
            <Textarea
              id="exclusions"
              value={formData.exclusions || ''}
              onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
              placeholder="List what is not covered under this policy"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms || ''}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Special terms and conditions"
              rows={3}
            />
          </div>

          {/* Policy-specific fields */}
          {formData.policyType === 'life' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomineeName">Nominee Name</Label>
                <Input
                  id="nomineeName"
                  value={formData.nomineeName || ''}
                  onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomineeRelation">Nominee Relation</Label>
                <Input
                  id="nomineeRelation"
                  value={formData.nomineeRelation || ''}
                  onChange={(e) => setFormData({ ...formData, nomineeRelation: e.target.value })}
                />
              </div>
            </div>
          )}

          {formData.policyType === 'motor' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber || ''}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType || ''}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="premiumAmount">Premium Amount *</Label>
              <Input
                id="premiumAmount"
                type="number"
                value={formData.premiumAmount || ''}
                onChange={(e) => setFormData({ ...formData, premiumAmount: Number(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sumInsured">Sum Insured *</Label>
              <Input
                id="sumInsured"
                type="number"
                value={formData.sumInsured || ''}
                onChange={(e) => setFormData({ ...formData, sumInsured: Number(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premiumFrequency">Premium Frequency *</Label>
            <Select
              value={formData.premiumFrequency}
              onValueChange={(value) => setFormData({ ...formData, premiumFrequency: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agentId">Agent ID</Label>
            <Input
              id="agentId"
              value={formData.agentId || ''}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
              placeholder="Enter agent ID"
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-2">
            <Label>Document Upload</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop policy documents here or click to browse
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {policy ? 'Update Policy' : 'Create Policy'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Policy View Component
interface PolicyViewProps {
  policy: Policy
}

const PolicyView: React.FC<PolicyViewProps> = ({ policy }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600'
      case 'expired': return 'text-red-600'
      case 'cancelled': return 'text-gray-600'
      case 'pending': return 'text-yellow-600'
      case 'lapsed': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'expired': return <XCircle className="h-5 w-5 text-red-600" />
      case 'cancelled': return <XCircle className="h-5 w-5 text-gray-600" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'lapsed': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Policy Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{policy.policyNumber}</CardTitle>
                  <CardDescription className="text-lg capitalize">
                    {policy.policyType} Insurance Policy
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(policy.status)}
                  <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                    {policy.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{policy.premiumAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Premium Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{policy.sumInsured.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Sum Insured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 capitalize">
                    {policy.premiumFrequency}
                  </div>
                  <div className="text-sm text-muted-foreground">Premium Frequency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policy Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                  <p className="font-medium">{policy.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client ID</Label>
                  <p className="font-mono text-sm">{policy.clientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Client Type</Label>
                  <Badge variant="outline" className="capitalize">{policy.clientType}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Policy Period
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="text-sm">{new Date(policy.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="text-sm">{new Date(policy.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-sm">
                    {Math.ceil((new Date(policy.endDate).getTime() - new Date(policy.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-medium">{policy.agentName}</div>
                  <div className="text-sm text-muted-foreground">{policy.agentId}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Details</CardTitle>
            </CardHeader>
            <CardContent>
              {policy.coverageDetails ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">What's Covered</Label>
                    <p className="text-sm mt-1">{policy.coverageDetails}</p>
                  </div>
                  {policy.exclusions && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Exclusions</Label>
                      <p className="text-sm mt-1">{policy.exclusions}</p>
                    </div>
                  )}
                  {policy.terms && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Terms & Conditions</Label>
                      <p className="text-sm mt-1">{policy.terms}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No coverage details available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Policies