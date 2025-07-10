
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateClaim, usePoliciesForClaim, useClientsForClaim, usePolicyDetailsForClaim } from '../../hooks/useClaims';

const ClaimCreateForm = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    policyId: '',
    claimType: '',
    priority: 'Medium',
    claimAmount: '',
    deductible: '',
    incidentDate: '',
    description: '',
    assignedTo: '',
    estimatedSettlement: '',
    incidentLocation: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contactDetails: {
      primaryContact: '',
      phoneNumber: '',
      email: ''
    }
  });

  // Connect to MongoDB for form data
  const { data: policiesResponse = { data: [] }, isLoading: policiesLoading } = usePoliciesForClaim();
  const { data: clientsResponse = { data: [] }, isLoading: clientsLoading } = useClientsForClaim();
  
  // Connect to MongoDB for claim creation
  const createClaimMutation = useCreateClaim();

  // Get policy details when policy is selected
  const { data: policyDetails } = usePolicyDetailsForClaim(formData.policyId);

  const policies = policiesResponse.data || [];
  const clients = clientsResponse.data || [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-populate client when policy is selected
    if (name === 'policyId' && policies.length > 0) {
      const selectedPolicy = policies.find(p => p._id === value);
      if (selectedPolicy && selectedPolicy.clientId) {
        setFormData(prev => ({
          ...prev,
          clientId: selectedPolicy.clientId._id || selectedPolicy.clientId
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!formData.policyId) {
      toast.error("Please select a policy");
      return;
    }
    if (!formData.claimType) {
      toast.error("Please select claim type");
      return;
    }
    if (!formData.claimAmount) {
      toast.error("Please enter claim amount");
      return;
    }
    if (!formData.incidentDate) {
      toast.error("Please enter incident date");
      return;
    }
    if (!formData.description) {
      toast.error("Please enter claim description");
      return;
    }

    try {
      // Prepare claim data for MongoDB
      const claimData = {
        clientId: formData.clientId,
        policyId: formData.policyId,
        claimType: formData.claimType,
        priority: formData.priority,
        claimAmount: parseFloat(formData.claimAmount),
        deductible: formData.deductible ? parseFloat(formData.deductible) : 0,
        incidentDate: formData.incidentDate,
        description: formData.description,
        assignedTo: formData.assignedTo || null,
        estimatedSettlement: formData.estimatedSettlement || null,
        incidentLocation: formData.incidentLocation,
        contactDetails: formData.contactDetails
      };

      console.log('Creating claim in MongoDB:', claimData);
      
      // Create the claim in MongoDB
      const result = await createClaimMutation.mutateAsync(claimData);
      console.log('Claim created successfully in MongoDB:', result);
      
      toast.success('Claim created successfully!');
      
      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Error creating claim in MongoDB:', error);
      toast.error('Failed to create claim in database. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the basic claim details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select value={formData.clientId} onValueChange={(value) => handleSelectChange('clientId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policyId">Policy *</Label>
              <Select value={formData.policyId} onValueChange={(value) => handleSelectChange('policyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select policy" />
                </SelectTrigger>
                <SelectContent>
                  {policies
                    .filter(policy => !formData.clientId || policy.clientId._id === formData.clientId || policy.clientId === formData.clientId)
                    .map((policy) => (
                      <SelectItem key={policy._id} value={policy._id}>
                        {policy.policyNumber} - {policy.policyType}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimType">Claim Type *</Label>
              <Select value={formData.claimType} onValueChange={(value) => handleSelectChange('claimType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select claim type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Life">Life</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Disability">Disability</SelectItem>
                  <SelectItem value="Property">Property</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Workers Compensation">Workers Compensation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Date of Incident *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="incidentDate"
                  name="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={handleInputChange}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimAmount">Claim Amount *</Label>
              <Input
                id="claimAmount"
                name="claimAmount"
                type="number"
                value={formData.claimAmount}
                onChange={handleInputChange}
                placeholder="Enter claim amount"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductible">Deductible</Label>
              <Input
                id="deductible"
                name="deductible"
                type="number"
                value={formData.deductible}
                onChange={handleInputChange}
                placeholder="Enter deductible amount"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedSettlement">Estimated Settlement Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="estimatedSettlement"
                  name="estimatedSettlement"
                  type="date"
                  value={formData.estimatedSettlement}
                  onChange={handleInputChange}
                  className="pl-10"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Claim Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter detailed description of the incident"
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Incident Location</CardTitle>
          <CardDescription>Location where the incident occurred</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidentLocation.address">Address</Label>
              <Input
                id="incidentLocation.address"
                name="incidentLocation.address"
                value={formData.incidentLocation.address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentLocation.city">City</Label>
              <Input
                id="incidentLocation.city"
                name="incidentLocation.city"
                value={formData.incidentLocation.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentLocation.state">State</Label>
              <Input
                id="incidentLocation.state"
                name="incidentLocation.state"
                value={formData.incidentLocation.state}
                onChange={handleInputChange}
                placeholder="State"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidentLocation.zipCode">ZIP Code</Label>
              <Input
                id="incidentLocation.zipCode"
                name="incidentLocation.zipCode"
                value={formData.incidentLocation.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Primary contact information for this claim</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactDetails.primaryContact">Primary Contact</Label>
              <Input
                id="contactDetails.primaryContact"
                name="contactDetails.primaryContact"
                value={formData.contactDetails.primaryContact}
                onChange={handleInputChange}
                placeholder="Contact person name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactDetails.phoneNumber">Phone Number</Label>
              <Input
                id="contactDetails.phoneNumber"
                name="contactDetails.phoneNumber"
                value={formData.contactDetails.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone number"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactDetails.email">Email</Label>
              <Input
                id="contactDetails.email"
                name="contactDetails.email"
                type="email"
                value={formData.contactDetails.email}
                onChange={handleInputChange}
                placeholder="Email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createClaimMutation.isLoading}
        >
          <Save className="mr-2 h-4 w-4" />
          {createClaimMutation.isLoading ? 'Creating...' : 'Create Claim'}
        </Button>
      </div>
    </form>
  );
};

export default ClaimCreateForm;
