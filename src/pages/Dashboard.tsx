
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, Shield, Building } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { hasPermission, userRole, userBranch } = usePermissions();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <Building className="w-3 h-3 mr-1" />
                {userBranch}
              </Badge>
              <Badge variant="outline">
                <Shield className="w-3 h-3 mr-1" />
                {userRole}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Clients Module */}
          {hasPermission('clients', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Clients
                </CardTitle>
                <CardDescription>
                  Manage client information and records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('clients', 'create') && (
                    <Button variant="outline" className="w-full">
                      Add New Client
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Clients
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Policies Module */}
          {hasPermission('policies', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Policies
                </CardTitle>
                <CardDescription>
                  Manage insurance policies and coverage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('policies', 'create') && (
                    <Button variant="outline" className="w-full">
                      Create Policy
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Policies
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leads Module */}
          {hasPermission('leads', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Leads
                </CardTitle>
                <CardDescription>
                  Track and manage potential customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('leads', 'create') && (
                    <Button variant="outline" className="w-full">
                      Add New Lead
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Leads
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Claims Module */}
          {hasPermission('claims', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Claims
                </CardTitle>
                <CardDescription>
                  Process and manage insurance claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('claims', 'create') && (
                    <Button variant="outline" className="w-full">
                      File New Claim
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Claims
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotations Module */}
          {hasPermission('quotations', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Quotations
                </CardTitle>
                <CardDescription>
                  Generate and manage price quotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('quotations', 'create') && (
                    <Button variant="outline" className="w-full">
                      Create Quote
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Quotes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offers Module */}
          {hasPermission('offers', 'view') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Offers & Broadcasts
                </CardTitle>
                <CardDescription>
                  Manage promotional offers and communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {hasPermission('offers', 'create') && (
                    <Button variant="outline" className="w-full">
                      Create Offer
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full">
                    View All Offers
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* User Info Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Access Level</CardTitle>
              <CardDescription>
                Your current permissions and access rights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Role</h4>
                  <p className="text-lg font-semibold capitalize">{userRole}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Branch</h4>
                  <p className="text-lg font-semibold capitalize">{userBranch}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700">Permissions</h4>
                  <p className="text-lg font-semibold">
                    {user?.permissions?.length || 0} modules
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
