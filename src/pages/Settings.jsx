
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Lock, Download, Upload } from 'lucide-react';
import { useSettings, useExportSettings, useImportSettings } from '@/hooks/useSettings';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PermissionEditor from '@/components/settings/PermissionEditor';
import { toast } from 'sonner';

const Settings = () => {
  const { settings, loading } = useSettings();
  const exportSettings = useExportSettings();
  const importSettings = useImportSettings();
  const [activeTab, setActiveTab] = useState('profile');

  const handleExport = () => {
    exportSettings.mutate();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const settingsData = JSON.parse(e.target.result);
            importSettings.mutate(settingsData);
          } catch (error) {
            toast.error('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <SettingsIcon className="h-8 w-8" />
                Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account preferences and application settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} disabled={exportSettings.isLoading}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleImport} disabled={importSettings.isLoading}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Security settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionEditor />
          </TabsContent>
        </Tabs>

        {/* Settings Overview */}
        {settings && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Settings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Profile</h3>
                  <p className="text-sm text-gray-600">
                    {settings.profile?.name ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {settings.notifications?.emailNotifications ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-medium">Security</h3>
                  <p className="text-sm text-gray-600">
                    {settings.security?.twoFactorAuth ? '2FA Enabled' : 'Basic'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Settings;
