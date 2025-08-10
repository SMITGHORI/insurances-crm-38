import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Trash2, Settings as SettingsIcon, User, Shield, Bell, Palette, Database, Globe, Key, Users, Building, CreditCard, FileText, Bell as NotificationIcon, Palette as ThemeIcon, Shield as SecurityIcon, Database as DatabaseIcon, Globe as LanguageIcon, Key as ApiIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { settingsApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('general');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  // Fetch settings
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    enabled: hasPermission('settings', 'view')
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }) => settingsApi.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Setting updated successfully');
      setIsEditDialogOpen(false);
      setEditingSetting(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update setting');
    }
  });

  // Reset settings mutation
  const resetSettingsMutation = useMutation({
    mutationFn: () => settingsApi.resetSettings(),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('Settings reset to defaults');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reset settings');
    }
  });

  const handleUpdateSetting = (key, value) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleEditSetting = (setting) => {
    setEditingSetting(setting);
    setIsEditDialogOpen(true);
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      resetSettingsMutation.mutate();
    }
  };

  if (!hasPermission('settings', 'view')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view the settings module.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {error.message || 'Failed to load settings'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
              <p className="text-sm text-gray-600">
                Manage system settings, user preferences, and configurations
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleResetSettings}>
                <SettingsIcon className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Settings
              </Button>
              
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <ThemeIcon className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <SecurityIcon className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <NotificationIcon className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <ApiIcon className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <DatabaseIcon className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company Information
                  </CardTitle>
                  <CardDescription>
                    Basic company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={settingsData?.company?.name || ''}
                      onChange={(e) => handleUpdateSetting('company.name', e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyEmail">Company Email</Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      value={settingsData?.company?.email || ''}
                      onChange={(e) => handleUpdateSetting('company.email', e.target.value)}
                      placeholder="Enter company email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone">Company Phone</Label>
                    <Input
                      id="companyPhone"
                      value={settingsData?.company?.phone || ''}
                      onChange={(e) => handleUpdateSetting('company.phone', e.target.value)}
                      placeholder="Enter company phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Company Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={settingsData?.company?.address || ''}
                      onChange={(e) => handleUpdateSetting('company.address', e.target.value)}
                      placeholder="Enter company address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Core system configuration and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={settingsData?.system?.timezone || 'UTC'} 
                      onValueChange={(value) => handleUpdateSetting('system.timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select 
                      value={settingsData?.system?.dateFormat || 'DD/MM/YYYY'} 
                      onValueChange={(value) => handleUpdateSetting('system.dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select 
                      value={settingsData?.system?.currency || 'INR'} 
                      onValueChange={(value) => handleUpdateSetting('system.currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Select 
                      value={settingsData?.system?.language || 'en'} 
                      onValueChange={(value) => handleUpdateSetting('system.language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme & Colors
                  </CardTitle>
                  <CardDescription>
                    Customize the visual appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme Mode</Label>
                    <Select 
                      value={settingsData?.appearance?.theme || 'system'} 
                      onValueChange={(value) => handleUpdateSetting('appearance.theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Select 
                      value={settingsData?.appearance?.primaryColor || 'blue'} 
                      onValueChange={(value) => handleUpdateSetting('appearance.primaryColor', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select 
                      value={settingsData?.appearance?.fontSize || 'medium'} 
                      onValueChange={(value) => handleUpdateSetting('appearance.fontSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compactMode">Compact Mode</Label>
                    <Switch
                      id="compactMode"
                      checked={settingsData?.appearance?.compactMode || false}
                      onCheckedChange={(checked) => handleUpdateSetting('appearance.compactMode', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Layout & Navigation
                  </CardTitle>
                  <CardDescription>
                    Configure layout preferences and navigation behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebarCollapsed">Collapsed Sidebar</Label>
                    <Switch
                      id="sidebarCollapsed"
                      checked={settingsData?.appearance?.sidebarCollapsed || false}
                      onCheckedChange={(checked) => handleUpdateSetting('appearance.sidebarCollapsed', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showBreadcrumbs">Show Breadcrumbs</Label>
                    <Switch
                      id="showBreadcrumbs"
                      checked={settingsData?.appearance?.showBreadcrumbs || true}
                      onCheckedChange={(checked) => handleUpdateSetting('appearance.showBreadcrumbs', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPageTitle">Show Page Titles</Label>
                    <Switch
                      id="showPageTitle"
                      checked={settingsData?.appearance?.showPageTitle || true}
                      onCheckedChange={(checked) => handleUpdateSetting('appearance.showPageTitle', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultPageSize">Default Page Size</Label>
                    <Select 
                      value={settingsData?.appearance?.defaultPageSize || '25'} 
                      onValueChange={(value) => handleUpdateSetting('appearance.defaultPageSize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 items</SelectItem>
                        <SelectItem value="25">25 items</SelectItem>
                        <SelectItem value="50">50 items</SelectItem>
                        <SelectItem value="100">100 items</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Authentication Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Authentication & Security
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settingsData?.security?.sessionTimeout || 30}
                      onChange={(e) => handleUpdateSetting('security.sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settingsData?.security?.maxLoginAttempts || 5}
                      onChange={(e) => handleUpdateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={settingsData?.security?.lockoutDuration || 15}
                      onChange={(e) => handleUpdateSetting('security.lockoutDuration', parseInt(e.target.value))}
                      min="5"
                      max="60"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requireMFA">Require Multi-Factor Authentication</Label>
                    <Switch
                      id="requireMFA"
                      checked={settingsData?.security?.requireMFA || false}
                      onCheckedChange={(checked) => handleUpdateSetting('security.requireMFA', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="passwordComplexity">Enforce Password Complexity</Label>
                    <Switch
                      id="passwordComplexity"
                      checked={settingsData?.security?.passwordComplexity || true}
                      onCheckedChange={(checked) => handleUpdateSetting('security.passwordComplexity', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Protection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Data Protection & Privacy
                  </CardTitle>
                  <CardDescription>
                    Configure data retention and privacy settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                    <Input
                      id="dataRetentionDays"
                      type="number"
                      value={settingsData?.security?.dataRetentionDays || 2555}
                      onChange={(e) => handleUpdateSetting('security.dataRetentionDays', parseInt(e.target.value))}
                      min="30"
                      max="10950"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditLogging">Enable Audit Logging</Label>
                    <Switch
                      id="auditLogging"
                      checked={settingsData?.security?.auditLogging || true}
                      onCheckedChange={(checked) => handleUpdateSetting('security.auditLogging', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dataEncryption">Enable Data Encryption</Label>
                    <Switch
                      id="dataEncryption"
                      checked={settingsData?.security?.dataEncryption || true}
                      onCheckedChange={(checked) => handleUpdateSetting('security.dataEncryption', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="backupEncryption">Encrypt Backups</Label>
                    <Switch
                      id="backupEncryption"
                      checked={settingsData?.security?.backupEncryption || true}
                      onCheckedChange={(checked) => handleUpdateSetting('security.backupEncryption', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure email notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                    <Switch
                      id="emailNotifications"
                      checked={settingsData?.notifications?.email?.enabled || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.email.enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newClientEmail">New Client Notifications</Label>
                    <Switch
                      id="newClientEmail"
                      checked={settingsData?.notifications?.email?.newClient || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.email.newClient', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="newPolicyEmail">New Policy Notifications</Label>
                    <Switch
                      id="newPolicyEmail"
                      checked={settingsData?.notifications?.email?.newPolicy || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.email.newPolicy', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="claimUpdateEmail">Claim Update Notifications</Label>
                    <Switch
                      id="claimUpdateEmail"
                      checked={settingsData?.notifications?.email?.claimUpdate || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.email.claimUpdate', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="systemAlertEmail">System Alert Notifications</Label>
                    <Switch
                      id="systemAlertEmail"
                      checked={settingsData?.notifications?.email?.systemAlert || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.email.systemAlert', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* In-App Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    In-App Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure in-app notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inAppNotifications">Enable In-App Notifications</Label>
                    <Switch
                      id="inAppNotifications"
                      checked={settingsData?.notifications?.inApp?.enabled || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.inApp.enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="soundNotifications">Sound Notifications</Label>
                    <Switch
                      id="soundNotifications"
                      checked={settingsData?.notifications?.inApp?.sound || true}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.inApp.sound', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="desktopNotifications">Desktop Notifications</Label>
                    <Switch
                      id="desktopNotifications"
                      checked={settingsData?.notifications?.inApp?.desktop || false}
                      onCheckedChange={(checked) => handleUpdateSetting('notifications.inApp.desktop', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notificationPosition">Notification Position</Label>
                    <Select 
                      value={settingsData?.notifications?.inApp?.position || 'top-right'} 
                      onValueChange={(value) => handleUpdateSetting('notifications.inApp.position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure API keys and external integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settingsData?.integrations?.api?.key || ''}
                      onChange={(e) => handleUpdateSetting('integrations.api.key', e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={settingsData?.integrations?.api?.secret || ''}
                      onChange={(e) => handleUpdateSetting('integrations.api.secret', e.target.value)}
                      placeholder="Enter API secret"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">API Endpoint</Label>
                    <Input
                      id="apiEndpoint"
                      value={settingsData?.integrations?.api?.endpoint || ''}
                      onChange={(e) => handleUpdateSetting('integrations.api.endpoint', e.target.value)}
                      placeholder="Enter API endpoint"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiEnabled">Enable API Access</Label>
                    <Switch
                      id="apiEnabled"
                      checked={settingsData?.integrations?.api?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('integrations.api.enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Third-party Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Third-party Integrations
                  </CardTitle>
                  <CardDescription>
                    Configure external service integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="googleAnalytics">Google Analytics</Label>
                    <Switch
                      id="googleAnalytics"
                      checked={settingsData?.integrations?.googleAnalytics?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('integrations.googleAnalytics.enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stripe">Stripe Payment</Label>
                    <Switch
                      id="stripe"
                      checked={settingsData?.integrations?.stripe?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('integrations.stripe.enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twilio">Twilio SMS</Label>
                    <Switch
                      id="twilio"
                      checked={settingsData?.integrations?.twilio?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('integrations.twilio.enabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sendgrid">SendGrid Email</Label>
                    <Switch
                      id="sendgrid"
                      checked={settingsData?.integrations?.sendgrid?.enabled || false}
                      onCheckedChange={(checked) => handleUpdateSetting('integrations.sendgrid.enabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Configuration
                  </CardTitle>
                  <CardDescription>
                    Advanced database and performance settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbConnectionPool">Connection Pool Size</Label>
                    <Input
                      id="dbConnectionPool"
                      type="number"
                      value={settingsData?.advanced?.database?.connectionPool || 10}
                      onChange={(e) => handleUpdateSetting('advanced.database.connectionPool', parseInt(e.target.value))}
                      min="5"
                      max="50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dbTimeout">Query Timeout (seconds)</Label>
                    <Input
                      id="dbTimeout"
                      type="number"
                      value={settingsData?.advanced?.database?.timeout || 30}
                      onChange={(e) => handleUpdateSetting('advanced.database.timeout', parseInt(e.target.value))}
                      min="10"
                      max="300"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dbLogging">Enable Query Logging</Label>
                    <Switch
                      id="dbLogging"
                      checked={settingsData?.advanced?.database?.logging || false}
                      onCheckedChange={(checked) => handleUpdateSetting('advanced.database.logging', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dbBackup">Auto Database Backup</Label>
                    <Switch
                      id="dbBackup"
                      checked={settingsData?.advanced?.database?.autoBackup || true}
                      onCheckedChange={(checked) => handleUpdateSetting('advanced.database.autoBackup', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5" />
                    Performance & Caching
                  </CardTitle>
                  <CardDescription>
                    Configure performance optimization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableCaching">Enable Caching</Label>
                    <Switch
                      id="enableCaching"
                      checked={settingsData?.advanced?.performance?.caching || true}
                      onCheckedChange={(checked) => handleUpdateSetting('advanced.performance.caching', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cacheTTL">Cache TTL (minutes)</Label>
                    <Input
                      id="cacheTTL"
                      type="number"
                      value={settingsData?.advanced?.performance?.cacheTTL || 60}
                      onChange={(e) => handleUpdateSetting('advanced.performance.cacheTTL', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Enable Compression</Label>
                    <Switch
                      id="compression"
                      checked={settingsData?.advanced?.performance?.compression || true}
                      onCheckedChange={(checked) => handleUpdateSetting('advanced.performance.compression', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rateLimiting">Enable Rate Limiting</Label>
                    <Switch
                      id="rateLimiting"
                      checked={settingsData?.advanced?.performance?.rateLimiting || true}
                      onCheckedChange={(checked) => handleUpdateSetting('advanced.performance.rateLimiting', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Setting Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Modify the selected setting value
            </DialogDescription>
          </DialogHeader>
          {editingSetting && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="settingKey">Setting Key</Label>
                <Input
                  id="settingKey"
                  value={editingSetting.key}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settingValue">Setting Value</Label>
                <Input
                  id="settingValue"
                  value={editingSetting.value}
                  onChange={(e) => setEditingSetting(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="settingDescription">Description</Label>
                <Textarea
                  id="settingDescription"
                  value={editingSetting.description || ''}
                  disabled
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleUpdateSetting(editingSetting.key, editingSetting.value);
                }}>
                  Update Setting
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;