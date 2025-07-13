
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Auth and Layout
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout.jsx';
import Auth from './pages/Auth';

// Pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetailsView from './pages/ClientDetailsView';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Communication from './pages/Communication';
import Policies from './pages/Policies';
import Settings from './pages/Settings';
import OffersAndBroadcasts from './components/offers/OffersAndBroadcasts';
import DeveloperPermissions from './components/developer/DeveloperPermissions';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <PermissionsProvider>
            <Toaster />
          
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="clients" element={
                <ProtectedRoute module="clients" action="view">
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="clients/:id" element={
                <ProtectedRoute module="clients" action="view">
                  <ClientDetailsView />
                </ProtectedRoute>
              } />
              
              <Route path="quotations" element={
                <ProtectedRoute module="quotations" action="view">
                  <Quotations />
                </ProtectedRoute>
              } />
              
              <Route path="invoices" element={
                <ProtectedRoute module="invoices" action="view">
                  <Invoices />
                </ProtectedRoute>
              } />
              
              <Route path="communication" element={
                <ProtectedRoute module="communication" action="view">
                  <Communication />
                </ProtectedRoute>
              } />
              
              <Route path="offers-broadcasts" element={
                <ProtectedRoute module="offers" action="view">
                  <OffersAndBroadcasts />
                </ProtectedRoute>
              } />
              
              <Route path="policies" element={
                <ProtectedRoute module="policies" action="view">
                  <Policies />
                </ProtectedRoute>
              } />
              
              <Route path="settings" element={
                <ProtectedRoute module="settings" action="manage">
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Developer Route - Outside protected layout */}
            <Route path="/developer" element={<DeveloperPermissions />} />
          </Routes>
          </PermissionsProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
