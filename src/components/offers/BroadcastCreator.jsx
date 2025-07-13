
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Save, Users, Mail, MessageSquare } from 'lucide-react';
import { useCreateBroadcast, useEligibleClients } from '@/hooks/useOffersAndBroadcasts';
import { toast } from 'sonner';

const BroadcastCreator = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'announcement',
    channels: [],
    subject: '',
    content: '',
    targetAudience: {
      allClients: false,
      clientTypes: [],
      tierLevels: [],
      locations: []
    },
    scheduledAt: ''
  });

  const [eligibleCount, setEligibleCount] = useState(0);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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

  const clientTypes = [
    { value: 'individual', label: 'Individual' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'group', label: 'Group' }
  ];

  const tierLevels = [
    { value: 'bronze', label: 'Bronze' },
    { value: 'silver', label: 'Silver' },
    { value: 'gold', label: 'Gold' },
    { value: 'platinum', label: 'Platinum' }
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
  ];

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

  const handleArrayToggle = (field, value) => {
    const currentArray = formData.targetAudience[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleTargetAudienceChange(field, newArray);
  };

  const handlePreviewAudience = async () => {
    try {
      const response = await eligibleClientsMutation.mutateAsync(formData.targetAudience);
      setEligibleCount(response.data?.total || response.total || 0);
      toast.success(`Found ${response.data?.total || response.total || 0} eligible clients`);
    } catch (error) {
      toast.error('Failed to fetch eligible clients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a broadcast title');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Please enter broadcast content');
      return;
    }
    
    if (formData.channels.length === 0) {
      toast.error('Please select at least one communication channel');
      return;
    }

    if (formData.channels.includes('email') && !formData.subject.trim()) {
      toast.error('Email subject is required when email channel is selected');
      return;
    }

    try {
      await createBroadcastMutation.mutateAsync(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const isLoading = createBroadcastMutation.isPending || eligibleClientsMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Create New Broadcast
          </CardTitle>
          <CardDescription>
            Create and send targeted communications to your clients
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Broadcast Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter broadcast title"
                  maxLength={200}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Broadcast Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this broadcast"
                maxLength={1000}
                rows={2}
              />
            </div>

            {/* Communication Channels */}
            <div className="space-y-3">
              <Label>Communication Channels *</Label>
              <div className="flex flex-wrap gap-3">
                {channels.map(channel => {
                  const Icon = channel.icon;
                  const isSelected = formData.channels.includes(channel.value);
                  return (
                    <div
                      key={channel.value}
                      onClick={() => handleChannelToggle(channel.value)}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Checkbox checked={isSelected} readOnly />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{channel.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Email Subject (conditional) */}
            {formData.channels.includes('email') && (
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter email subject line"
                  maxLength={200}
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Broadcast Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your broadcast message here..."
                maxLength={5000}
                rows={6}
              />
              <p className="text-xs text-gray-500">
                Tip: Use {'{{name}}'} for personalization
              </p>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <Label>Target Audience</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allClients"
                    checked={formData.targetAudience.allClients}
                    onCheckedChange={(checked) => handleTargetAudienceChange('allClients', checked)}
                  />
                  <Label htmlFor="allClients">Send to all clients</Label>
                </div>

                {!formData.targetAudience.allClients && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Client Types</Label>
                      <div className="flex flex-wrap gap-2">
                        {clientTypes.map(type => (
                          <Badge
                            key={type.value}
                            variant={formData.targetAudience.clientTypes?.includes(type.value) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleArrayToggle('clientTypes', type.value)}
                          >
                            {type.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tier Levels</Label>
                      <div className="flex flex-wrap gap-2">
                        {tierLevels.map(tier => (
                          <Badge
                            key={tier.value}
                            variant={formData.targetAudience.tierLevels?.includes(tier.value) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleArrayToggle('tierLevels', tier.value)}
                          >
                            {tier.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handlePreviewAudience}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Users className="h-4 w-4 mr-2" />
                )}
                Preview Audience ({eligibleCount} clients)
              </Button>
            </div>

            {/* Scheduling */}
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule For (Optional)</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500">
                Leave empty to send immediately
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {formData.scheduledAt ? 'Schedule Broadcast' : 'Send Now'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="flex-1 sm:flex-none"
              >
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {isPreviewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Broadcast Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Title</h3>
                <p className="font-semibold">{formData.title || 'Untitled Broadcast'}</p>
              </div>
              
              {formData.subject && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Email Subject</h3>
                  <p>{formData.subject}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Content</h3>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="whitespace-pre-wrap">{formData.content || 'No content added yet'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500">Channels</h3>
                <div className="flex gap-2">
                  {formData.channels.map(channel => (
                    <Badge key={channel} variant="outline">
                      {channels.find(c => c.value === channel)?.label || channel}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BroadcastCreator;
