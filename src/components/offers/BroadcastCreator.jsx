
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Users, Mail, MessageSquare, Send, Eye, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateBroadcast, useEligibleClients } from '@/hooks/useBroadcast';

const BroadcastCreator = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    channels: [],
    subject: '',
    content: '',
    targetAudience: {
      allClients: true,
      specificClients: [],
      clientTypes: [],
      tierLevels: [],
      locations: []
    },
    scheduledAt: null
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [eligibleClients, setEligibleClients] = useState([]);
  const [showEligibleClients, setShowEligibleClients] = useState(false);

  const createBroadcastMutation = useCreateBroadcast();
  const eligibleClientsMutation = useEligibleClients();

  const broadcastTypes = [
    { value: 'offer', label: 'Special Offer' },
    { value: 'festival', label: 'Festival Greeting' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'promotion', label: 'Promotion' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'reminder', label: 'Reminder' }
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
  ];

  const clientTypes = ['individual', 'corporate', 'group'];
  const tierLevels = ['bronze', 'silver', 'gold', 'platinum'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTargetAudienceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }));
  };

  const handleChannelToggle = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const handleCheckEligibleClients = async () => {
    try {
      const result = await eligibleClientsMutation.mutateAsync({
        targetAudience: formData.targetAudience,
        channels: formData.channels
      });
      setEligibleClients(result.data || []);
      setShowEligibleClients(true);
    } catch (error) {
      toast.error('Failed to fetch eligible clients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || formData.channels.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.channels.includes('email') && !formData.subject) {
      toast.error('Email subject is required when email channel is selected');
      return;
    }

    try {
      await createBroadcastMutation.mutateAsync(formData);
      onSuccess?.();
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        channels: [],
        subject: '',
        content: '',
        targetAudience: {
          allClients: true,
          specificClients: [],
          clientTypes: [],
          tierLevels: [],
          locations: []
        },
        scheduledAt: null
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getPersonalizedPreview = () => {
    let preview = formData.content;
    preview = preview.replace(/{{name}}/g, 'John Doe');
    preview = preview.replace(/{{firstName}}/g, 'John');
    preview = preview.replace(/{{email}}/g, 'john@example.com');
    preview = preview.replace(/{{phone}}/g, '+91 9876543210');
    return preview;
  };

  if (previewMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Broadcast Preview</h3>
          <Button variant="outline" onClick={() => setPreviewMode(false)}>
            Back to Edit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline">{formData.type}</Badge>
              {formData.title}
            </CardTitle>
            <CardDescription>{formData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Channels:</Label>
              <div className="flex gap-2 mt-1">
                {formData.channels.map(channel => {
                  const channelData = channels.find(c => c.value === channel);
                  const Icon = channelData?.icon;
                  return (
                    <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                      {Icon && <Icon className="h-3 w-3" />}
                      {channelData?.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {formData.channels.includes('email') && formData.subject && (
              <div>
                <Label className="text-sm font-medium">Email Subject:</Label>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1">{formData.subject}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium">Content Preview:</Label>
              <div className="bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap">
                {getPersonalizedPreview()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={createBroadcastMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                {createBroadcastMutation.isPending ? 'Creating...' : 'Create Broadcast'}
              </Button>
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Create New Broadcast</h3>
        <Button type="button" variant="outline" onClick={() => setPreviewMode(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Target Audience</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter broadcast title"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select broadcast type" />
                </SelectTrigger>
                <SelectContent>
                  {broadcastTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the broadcast"
              rows={3}
            />
          </div>

          <div>
            <Label>Channels *</Label>
            <div className="flex gap-4 mt-2">
              {channels.map(channel => {
                const Icon = channel.icon;
                return (
                  <div key={channel.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel.value}
                      checked={formData.channels.includes(channel.value)}
                      onCheckedChange={() => handleChannelToggle(channel.value)}
                    />
                    <Label htmlFor={channel.value} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      {channel.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {formData.channels.includes('email') && (
            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter email subject line"
                required={formData.channels.includes('email')}
              />
            </div>
          )}

          <div>
            <Label htmlFor="content">Message Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Enter your message content. You can use {{name}}, {{firstName}}, {{email}}, {{phone}} for personalization"
              rows={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use placeholders: {{name}}, {{firstName}}, {{email}}, {{phone}} for personalization
            </p>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allClients"
              checked={formData.targetAudience.allClients}
              onCheckedChange={(checked) => handleTargetAudienceChange('allClients', checked)}
            />
            <Label htmlFor="allClients">Send to all clients</Label>
          </div>

          {!formData.targetAudience.allClients && (
            <div className="space-y-4 pl-6">
              <div>
                <Label>Client Types</Label>
                <div className="flex gap-4 mt-2">
                  {clientTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`clientType-${type}`}
                        checked={formData.targetAudience.clientTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...formData.targetAudience.clientTypes, type]
                            : formData.targetAudience.clientTypes.filter(t => t !== type);
                          handleTargetAudienceChange('clientTypes', newTypes);
                        }}
                      />
                      <Label htmlFor={`clientType-${type}`} className="capitalize">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tier Levels</Label>
                <div className="flex gap-4 mt-2">
                  {tierLevels.map(tier => (
                    <div key={tier} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tier-${tier}`}
                        checked={formData.targetAudience.tierLevels.includes(tier)}
                        onCheckedChange={(checked) => {
                          const newTiers = checked
                            ? [...formData.targetAudience.tierLevels, tier]
                            : formData.targetAudience.tierLevels.filter(t => t !== tier);
                          handleTargetAudienceChange('tierLevels', newTiers);
                        }}
                      />
                      <Label htmlFor={`tier-${tier}`} className="capitalize">
                        {tier}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCheckEligibleClients}
              disabled={eligibleClientsMutation.isPending}
            >
              <Target className="h-4 w-4 mr-2" />
              {eligibleClientsMutation.isPending ? 'Checking...' : 'Check Eligible Clients'}
            </Button>
            {showEligibleClients && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {eligibleClients.length} eligible clients
              </Badge>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div>
            <Label>Schedule Broadcast</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduledAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduledAt ? format(formData.scheduledAt, "PPP") : "Send immediately"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduledAt}
                  onSelect={(date) => handleInputChange('scheduledAt', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button type="submit" disabled={createBroadcastMutation.isPending}>
          <Send className="h-4 w-4 mr-2" />
          {createBroadcastMutation.isPending ? 'Creating...' : 'Create Broadcast'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setPreviewMode(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </div>
    </form>
  );
};

export default BroadcastCreator;
