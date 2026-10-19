import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types'
import { ShieldAlert, ArrowLeft, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
        <span className="text-sm font-semibold text-slate-500 mt-4">
          Verificando autorização interna...
        </span>
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

  // Role verification (ex: only admin)
  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 stroke-[2]" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Acesso Restrito ao Administrador
        </h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Esta área é restrita à gestão da empresa. Sua conta está configurada como{' '}
          <strong className="capitalize">{user.papel}</strong>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Search className="w-4 h-4 mr-2" />
              Buscar Profissionais
            </Link>
          </Button>
          <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
            <Link to="/lista">Minha Lista Salva</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
