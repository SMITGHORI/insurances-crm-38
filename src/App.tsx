
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import RouteGuard from "@/components/RouteGuard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PermissionsProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <RouteGuard>
                  <Index />
                </RouteGuard>
              } />
              
              <Route path="/dashboard" element={
                <RouteGuard>
                  <Dashboard />
                </RouteGuard>
              } />
              
              {/* Add more protected routes as needed */}
              <Route path="/clients" element={
                <RouteGuard>
                  <ProtectedRoute module="clients" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Clients Module</h1>
                      <p>Client management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
              
              <Route path="/policies" element={
                <RouteGuard>
                  <ProtectedRoute module="policies" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Policies Module</h1>
                      <p>Policy management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
              
              <Route path="/leads" element={
                <RouteGuard>
                  <ProtectedRoute module="leads" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Leads Module</h1>
                      <p>Lead management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
              
              <Route path="/claims" element={
                <RouteGuard>
                  <ProtectedRoute module="claims" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Claims Module</h1>
                      <p>Claims management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
              
              <Route path="/quotations" element={
                <RouteGuard>
                  <ProtectedRoute module="quotations" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Quotations Module</h1>
                      <p>Quotation management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
              
              <Route path="/offers" element={
                <RouteGuard>
                  <ProtectedRoute module="offers" action="view">
                    <div className="p-8">
                      <h1 className="text-2xl font-bold">Offers & Broadcasts</h1>
                      <p>Offers and broadcast management functionality goes here</p>
                    </div>
                  </ProtectedRoute>
                </RouteGuard>
              } />
            </Routes>
          </BrowserRouter>
        </PermissionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
