
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Briefcase, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';

const ProfileSettings = () => {
  const { settings, loading, updateProfile } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    bio: '',
    avatar: ''
  });
  const [saving, setSaving] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.profile) {
      setFormData({
        name: settings.profile.name || '',
        email: settings.profile.email || '',
        phone: settings.profile.phone || '',
        jobTitle: settings.profile.jobTitle || '',
        bio: settings.profile.bio || '',
        avatar: settings.profile.avatar || ''
      });
    }
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <User className="h-8 w-8 animate-pulse mx-auto mb-2" />
            <p>Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={formData.avatar} alt={formData.name} />
            <AvatarFallback className="text-lg">
              {formData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              Change Avatar
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              Upload a profile picture
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Full Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Phone className="h-4 w-4 inline mr-1" />
              Phone Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Briefcase className="h-4 w-4 inline mr-1" />
              Job Title
            </label>
            <Input
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Enter your job title"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Bio
          </label>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.bio.length}/500 characters
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
