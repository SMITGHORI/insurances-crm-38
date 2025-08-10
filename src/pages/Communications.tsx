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
import { Plus, Search, Filter, MoreHorizontal, MessageSquare, Mail, Phone, Send, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle, User, Building, FileText, Calendar, Download } from 'lucide-react'

// Mock data for communications
const mockCommunications = [
  {
    id: 'COM-001',
    communicationId: 'COM-2024-001',
    type: 'email',
    subject: 'Policy Renewal Reminder',
    content: 'Dear John Smith, Your vehicle insurance policy POL-001 is due for renewal on February 15, 2024. Please contact us to discuss your options.',
    senderId: 'AG-001',
    senderName: 'Sarah Johnson',
    senderType: 'agent',
    recipientId: 'CL-001',
    recipientName: 'John Smith',
    recipientType: 'client',
    status: 'sent',
    priority: 'medium',
    category: 'policy_renewal',
    tags: ['renewal', 'reminder', 'vehicle'],
    scheduledDate: '2024-01-15T10:00:00Z',
    sentDate: '2024-01-15T10:05:00Z',
    readDate: '2024-01-15T14:30:00Z',
    attachments: ['renewal_reminder.pdf'],
    followUpRequired: true,
    followUpDate: '2024-01-22T10:00:00Z',
    notes: 'Client responded positively to renewal offer',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: 'COM-002',
    communicationId: 'COM-2024-002',
    type: 'sms',
    subject: 'Claim Update',
    content: 'Your claim CLM-001 has been processed. Settlement amount: $2,500. Check your email for details.',
    senderId: 'AG-002',
    senderName: 'Mike Wilson',
    senderType: 'agent',
    recipientId: 'CL-002',
    recipientName: 'ABC Corporation',
    recipientType: 'client',
    status: 'delivered',
    priority: 'high',
    category: 'claim_update',
    tags: ['claim', 'settlement', 'urgent'],
    scheduledDate: '2024-01-16T09:00:00Z',
    sentDate: '2024-01-16T09:02:00Z',
    readDate: null,
    attachments: [],
    followUpRequired: false,
    followUpDate: null,
    notes: 'SMS delivered successfully',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T09:02:00Z'
  },
  {
    id: 'COM-003',
    communicationId: 'COM-2024-003',
    type: 'phone',
    subject: 'Quote Follow-up',
    content: 'Called client to discuss travel insurance quote. Client interested in premium package. Will send detailed proposal.',
    senderId: 'AG-003',
    senderName: 'Lisa Chen',
    senderType: 'agent',
    recipientId: 'CL-003',
    recipientName: 'Sarah Johnson',
    recipientType: 'client',
    status: 'completed',
    priority: 'medium',
    category: 'quote_followup',
    tags: ['quote', 'followup', 'travel'],
    scheduledDate: '2024-01-17T14:00:00Z',
    sentDate: '2024-01-17T14:15:00Z',
    readDate: null,
    attachments: [],
    followUpRequired: true,
    followUpDate: '2024-01-24T14:00:00Z',
    notes: 'Client very interested. Send proposal within 24 hours.',
    createdAt: '2024-01-17T13:00:00Z',
    updatedAt: '2024-01-17T14:15:00Z'
  },
  {
    id: 'COM-004',
    communicationId: 'COM-2024-004',
    type: 'email',
    subject: 'Welcome Package',
    content: 'Welcome to our insurance family! Here\'s your welcome package with policy details and contact information.',
    senderId: 'AG-001',
    senderName: 'Sarah Johnson',
    senderType: 'agent',
    recipientId: 'CL-004',
    recipientName: 'XYZ Manufacturing',
    recipientType: 'client',
    status: 'draft',
    priority: 'low',
    category: 'welcome',
    tags: ['welcome', 'new_client', 'package'],
    scheduledDate: '2024-01-18T11:00:00Z',
    sentDate: null,
    readDate: null,
    attachments: ['welcome_package.pdf', 'contact_info.pdf'],
    followUpRequired: false,
    followUpDate: null,
    notes: 'Ready to send to new corporate client',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z'
  },
  {
    id: 'COM-005',
    communicationId: 'COM-2024-005',
    type: 'sms',
    subject: 'Payment Reminder',
    content: 'Friendly reminder: Your premium payment of $880 is due on January 31. Please ensure timely payment to avoid policy lapse.',
    senderId: 'AG-002',
    senderName: 'Mike Wilson',
    senderType: 'agent',
    recipientId: 'CL-005',
    recipientName: 'Mike Wilson',
    recipientType: 'client',
    status: 'scheduled',
    priority: 'medium',
    category: 'payment_reminder',
    tags: ['payment', 'reminder', 'due_date'],
    scheduledDate: '2024-01-19T16:00:00Z',
    sentDate: null,
    readDate: null,
    attachments: [],
    followUpRequired: true,
    followUpDate: '2024-01-26T16:00:00Z',
    notes: 'Scheduled reminder for client with upcoming due date',
    createdAt: '2024-01-19T15:00:00Z',
    updatedAt: '2024-01-19T15:00:00Z'
  }
]

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'letter', label: 'Letter' },
  { value: 'in_app', label: 'In-App' }
]

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'read', label: 'Read' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' }
]

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'policy_renewal', label: 'Policy Renewal' },
  { value: 'claim_update', label: 'Claim Update' },
  { value: 'quote_followup', label: 'Quote Follow-up' },
  { value: 'welcome', label: 'Welcome' },
  { value: 'payment_reminder', label: 'Payment Reminder' },
  { value: 'general', label: 'General' }
]

const getTypeBadge = (type: string) => {
  const typeConfig = {
    email: { variant: 'default', icon: Mail },
    sms: { variant: 'secondary', icon: MessageSquare },
    phone: { variant: 'outline', icon: Phone },
    letter: { variant: 'secondary', icon: FileText },
    in_app: { variant: 'outline', icon: MessageSquare }
  }
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.email
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  )
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { variant: 'secondary', icon: Clock },
    scheduled: { variant: 'outline', icon: Clock },
    sent: { variant: 'default', icon: Send },
    delivered: { variant: 'default', icon: CheckCircle },
    read: { variant: 'default', icon: CheckCircle },
    completed: { variant: 'default', icon: CheckCircle },
    failed: { variant: 'destructive', icon: AlertCircle }
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

const getPriorityBadge = (priority: string) => {
  const priorityConfig = {
    low: { variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
    medium: { variant: 'default', className: 'bg-blue-100 text-blue-800' },
    high: { variant: 'default', className: 'bg-orange-100 text-orange-800' },
    urgent: { variant: 'destructive', className: 'bg-red-100 text-red-800' }
  }
  
  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low
  
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  )
}

const getSenderTypeBadge = (type: string) => {
  const typeConfig = {
    agent: { variant: 'default', icon: User },
    system: { variant: 'secondary', icon: Building },
    admin: { variant: 'outline', icon: User }
  }
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.agent
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant as any} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  )
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const CommunicationForm = ({ communication, onSubmit, onCancel }: { 
  communication?: any, 
  onSubmit: (data: any) => void, 
  onCancel: () => void 
}) => {
  const [formData, setFormData] = useState(communication || {
    type: 'email',
    subject: '',
    content: '',
    senderId: '',
    recipientId: '',
    priority: 'medium',
    category: 'general',
    tags: '',
    scheduledDate: '',
    followUpRequired: false,
    followUpDate: '',
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
          <label className="text-sm font-medium">Type</label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.slice(1).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.slice(1).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.slice(1).map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Scheduled Date</label>
          <Input
            type="datetime-local"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sender ID</label>
          <Input
            value={formData.senderId}
            onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
            placeholder="Enter sender ID"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient ID</label>
          <Input
            value={formData.recipientId}
            onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
            placeholder="Enter recipient ID"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Subject</label>
          <Input
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Enter communication subject"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter communication content"
            rows={4}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Enter tags (comma separated)"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Follow-up Required</label>
          <Select value={formData.followUpRequired.toString()} onValueChange={(value) => setFormData({ ...formData, followUpRequired: value === 'true' })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.followUpRequired && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-up Date</label>
            <Input
              type="datetime-local"
              value={formData.followUpDate}
              onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
            />
          </div>
        )}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Enter additional notes"
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {communication ? 'Update Communication' : 'Create Communication'}
        </Button>
      </div>
    </form>
  )
}

const CommunicationView = ({ communication, onClose }: { communication: any, onClose: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{communication.subject}</h3>
          <p className="text-sm text-muted-foreground">{communication.communicationId}</p>
        </div>
        <div className="text-right space-y-2">
          {getStatusBadge(communication.status)}
          {getPriorityBadge(communication.priority)}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Communication Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  {getTypeBadge(communication.type)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <Badge variant="outline">{communication.category.replace('_', ' ')}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tags:</span>
                  <div className="flex gap-1">
                    {communication.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Timing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled:</span>
                  <span className="text-sm font-medium">{formatDate(communication.scheduledDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sent:</span>
                  <span className="text-sm font-medium">{formatDate(communication.sentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Read:</span>
                  <span className="text-sm font-medium">{formatDate(communication.readDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sender Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sender ID:</span>
                  <span className="text-sm font-medium">{communication.senderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sender Name:</span>
                  <span className="text-sm font-medium">{communication.senderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sender Type:</span>
                  {getSenderTypeBadge(communication.senderType)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recipient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipient ID:</span>
                  <span className="text-sm font-medium">{communication.recipientId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipient Name:</span>
                  <span className="text-sm font-medium">{communication.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Recipient Type:</span>
                  <Badge variant="outline">{communication.recipientType}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Follow-up Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Follow-up Required:</span>
                <Badge variant={communication.followUpRequired ? 'default' : 'secondary'}>
                  {communication.followUpRequired ? 'Yes' : 'No'}
                </Badge>
              </div>
              {communication.followUpRequired && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Follow-up Date:</span>
                  <span className="text-sm font-medium">{formatDate(communication.followUpDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Notes:</span>
                <span className="text-sm font-medium">{communication.notes || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Communication Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Subject</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {communication.subject}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                    {communication.content}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Communication Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Communication Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(communication.createdAt)}</p>
                  </div>
                </div>
                {communication.scheduledDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Scheduled</p>
                      <p className="text-xs text-muted-foreground">{formatDate(communication.scheduledDate)}</p>
                    </div>
                  </div>
                )}
                {communication.sentDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sent</p>
                      <p className="text-xs text-muted-foreground">{formatDate(communication.sentDate)}</p>
                    </div>
                  </div>
                )}
                {communication.readDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Read</p>
                      <p className="text-xs text-muted-foreground">{formatDate(communication.readDate)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(communication.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              {communication.attachments && communication.attachments.length > 0 ? (
                <div className="space-y-2">
                  {communication.attachments.map((attachment: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No attachments</p>
              )}
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

export default function Communications() {
  const { hasPermission } = usePermissions()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedCommunication, setSelectedCommunication] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingCommunication, setEditingCommunication] = useState<any>(null)

  const filteredCommunications = useMemo(() => {
    return mockCommunications.filter(communication => {
      const matchesSearch = 
        communication.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        communication.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        communication.communicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        communication.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        communication.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = typeFilter === 'all' || communication.type === typeFilter
      const matchesStatus = statusFilter === 'all' || communication.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || communication.priority === priorityFilter
      const matchesCategory = categoryFilter === 'all' || communication.category === categoryFilter
      
      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesCategory
    })
  }, [searchTerm, typeFilter, statusFilter, priorityFilter, categoryFilter])

  const totalCommunications = useMemo(() => filteredCommunications.length, [filteredCommunications])
  const sentCommunications = useMemo(() => filteredCommunications.filter(c => c.status === 'sent').length, [filteredCommunications])
  const deliveredCommunications = useMemo(() => filteredCommunications.filter(c => c.status === 'delivered').length, [filteredCommunications])
  const readCommunications = useMemo(() => filteredCommunications.filter(c => c.status === 'read').length, [filteredCommunications])

  const handleCreateCommunication = (data: any) => {
    // Handle communication creation
    console.log('Creating communication:', data)
    setIsCreateDialogOpen(false)
  }

  const handleEditCommunication = (data: any) => {
    // Handle communication update
    console.log('Updating communication:', data)
    setIsEditDialogOpen(false)
    setEditingCommunication(null)
  }

  const handleDeleteCommunication = (communicationId: string) => {
    // Handle communication deletion
    console.log('Deleting communication:', communicationId)
  }

  const handleSendCommunication = (communicationId: string) => {
    // Handle sending communication
    console.log('Sending communication:', communicationId)
  }

  const columns = [
    {
      accessorKey: 'communicationId',
      header: 'ID',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.communicationId}</div>
      )
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.subject}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.content.substring(0, 50)}...
          </div>
        </div>
      )
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => getTypeBadge(row.original.type)
    },
    {
      accessorKey: 'senderName',
      header: 'From',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.senderName}</div>
          <div className="text-sm text-muted-foreground">{row.original.senderId}</div>
        </div>
      )
    },
    {
      accessorKey: 'recipientName',
      header: 'To',
      cell: ({ row }: any) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.recipientName}</div>
          <div className="text-sm text-muted-foreground">{row.original.recipientId}</div>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => getPriorityBadge(row.original.priority)
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Scheduled',
      cell: ({ row }: any) => (
        <div className="text-sm">{formatDate(row.original.scheduledDate)}</div>
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
              setSelectedCommunication(row.original)
              setIsViewDialogOpen(true)
            }}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {hasPermission('communications', 'update') && (
              <DropdownMenuItem onClick={() => {
                setEditingCommunication(row.original)
                setIsEditDialogOpen(true)
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {hasPermission('communications', 'delete') && (
              <DropdownMenuItem 
                onClick={() => handleDeleteCommunication(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSendCommunication(row.original.id)}>
              <Send className="mr-2 h-4 w-4" />
              Send Now
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
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Manage all client communications and messaging
          </p>
        </div>
        {hasPermission('communications', 'create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Communication</DialogTitle>
                <DialogDescription>
                  Create a new communication with clients or other parties
                </DialogDescription>
              </DialogHeader>
              <CommunicationForm
                onSubmit={handleCreateCommunication}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedCard
          title="Total Communications"
          subtitle={`${totalCommunications} messages`}
          description="All communications created"
          value={totalCommunications.toString()}
          trend="+15.2%"
          trendDirection="up"
          icon={MessageSquare}
          iconColor="text-blue-600"
        />
        <AdvancedCard
          title="Sent"
          subtitle={`${sentCommunications} messages`}
          description="Communications sent successfully"
          value={sentCommunications.toString()}
          trend="+8.7%"
          trendDirection="up"
          icon={Send}
          iconColor="text-green-600"
        />
        <AdvancedCard
          title="Delivered"
          subtitle={`${deliveredCommunications} messages`}
          description="Communications delivered to recipients"
          value={deliveredCommunications.toString()}
          trend="+12.1%"
          trendDirection="up"
          icon={CheckCircle}
          iconColor="text-blue-600"
        />
        <AdvancedCard
          title="Read"
          subtitle={`${readCommunications} messages`}
          description="Communications read by recipients"
          value={readCommunications.toString()}
          trend="+5.3%"
          trendDirection="up"
          icon={CheckCircle}
          iconColor="text-green-600"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter communications by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
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
          <CardTitle>Communications</CardTitle>
          <CardDescription>
            Manage and track all client communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCommunications}
            searchKey="communicationId"
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingCommunication && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Communication</DialogTitle>
              <DialogDescription>
                Update communication information
              </DialogDescription>
            </DialogHeader>
            <CommunicationForm
              communication={editingCommunication}
              onSubmit={handleEditCommunication}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingCommunication(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {selectedCommunication && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Communication Details</DialogTitle>
              <DialogDescription>
                View complete communication information
              </DialogDescription>
            </DialogHeader>
            <CommunicationView
              communication={selectedCommunication}
              onClose={() => {
                setIsViewDialogOpen(false)
                setSelectedCommunication(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}