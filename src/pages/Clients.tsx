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
  Users, 
  UserPlus, 
  Building2, 
  Users2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

interface Client {
  _id: string
  clientId: string
  clientType: 'individual' | 'corporate' | 'group'
  name: string
  email: string
  phone: string
  altPhone?: string
  address: string
  city: string
  state: string
  pincode: string
  country: string
  status: 'active' | 'inactive' | 'prospective' | 'pending'
  source: string
  totalPolicies: number
  totalPremium: number
  createdAt: string
  updatedAt: string
  
  // Individual fields
  firstName?: string
  lastName?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  panNumber?: string
  aadharNumber?: string
  occupation?: string
  annualIncome?: number
  maritalStatus?: string
  nomineeName?: string
  nomineeRelation?: string
  nomineeContact?: string
  
  // Corporate fields
  companyName?: string
  registrationNo?: string
  gstNumber?: string
  industry?: string
  employeeCount?: number
  turnover?: number
  yearEstablished?: number
  website?: string
  contactPersonName?: string
  contactPersonDesignation?: string
  contactPersonEmail?: string
  contactPersonPhone?: string
  
  // Group fields
  groupName?: string
  groupType?: string
  memberCount?: number
  primaryContactName?: string
  relationshipWithGroup?: string
  registrationID?: string
  groupFormationDate?: string
  groupCategory?: string
  groupPurpose?: string
}

const Clients: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Mock data for demonstration
  useEffect(() => {
    const mockClients: Client[] = [
      {
        _id: '1',
        clientId: 'CL001',
        clientType: 'individual',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+91 98765 43210',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        status: 'active',
        source: 'referral',
        totalPolicies: 3,
        totalPremium: 45000,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        firstName: 'John',
        lastName: 'Doe',
        dob: '1985-06-15',
        gender: 'male',
        panNumber: 'ABCDE1234F',
        occupation: 'Software Engineer',
        annualIncome: 800000
      },
      {
        _id: '2',
        clientId: 'CL002',
        clientType: 'corporate',
        name: 'TechCorp Solutions',
        email: 'info@techcorp.com',
        phone: '+91 98765 43211',
        address: '456 Business Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        status: 'active',
        source: 'website',
        totalPolicies: 15,
        totalPremium: 250000,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10',
        companyName: 'TechCorp Solutions',
        registrationNo: 'CORP123456',
        gstNumber: 'GST123456789',
        industry: 'IT',
        employeeCount: 150,
        turnover: 50000000,
        yearEstablished: 2015,
        website: 'www.techcorp.com',
        contactPersonName: 'Sarah Johnson',
        contactPersonDesignation: 'HR Manager',
        contactPersonEmail: 'sarah@techcorp.com',
        contactPersonPhone: '+91 98765 43212'
      },
      {
        _id: '3',
        clientId: 'CL003',
        clientType: 'group',
        name: 'Family Health Group',
        email: 'admin@familyhealth.com',
        phone: '+91 98765 43213',
        address: '789 Community Center',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
        status: 'prospective',
        source: 'campaign',
        totalPolicies: 0,
        totalPremium: 0,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        groupName: 'Family Health Group',
        groupType: 'family',
        memberCount: 25,
        primaryContactName: 'Rajesh Kumar',
        relationshipWithGroup: 'Group Leader',
        groupCategory: 'health',
        groupPurpose: 'Family health insurance coverage'
      }
    ]
    
    setClients(mockClients)
    setLoading(false)
  }, [])

  const filteredClients = clients.filter(client => {
    if (filterType !== 'all' && client.clientType !== filterType) return false
    if (filterStatus !== 'all' && client.status !== filterStatus) return false
    return true
  })

  const columns = [
    {
      key: 'clientId',
      label: 'Client ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value: string, row: Client) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {row.clientType === 'individual' ? (
              <Users className="h-5 w-5 text-primary" />
            ) : row.clientType === 'corporate' ? (
              <Building2 className="h-5 w-5 text-primary" />
            ) : (
              <Users2 className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-muted-foreground capitalize">
              {row.clientType}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value: any, row: Client) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {row.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (value: any, row: Client) => (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          {row.city}, {row.state}
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
          inactive: 'secondary',
          prospective: 'outline',
          pending: 'destructive'
        } as const
        
        return (
          <Badge variant={variants[value as keyof typeof variants]}>
            {value}
          </Badge>
        )
      }
    },
    {
      key: 'policies',
      label: 'Policies & Premium',
      sortable: true,
      render: (value: any, row: Client) => (
        <div className="text-center">
          <div className="font-semibold">{row.totalPolicies}</div>
          <div className="text-xs text-muted-foreground">
            ₹{row.totalPremium.toLocaleString()}
          </div>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ]

  const tableActions = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: (row: Client) => {
        setSelectedClient(row)
        setIsViewDialogOpen(true)
      }
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: (row: Client) => {
        setSelectedClient(row)
        setIsEditDialogOpen(true)
      },
      show: () => hasPermission('clients', 'update')
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (row: Client) => {
        if (confirm('Are you sure you want to delete this client?')) {
          setClients(clients.filter(c => c._id !== row._id))
        }
      },
      show: () => hasPermission('clients', 'delete')
    }
  ]

  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <Download className="h-4 w-4" />,
      onClick: (selectedRows: Client[]) => {
        console.log('Exporting:', selectedRows)
      }
    },
    {
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (selectedRows: Client[]) => {
        if (confirm(`Are you sure you want to delete ${selectedRows.length} clients?`)) {
          const ids = selectedRows.map(r => r._id)
          setClients(clients.filter(c => !ids.includes(c._id)))
        }
      },
      variant: 'destructive' as const
    }
  ]

  const stats = [
    {
      title: 'Total Clients',
      value: clients.length,
      icon: <Users className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+12%',
      description: 'From last month'
    },
    {
      title: 'Active Clients',
      value: clients.filter(c => c.status === 'active').length,
      icon: <Shield className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+8%',
      description: 'From last month'
    },
    {
      title: 'Total Premium',
      value: `₹${clients.reduce((sum, c) => sum + c.totalPremium, 0).toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      trend: 'up' as const,
      trendValue: '+15%',
      description: 'From last month'
    },
    {
      title: 'Conversion Rate',
      value: `${((clients.filter(c => c.status === 'active').length / clients.length) * 100).toFixed(1)}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      trend: 'neutral' as const,
      trendValue: '0%',
      description: 'From last month'
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships and information
          </p>
        </div>
        {hasPermission('clients', 'create') && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
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
              <Label htmlFor="type-filter">Client Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospective">Prospective</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>
            View and manage all your clients in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredClients}
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
              setSelectedClient(row)
              setIsViewDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Create a new client record with all necessary information
            </DialogDescription>
          </DialogHeader>
          
          <ClientForm
            client={null}
            onSubmit={(clientData) => {
              const newClient: Client = {
                _id: Date.now().toString(),
                clientId: `CL${String(clients.length + 1).padStart(3, '0')}`,
                ...clientData,
                totalPolicies: 0,
                totalPremium: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              setClients([...clients, newClient])
              setIsCreateDialogOpen(false)
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <ClientForm
              client={selectedClient}
              onSubmit={(clientData) => {
                setClients(clients.map(c => 
                  c._id === selectedClient._id 
                    ? { ...c, ...clientData, updatedAt: new Date().toISOString() }
                    : c
                ))
                setIsEditDialogOpen(false)
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View complete client information
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <ClientView client={selectedClient} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Client Form Component
interface ClientFormProps {
  client: Client | null
  onSubmit: (data: Partial<Client>) => void
  onCancel: () => void
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>(
    client || {
      clientType: 'individual',
      status: 'prospective',
      source: 'direct',
      country: 'India'
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
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientType">Client Type *</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => setFormData({ ...formData, clientType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
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
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospective">Prospective</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.clientType === 'individual' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {formData.clientType === 'corporate' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
          )}

          {formData.clientType === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Input
                id="groupName"
                value={formData.groupName || ''}
                onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                required
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode || ''}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Additional fields based on client type */}
          {formData.clientType === 'individual' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input
                  id="panNumber"
                  value={formData.panNumber || ''}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                />
              </div>
            </>
          )}

          {formData.clientType === 'corporate' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNo">Registration No</Label>
                  <Input
                    id="registrationNo"
                    value={formData.registrationNo || ''}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber || ''}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-2">
            <Label>Document Upload</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Drag and drop documents here or click to browse
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
          {client ? 'Update Client' : 'Create Client'}
        </Button>
      </DialogFooter>
    </form>
  )
}

// Client View Component
interface ClientViewProps {
  client: Client
}

const ClientView: React.FC<ClientViewProps> = ({ client }) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Client ID</Label>
                    <p className="font-mono text-sm">{client.clientId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="capitalize">{client.clientType}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="font-medium">{client.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{client.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-sm">{client.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p className="text-sm">{client.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.city}, {client.state} {client.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{client.totalPolicies}</div>
                  <div className="text-sm text-muted-foreground">Total Policies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{client.totalPremium.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Date(client.createdAt).getFullYear()}
                  </div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No policies found for this client</p>
            <Button className="mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Policy
            </Button>
          </div>
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

export default Clients