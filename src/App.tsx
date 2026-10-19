import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RouteGuard } from '@/components/RouteGuard'
import Layout from '@/components/Layout'
import { Toaster } from '@/components/ui/toaster'

// Pages
import Index from '@/pages/Index'
import Register from '@/pages/Register'
import Login from '@/pages/Login'
import NewRequestWizard from '@/pages/NewRequest'
import RequestDetail from '@/pages/RequestDetail'
import ClientDashboard from '@/pages/ClientDashboard'
import ProviderDashboard from '@/pages/ProviderDashboard'
import AvailableRequests from '@/pages/AvailableRequests'
import PublicProviderProfile from '@/pages/PublicProviderProfile'
import ReviewPage from '@/pages/ReviewPage'
import AdminOverview from '@/pages/AdminOverview'
import AdminUsers from '@/pages/AdminUsers'
import AdminCategories from '@/pages/AdminCategories'
import AdminReports from '@/pages/AdminReports'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<Index />} />
            <Route path="cadastro" element={<Register />} />
            <Route path="entrar" element={<Login />} />
            <Route path="pedido/novo" element={<NewRequestWizard />} />
            <Route path="perfil/:providerProfileId" element={<PublicProviderProfile />} />
            <Route path="pedido/:id" element={<RequestDetail />} />

            {/* Client Protected Routes */}
            <Route
              path="painel/cliente"
              element={
                <RouteGuard allowedRoles={['cliente', 'admin']}>
                  <ClientDashboard />
                </RouteGuard>
              }
            />
            <Route
              path="avaliar/:requestId/:providerId"
              element={
                <RouteGuard allowedRoles={['cliente', 'admin']}>
                  <ReviewPage />
                </RouteGuard>
              }
            />

            {/* Provider Protected Routes */}
            <Route
              path="painel/profissional"
              element={
                <RouteGuard allowedRoles={['profissional', 'admin']}>
                  <ProviderDashboard />
                </RouteGuard>
              }
            />
            <Route
              path="pedidos-disponiveis"
              element={
                <RouteGuard allowedRoles={['profissional', 'admin']}>
                  <AvailableRequests />
                </RouteGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <AdminOverview />
                </RouteGuard>
              }
            />
            <Route
              path="admin/usuarios"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <AdminUsers />
                </RouteGuard>
              }
            />
            <Route
              path="admin/categorias"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <AdminCategories />
                </RouteGuard>
              }
            />
            <Route
              path="admin/relatorios"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <AdminReports />
                </RouteGuard>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
