import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 mt-4">Carregando permissões...</span>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <Navigate
        to={`/entrar?redirectTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  // Role verification
  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Acesso Restrito</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Você está conectado como <strong className="capitalize">{user.papel}</strong> e não tem
          permissão para acessar esta área.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
          <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Link
              to={
                user.papel === 'admin'
                  ? '/admin'
                  : user.papel === 'profissional'
                    ? '/painel/profissional'
                    : '/painel/cliente'
              }
            >
              Ir ao Meu Painel
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
