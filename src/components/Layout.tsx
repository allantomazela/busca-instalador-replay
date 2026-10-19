import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  ShieldCheck,
  Search,
  BookmarkCheck,
  Settings,
  LogOut,
  ChevronDown,
  Building,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function Layout() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast({
      title: 'Sessão encerrada',
      description: 'Você saiu do sistema corporativo com sucesso.',
    })
    navigate('/entrar')
  }

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-100 selection:text-green-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5 sm:py-3">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-600/20">
              <ShieldCheck className="w-5 h-5 fill-white stroke-green-600" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
                  Serviço<span className="text-green-600">Já</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  B2B
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 -mt-0.5">
                Ferramenta interna de busca
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (only when logged in) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <Link
                to="/"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isCurrent('/') && location.pathname === '/'
                    ? 'bg-white text-green-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Buscar Profissionais</span>
              </Link>

              <Link
                to="/lista"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isCurrent('/lista')
                    ? 'bg-white text-green-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Minha Lista</span>
              </Link>

              {user.papel === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                    isCurrent('/admin')
                      ? 'bg-white text-green-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Administração</span>
                </Link>
              )}
            </nav>
          )}

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <Button
                size="sm"
                asChild
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-xs px-4"
              >
                <Link to="/entrar">Acessar Sistema</Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition outline-none ring-offset-2 focus:ring-2 focus:ring-green-500 border border-slate-200">
                    <Avatar className="w-8 h-8 border border-green-500/40">
                      <AvatarImage src={user.foto} alt={user.nome} />
                      <AvatarFallback className="bg-green-600 text-white font-bold text-xs">
                        {user.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left mr-1">
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        {user.nome.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 capitalize flex items-center gap-1">
                        {user.papel === 'admin' ? 'Dono / Admin' : 'Funcionário'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg rounded-xl">
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <p className="text-[11px] text-slate-400">Usuário interno ativo</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                    <Badge
                      variant="secondary"
                      className="mt-1 text-[10px] uppercase font-bold tracking-wider"
                    >
                      {user.papel === 'admin' ? 'Administrador' : 'Funcionário'}
                    </Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/" className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-green-600" />
                      <span>Buscar Profissionais</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to="/lista" className="flex items-center gap-2">
                      <BookmarkCheck className="w-4 h-4 text-blue-600" />
                      <span>Minha Lista de Contatos</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.papel === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span>Gestão & Configurações</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Sessão</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="text-slate-700"
              aria-label="Abrir menu"
            >
              {mobileDrawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl z-50 flex flex-col p-6 pt-20 animate-slide-left">
            <div className="flex flex-col gap-4">
              {user ? (
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-200">
                  <Avatar className="w-11 h-11 border-2 border-green-500">
                    <AvatarImage src={user.foto} alt={user.nome} />
                    <AvatarFallback className="bg-green-600 text-white font-bold">
                      {user.nome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-900 truncate">{user.nome}</span>
                    <span className="text-xs font-semibold text-green-700 capitalize">
                      {user.papel === 'admin' ? 'Administrador' : 'Funcionário'}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{user.email}</span>
                  </div>
                </div>
              ) : (
                <Button asChild className="w-full bg-green-600 text-white font-semibold">
                  <Link to="/entrar">Entrar no Sistema</Link>
                </Button>
              )}

              {user && (
                <div className="flex flex-col gap-2 py-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    Navegação Interna
                  </span>
                  <Link
                    to="/"
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold"
                  >
                    <Search className="w-4 h-4 text-green-600" />
                    Buscar Profissionais
                  </Link>

                  <Link
                    to="/lista"
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold"
                  >
                    <BookmarkCheck className="w-4 h-4 text-blue-600" />
                    Minha Lista de Contatos
                  </Link>

                  {user.papel === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl hover:bg-slate-100 text-slate-800 font-semibold"
                    >
                      <Settings className="w-4 h-4 text-purple-600" />
                      Administração & Chave Google
                    </Link>
                  )}

                  <div className="pt-4 mt-2 border-t border-slate-200">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 py-2.5 px-3 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content (with top padding for fixed header) */}
      <main className="flex-1 pt-16 sm:pt-18">
        <Outlet />
      </main>

      {/* Simplified Footer for Internal B2B Tool */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-xs">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Building className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-white">ServiçoJá Corporativo</span>
            <span className="text-slate-600">•</span>
            <span>Sistema interno de prospecção e busca de prestadores</span>
          </div>
          <div className="text-slate-400 flex items-center gap-2">
            <span>Uso exclusivo da equipe</span>
            <span className="text-slate-600">•</span>
            <span>Dados preparados para Google Places API</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
