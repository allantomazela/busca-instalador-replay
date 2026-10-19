import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Grid, BarChart3, ShieldCheck, ArrowLeft } from 'lucide-react'

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()

  const navItems = [
    { label: 'Visão Geral', path: '/admin', icon: LayoutDashboard },
    { label: 'Usuários', path: '/admin/usuarios', icon: Users },
    { label: 'Categorias', path: '/admin/categorias', icon: Grid },
    { label: 'Relatórios', path: '/admin/relatorios', icon: BarChart3 },
  ]

  return (
    <div className="min-h-[88vh] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop (Navy) / Top tabs mobile */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 hidden md:block">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-green-500" />
            <span className="font-black text-white text-lg tracking-tight">Admin ServiçoJá</span>
          </div>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mt-1">
            Moderação & Governança
          </span>
        </div>

        {/* Navigation items */}
        <nav className="flex md:flex-col overflow-x-auto p-3 gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-green-400 border-l-4 border-green-500 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-slate-800 hidden md:block">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Site Público
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
