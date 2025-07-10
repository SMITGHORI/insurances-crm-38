import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Auth and Layout
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';

// Pages
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import QuotationsPage from './pages/QuotationsPage';
import InvoicesPage from './pages/InvoicesPage';
import CommunicationPage from './pages/CommunicationPage';
import PoliciesPage from './pages/PoliciesPage';
import CompliancePage from './pages/CompliancePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import ReportsPage from './pages/ReportsPage';
import OffersAndBroadcasts from './components/offers/OffersAndBroadcasts';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_clients">
                <Layout>
                  <ClientsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/quotations" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_quotations">
                <Layout>
                  <QuotationsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/invoices" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_invoices">
                <Layout>
                  <InvoicesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/communication" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_communications">
                <Layout>
                  <CommunicationPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/offers-broadcasts" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_broadcasts">
                <Layout>
                  <OffersAndBroadcasts />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/policies" element={
              <ProtectedRoute requiredRole={['admin', 'manager', 'agent']} requiredAction="view_policies">
                <Layout>
                  <PoliciesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/compliance" element={
              <ProtectedRoute requiredRole={['admin', 'manager']} requiredAction="view_compliance">
                <Layout>
                  <CompliancePage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute requiredRole={['admin', 'manager']} requiredAction="manage_settings">
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/help" element={
              <ProtectedRoute>
                <Layout>
                  <HelpPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute requiredRole={['admin', 'manager']} requiredAction="view_reports">
                <Layout>
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
