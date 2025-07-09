
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionsProvider } from '@/contexts/PermissionsContext';
import MainLayout from '@/components/layout/MainLayout';
import RouteGuard from '@/components/RouteGuard';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetails from '@/pages/ClientDetails';
import ClientEdit from '@/pages/ClientEdit';
import Agents from '@/pages/Agents';
import AgentDetails from '@/pages/AgentDetails';
import AgentCreate from '@/pages/AgentCreate';
import Policies from '@/pages/Policies';
import PolicyDetails from '@/pages/PolicyDetails';
import PolicyCreate from '@/pages/PolicyCreate';
import PolicyEdit from '@/pages/PolicyEdit';
import Claims from '@/pages/Claims';
import ClaimDetails from '@/pages/ClaimDetails';
import ClaimCreate from '@/pages/ClaimCreate';
import ClaimEdit from '@/pages/ClaimEdit';
import Leads from '@/pages/Leads';
import LeadDetails from '@/pages/LeadDetails';
import LeadForm from '@/pages/LeadForm';
import Quotations from '@/pages/Quotations';
import QuotationsPage from '@/pages/QuotationsPage';
import QuotationDetails from '@/pages/QuotationDetails';
import QuotationForm from '@/pages/QuotationForm';
import QuotationEdit from '@/pages/QuotationEdit';
import QuotesDashboardPage from '@/pages/QuotesDashboardPage';
import Invoices from '@/pages/Invoices';
import InvoiceDetails from '@/pages/InvoiceDetails';
import InvoiceForm from '@/pages/InvoiceForm';
import InvoiceEdit from '@/pages/InvoiceEdit';
import Communication from '@/pages/Communication';
import Broadcast from '@/pages/Broadcast';
import RecentActivities from '@/pages/RecentActivities';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import DeveloperPermissions from '@/components/developer/DeveloperPermissions';

// Create a client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionsProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/developer" element={<DeveloperPermissions />} />
                
                {/* Protected routes */}
                <Route path="/" element={<RouteGuard><MainLayout /></RouteGuard>}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  
                  {/* Client routes */}
                  <Route path="clients" element={
                    <ProtectedRoute module="clients" action="view">
                      <Clients />
                    </ProtectedRoute>
                  } />
                  <Route path="clients/:id" element={
                    <ProtectedRoute module="clients" action="view">
                      <ClientDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="clients/:id/edit" element={
                    <ProtectedRoute module="clients" action="edit">
                      <ClientEdit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Agent routes */}
                  <Route path="agents" element={
                    <ProtectedRoute module="agents" action="view">
                      <Agents />
                    </ProtectedRoute>
                  } />
                  <Route path="agents/create" element={
                    <ProtectedRoute module="agents" action="create">
                      <AgentCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="agents/:id" element={
                    <ProtectedRoute module="agents" action="view">
                      <AgentDetails />
                    </ProtectedRoute>
                  } />
                  
                  {/* Policy routes */}
                  <Route path="policies" element={
                    <ProtectedRoute module="policies" action="view">
                      <Policies />
                    </ProtectedRoute>
                  } />
                  <Route path="policies/create" element={
                    <ProtectedRoute module="policies" action="create">
                      <PolicyCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="policies/:id" element={
                    <ProtectedRoute module="policies" action="view">
                      <PolicyDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="policies/:id/edit" element={
                    <ProtectedRoute module="policies" action="edit">
                      <PolicyEdit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Claim routes */}
                  <Route path="claims" element={
                    <ProtectedRoute module="claims" action="view">
                      <Claims />
                    </ProtectedRoute>
                  } />
                  <Route path="claims/create" element={
                    <ProtectedRoute module="claims" action="create">
                      <ClaimCreate />
                    </ProtectedRoute>
                  } />
                  <Route path="claims/:id" element={
                    <ProtectedRoute module="claims" action="view">
                      <ClaimDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="claims/:id/edit" element={
                    <ProtectedRoute module="claims" action="edit">
                      <ClaimEdit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Lead routes */}
                  <Route path="leads" element={
                    <ProtectedRoute module="leads" action="view">
                      <Leads />
                    </ProtectedRoute>
                  } />
                  <Route path="leads/create" element={
                    <ProtectedRoute module="leads" action="create">
                      <LeadForm />
                    </ProtectedRoute>
                  } />
                  <Route path="leads/:id" element={
                    <ProtectedRoute module="leads" action="view">
                      <LeadDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="leads/:id/edit" element={
                    <ProtectedRoute module="leads" action="edit">
                      <LeadForm />
                    </ProtectedRoute>
                  } />
                  
                  {/* Quotation routes */}
                  <Route path="quotations" element={
                    <ProtectedRoute module="quotations" action="view">
                      <Quotations />
                    </ProtectedRoute>
                  } />
                  <Route path="quotations/dashboard" element={
                    <ProtectedRoute module="quotations" action="view">
                      <QuotesDashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="quotations/create" element={
                    <ProtectedRoute module="quotations" action="create">
                      <QuotationForm />
                    </ProtectedRoute>
                  } />
                  <Route path="quotations/lead/:leadId" element={
                    <ProtectedRoute module="quotations" action="view">
                      <QuotationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="quotations/quote/:quotationId" element={
                    <ProtectedRoute module="quotations" action="view">
                      <QuotationsPage />
                    </ProtectedRoute>
                  } />
                  {/* Redirect old quotation detail route to new format */}
                  <Route path="quotations/:id" element={<Navigate to={`/quotations/quote/${window.location.pathname.split('/').pop()}`} replace />} />
                  <Route path="quotations/:id/edit" element={
                    <ProtectedRoute module="quotations" action="edit">
                      <QuotationEdit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Invoice routes */}
                  <Route path="invoices" element={
                    <ProtectedRoute module="invoices" action="view">
                      <Invoices />
                    </ProtectedRoute>
                  } />
                  <Route path="invoices/create" element={
                    <ProtectedRoute module="invoices" action="create">
                      <InvoiceForm />
                    </ProtectedRoute>
                  } />
                  <Route path="invoices/:id" element={
                    <ProtectedRoute module="invoices" action="view">
                      <InvoiceDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="invoices/:id/edit" element={
                    <ProtectedRoute module="invoices" action="edit">
                      <InvoiceEdit />
                    </ProtectedRoute>
                  } />
                  
                  {/* Communication routes */}
                  <Route path="communication" element={
                    <ProtectedRoute module="offers" action="view">
                      <Communication />
                    </ProtectedRoute>
                  } />
                  <Route path="broadcast" element={
                    <ProtectedRoute module="offers" action="create">
                      <Broadcast />
                    </ProtectedRoute>
                  } />
                  
                  {/* Other routes */}
                  <Route path="recent-activities" element={
                    <ProtectedRoute module="activities" action="view">
                      <RecentActivities />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </PermissionsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
