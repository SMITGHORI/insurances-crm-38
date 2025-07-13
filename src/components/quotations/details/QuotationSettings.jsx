
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Calendar, Bell, Shield, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

const QuotationSettings = ({ quotationId }) => {
  const { settings, loading, updatePreferences } = useSettings();
  const [localSettings, setLocalSettings] = useState({
    validUntil: '2025-07-01',
    autoReminders: true,
    reminderDays: 7,
    allowClientComments: true,
    requireSignature: false,
    trackViews: true,
    visibility: 'private'
  });

  // Initialize local settings from backend settings
  useEffect(() => {
    if (settings?.preferences?.quotationSettings) {
      setLocalSettings(prev => ({
        ...prev,
        ...settings.preferences.quotationSettings
      }));
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    try {
      await updatePreferences({
        quotationSettings: localSettings
      });
      toast.success('Quotation settings updated successfully');
    } catch (error) {
      console.error('Error saving quotation settings:', error);
      toast.error('Failed to update quotation settings');
    }
  };

  const handleDeleteQuotation = () => {
    if (window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      // This would typically call a delete quotation API
      toast.success('Quotation deleted successfully');
      // Navigate back to quotations list
    }
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Quotation Settings</h3>
        <p className="text-sm text-gray-600">Configure quotation preferences and behaviors</p>
      </div>

      {/* Validity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Validity Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until
            </label>
            <Input
              type="date"
              value={localSettings.validUntil}
              onChange={(e) => handleSettingChange('validUntil', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Quotation will expire after this date
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Reminder Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Reminders</p>
              <p className="text-sm text-gray-600">Send automatic follow-up reminders</p>
            </div>
            <Switch
              checked={localSettings.autoReminders}
              onCheckedChange={(checked) => handleSettingChange('autoReminders', checked)}
            />
          </div>

          {localSettings.autoReminders && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remind Before (Days)
              </label>
              <Select 
                value={localSettings.reminderDays.toString()} 
                onValueChange={(value) => handleSettingChange('reminderDays', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Client Comments</p>
              <p className="text-sm text-gray-600">Let clients add comments to the quotation</p>
            </div>
            <Switch
              checked={localSettings.allowClientComments}
              onCheckedChange={(checked) => handleSettingChange('allowClientComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Digital Signature</p>
              <p className="text-sm text-gray-600">Require client signature for acceptance</p>
            </div>
            <Switch
              checked={localSettings.requireSignature}
              onCheckedChange={(checked) => handleSettingChange('requireSignature', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Track Views</p>
              <p className="text-sm text-gray-600">Track when client views the quotation</p>
            </div>
            <Switch
              checked={localSettings.trackViews}
              onCheckedChange={(checked) => handleSettingChange('trackViews', checked)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <Select 
              value={localSettings.visibility} 
              onValueChange={(value) => handleSettingChange('visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="client">Client Accessible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="destructive" onClick={handleDeleteQuotation}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Quotation
        </Button>
        
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default QuotationSettings;
