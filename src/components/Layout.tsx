import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import {
  Zap,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Search,
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

export default function Layout() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false)
  }, [location.pathname])

  const handleNavAnchor = (id: string) => {
    if (location.pathname === '/') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(`/#${id}`)
      setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
    setMobileDrawerOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    toast({
      title: 'Desconectado com sucesso',
      description: 'Até logo! Esperamos vê-lo em breve.',
    })
    navigate('/')
  }

  const getDashboardPath = () => {
    if (!user) return '/entrar'
    if (user.papel === 'admin') return '/admin'
    if (user.papel === 'profissional') return '/painel/profissional'
    return '/painel/cliente'
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-100 selection:text-green-900">
      {/* Top Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3'
            : 'bg-white/70 backdrop-blur-sm border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform hover:scale-[1.02] active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-600/20 group-hover:rotate-6 transition-transform">
              <Zap className="w-5 h-5 fill-white stroke-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Serviço<span className="text-green-600">Já</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase -mt-1">
                Serviços de Confiança
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavAnchor('Como Funciona')}
              className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
            >
              Como Funciona
            </button>
            <button
              onClick={() => handleNavAnchor('Para Profissionais')}
              className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
            >
              Para Profissionais
            </button>
            <button
              onClick={() => handleNavAnchor('Categorias')}
              className="text-sm font-semibold text-slate-600 hover:text-green-600 transition-colors"
            >
              Categorias
            </button>

            {/* Quick search scroll trigger */}
            <button
              onClick={() => handleNavAnchor('HeroSearch')}
              className="p-2 text-slate-500 hover:text-green-600 hover:bg-slate-100 rounded-lg transition"
              title="Buscar serviço ou profissional"
              aria-label="Buscar serviço"
            >
              <Search className="w-4 h-4" />
            </button>
          </nav>

          {/* Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-lg border-slate-300 text-slate-700 hover:text-green-600 hover:border-green-600 font-semibold"
                >
                  <Link to="/entrar">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm hover:scale-[1.02] active:scale-95 transition"
                >
                  <Link to="/cadastro">Criar Conta</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition outline-none ring-offset-2 focus:ring-2 focus:ring-green-500">
                    <Avatar className="w-9 h-9 border border-green-500/30">
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
                      <span className="text-sm font-semibold text-slate-800 leading-tight">
                        {user.nome.split(' ')[0]}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 capitalize">
                        {user.papel}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg rounded-xl">
                  <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <p className="text-xs text-slate-400">Conectado como</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link to={getDashboardPath()} className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-green-600" />
                      <span>Meu Painel</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.papel === 'profissional' && (
                    <>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link to={`/perfil/${user.id}`} className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                          <span>Meu Perfil Público</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link to="/pedidos-disponiveis" className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>Mural de Pedidos</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {user.papel === 'cliente' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/pedido/novo" className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span>Novo Pedido</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {user.papel === 'admin' && (
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Painel Administrativo</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
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
                <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-200">
                  <Avatar className="w-11 h-11 border-2 border-green-500">
                    <AvatarImage src={user.foto} alt={user.nome} />
                    <AvatarFallback className="bg-green-600 text-white font-bold">
                      {user.nome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-slate-900 truncate">{user.nome}</span>
                    <span className="text-xs text-slate-500 capitalize">{user.papel}</span>
                    <span className="text-xs text-slate-400 truncate">{user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-4 border-b border-slate-200">
                  <Button asChild className="w-full bg-green-600 text-white font-semibold">
                    <Link to="/cadastro">Criar Conta Grátis</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/entrar">Entrar</Link>
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2 py-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                  Navegação
                </span>
                <button
                  onClick={() => handleNavAnchor('Como Funciona')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  Como Funciona
                </button>
                <button
                  onClick={() => handleNavAnchor('Para Profissionais')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  Para Profissionais
                </button>
                <button
                  onClick={() => handleNavAnchor('Categorias')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                >
                  Categorias
                </button>
              </div>

              {user && (
                <div className="flex flex-col gap-2 py-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    Minha Conta
                  </span>
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-green-600" />
                    Meu Painel
                  </Link>

                  {user.papel === 'profissional' && (
                    <>
                      <Link
                        to={`/perfil/${user.id}`}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        Meu Perfil Público
                      </Link>
                      <Link
                        to="/pedidos-disponiveis"
                        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                      >
                        <Zap className="w-4 h-4 text-amber-500" />
                        Mural de Pedidos
                      </Link>
                    </>
                  )}

                  {user.papel === 'cliente' && (
                    <Link
                      to="/pedido/novo"
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      <Zap className="w-4 h-4 text-green-600" />
                      Pedir Novo Serviço
                    </Link>
                  )}

                  {user.papel === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-100 text-slate-700 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Painel Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 font-medium text-left mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content (with top padding for fixed header) */}
      <main className="flex-1 pt-18 sm:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-5 h-5 fill-white stroke-white" />
                </div>
                <span className="text-2xl font-black text-white">
                  Serviço<span className="text-green-500">Já</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                A plataforma brasileira para conectar você a profissionais verificados de Câmeras,
                CFTV, Elétrica e Reparos locais. Orçamentos rápidos, transparentes e sem
                complicação.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://wa.me/5531987654321"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-green-600 hover:text-white flex items-center justify-center transition"
                  title="WhatsApp"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.993.541 1.939.813 2.796.813 3.183 0 5.768-2.587 5.768-5.766-.001-3.182-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.745 0-3.414-.452-4.887-1.309l-5.113 1.371 1.396-5.011c-.961-1.533-1.396-3.27-1.396-5.051 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-pink-600 hover:text-white flex items-center justify-center transition"
                  title="Instagram"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition"
                  title="Facebook"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-700 hover:text-white flex items-center justify-center transition"
                  title="LinkedIn"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Column 1: Serviços */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Serviços</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    to="/pedido/novo?categoria=cameras-cftv"
                    className="hover:text-green-400 transition"
                  >
                    Câmeras e CFTV
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pedido/novo?categoria=eletricista"
                    className="hover:text-green-400 transition"
                  >
                    Eletricistas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pedido/novo?categoria=reparos-domesticos"
                    className="hover:text-green-400 transition"
                  >
                    Reparos Domésticos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pedido/novo?categoria=seguranca-eletronica"
                    className="hover:text-green-400 transition"
                  >
                    Segurança Eletrônica
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pedido/novo?categoria=portao-automatico"
                    className="hover:text-green-400 transition"
                  >
                    Portões Automáticos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 2: Para Profissionais */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                Profissionais
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    to="/cadastro?papel=profissional"
                    className="hover:text-green-400 transition"
                  >
                    Cadastre-se como Parceiro
                  </Link>
                </li>
                <li>
                  <Link to="/pedidos-disponiveis" className="hover:text-green-400 transition">
                    Mural de Oportunidades
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => handleNavAnchor('Para Profissionais')}
                    className="hover:text-green-400 transition text-left"
                  >
                    Vantagens e Ganhos
                  </button>
                </li>
                <li>
                  <Link to="/entrar" className="hover:text-green-400 transition">
                    Acessar Painel Pro
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Column 3: Empresa & Suporte */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">Empresa</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <button
                    onClick={() => handleNavAnchor('Como Funciona')}
                    className="hover:text-green-400 transition text-left"
                  >
                    Sobre Nós
                  </button>
                </li>
                <li>
                  <span className="text-slate-400 hover:text-green-400 transition cursor-pointer">
                    Termos de Uso
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 hover:text-green-400 transition cursor-pointer">
                    Privacidade & LGPD
                  </span>
                </li>
                <li>
                  <span className="text-slate-400 hover:text-green-400 transition cursor-pointer">
                    Central de Ajuda
                  </span>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="text-slate-500 hover:text-slate-300 text-xs transition"
                  >
                    Acesso Administrativo
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} ServiçoJá Tecnologia Ltda. Todos os direitos reservados.
            </p>
            <p className="flex items-center gap-1">
              Desenvolvido com <span className="text-green-500">♥</span> para todo o Brasil.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
