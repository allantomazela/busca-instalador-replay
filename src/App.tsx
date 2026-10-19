import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { RouteGuard } from '@/components/RouteGuard'
import Layout from '@/components/Layout'
import { Toaster } from '@/components/ui/toaster'

// Páginas do Sistema Fechado B2B
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import ProfessionalDetail from '@/pages/ProfessionalDetail'
import InternalList from '@/pages/InternalList'
import AdminPage from '@/pages/AdminPage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Tela de Autenticação Única Corporativa */}
            <Route path="entrar" element={<Login />} />

            {/* Rotas Protegidas — Requerem autenticação de funcionário/admin */}
            <Route
              index
              element={
                <RouteGuard>
                  <Index />
                </RouteGuard>
              }
            />

            {/* Detalhe do Profissional */}
            <Route
              path="profissional/:id"
              element={
                <RouteGuard>
                  <ProfessionalDetail />
                </RouteGuard>
              }
            />

            {/* Minha Lista / Follow-up Interno */}
            <Route
              path="lista"
              element={
                <RouteGuard>
                  <InternalList />
                </RouteGuard>
              }
            />
            {/* Alias /meus-contatos redireciona ou usa a mesma lista */}
            <Route
              path="meus-contatos"
              element={
                <RouteGuard>
                  <InternalList />
                </RouteGuard>
              }
            />

            {/* Administração — Acesso restrito ao Dono / Admin */}
            <Route
              path="admin"
              element={
                <RouteGuard allowedRoles={['admin']}>
                  <AdminPage />
                </RouteGuard>
              }
            />

            {/* Redirecionamento de rotas antigas de marketplace que morreram */}
            <Route path="cadastro" element={<Navigate to="/entrar" replace />} />
            <Route path="pedido/*" element={<Navigate to="/" replace />} />
            <Route path="painel/*" element={<Navigate to="/" replace />} />
            <Route path="pedidos-disponiveis" element={<Navigate to="/" replace />} />
            <Route path="perfil/*" element={<Navigate to="/" replace />} />
            <Route path="avaliar/*" element={<Navigate to="/" replace />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
