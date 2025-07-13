
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, Smartphone, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

const NotificationSettings = () => {
  const { settings, loading, updateNotifications } = useSettings();
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    activityNotifications: true,
    systemAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  });
  const [saving, setSaving] = useState(false);

  // Initialize notifications from settings
  useEffect(() => {
    if (settings?.notifications) {
      setNotifications(settings.notifications);
    }
  }, [settings]);

  const handleToggle = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateNotifications(notifications);
    } catch (error) {
      console.error('Error updating notifications:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Bell className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p>Loading notification settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notificationGroups = [
    {
      title: 'Communication Channels',
      icon: MessageSquare,
      settings: [
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          description: 'Receive notifications via email',
          icon: Mail
        },
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          description: 'Receive notifications via SMS',
          icon: MessageSquare
        },
        {
          key: 'pushNotifications',
          label: 'Push Notifications',
          description: 'Receive browser push notifications',
          icon: Smartphone
        }
      ]
    },
    {
      title: 'Content Preferences',
      icon: Bell,
      settings: [
        {
          key: 'marketingEmails',
          label: 'Marketing Emails',
          description: 'Receive promotional and marketing content'
        },
        {
          key: 'activityNotifications',
          label: 'Activity Notifications',
          description: 'Get notified about important activities'
        },
        {
          key: 'systemAlerts',
          label: 'System Alerts',
          description: 'Receive system maintenance and security alerts'
        }
      ]
    },
    {
      title: 'Reports',
      icon: Mail,
      settings: [
        {
          key: 'weeklyReports',
          label: 'Weekly Reports',
          description: 'Receive weekly summary reports'
        },
        {
          key: 'monthlyReports',
          label: 'Monthly Reports',
          description: 'Receive monthly performance reports'
        }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="flex items-center gap-2">
              <group.icon className="h-4 w-4" />
              <h3 className="font-medium">{group.title}</h3>
            </div>
            
            <div className="space-y-3 ml-6">
              {group.settings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {setting.icon && <setting.icon className="h-4 w-4 text-gray-500" />}
                      <span className="font-medium">{setting.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <Switch
                    checked={notifications[setting.key]}
                    onCheckedChange={(checked) => handleToggle(setting.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
