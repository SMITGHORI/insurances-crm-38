
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageSkeleton } from '@/components/ui/professional-skeleton';
import { useCreateAgent } from '@/hooks/useAgents';
import { useIsMobile } from '@/hooks/use-mobile';

const AgentCreate = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const createAgentMutation = useCreateAgent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    region: '',
    licenseNumber: '',
    licenseExpiry: '',
    hireDate: '',
    status: 'onboarding',
    commissionRate: '',
    personalInfo: {
      dateOfBirth: '',
      gender: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'savings'
    }
  });

  const handleInputChange = (field, value, nested = null) => {
    if (nested) {
      setFormData(prev => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare data for submission
      const agentData = {
        ...formData,
        commissionRate: parseFloat(formData.commissionRate) || 0
      };

      await createAgentMutation.mutateAsync(agentData);
      navigate('/agents');
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  // Show professional loading skeleton
  if (createAgentMutation.isLoading) {
    return <PageSkeleton isMobile={isMobile} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/agents" className="mr-4 text-gray-600 hover:text-amba-blue">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Create New Agent</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Enter the agent's basic details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input 
                    id="dob" 
                    type="date" 
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value, 'personalInfo')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value, 'personalInfo')}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Enter the agent's address details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Address *</Label>
                  <Textarea 
                    id="street" 
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('street', e.target.value, 'address')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('city', e.target.value, 'address')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input 
                    id="state" 
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('state', e.target.value, 'address')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip/Postal Code *</Label>
                  <Input 
                    id="zipCode" 
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value, 'address')}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input 
                    id="country" 
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('country', e.target.value, 'address')}
                    required 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>Enter the agent's professional details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input 
                    id="licenseNumber" 
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date *</Label>
                  <Input 
                    id="licenseExpiry" 
                    type="date" 
                    value={formData.licenseExpiry}
                    onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger id="specialization">
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health Insurance</SelectItem>
                      <SelectItem value="term">Term Insurance</SelectItem>
                      <SelectItem value="vehicle">Vehicle Insurance</SelectItem>
                      <SelectItem value="property">Property Insurance</SelectItem>
                      <SelectItem value="general">General Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Input 
                    id="region" 
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Joining Date *</Label>
                  <Input 
                    id="hireDate" 
                    type="date" 
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input 
                    id="commissionRate" 
                    type="number" 
                    step="0.01"
                    min="0" 
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
              <CardDescription>Enter the agent's bank account details for commission payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input 
                    id="bankName" 
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value, 'bankDetails')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value, 'bankDetails')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input 
                    id="routingNumber" 
                    value={formData.bankDetails.routingNumber}
                    onChange={(e) => handleInputChange('routingNumber', e.target.value, 'bankDetails')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select onValueChange={(value) => handleInputChange('accountType', value, 'bankDetails')}>
                    <SelectTrigger id="accountType">
                      <SelectValue placeholder="Select Account Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/agents')}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-amba-blue hover:bg-blue-800"
              disabled={createAgentMutation.isLoading}
            >
              {createAgentMutation.isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AgentCreate;
