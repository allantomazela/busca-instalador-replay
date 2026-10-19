import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { AdminLayout } from '@/components/AdminLayout'
import {
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Star,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getAdminStats(), api.getCategories(), api.listRequests()]).then(
      ([st, cats, reqs]) => {
        setStats(st)

        // Compute open requests per category
        const data = cats.map((c) => {
          const count = reqs.filter((r) => r.categoria_id === c.id && r.status === 'aberto').length
          return {
            name: c.nome.split(' ')[0],
            fullName: c.nome,
            pedidos: count,
            cor: c.cor,
          }
        })
        setChartData(data)
        setRecentRequests(reqs.slice(0, 5))
        setLoading(false)
      },
    )
  }, [])

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-10 bg-slate-200 rounded-lg w-1/4 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Visão Geral da Plataforma
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas de crescimento, pedidos abertos e atividade em tempo real.
          </p>
        </div>

        {/* 5 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-xs font-semibold text-slate-400 block">Usuários Totais</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.totalUsers || 0}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-xs font-semibold text-slate-400 block">
              Prestadores Verificados
            </span>
            <span className="text-2xl font-black text-green-600 mt-1 block">
              {stats?.verifiedProviders || 0}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-xs font-semibold text-slate-400 block">Pedidos Abertos</span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">
              {stats?.openRequests || 0}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-xs font-semibold text-slate-400 block">Pedidos Fechados</span>
            <span className="text-2xl font-black text-slate-700 mt-1 block">
              {stats?.closedRequests || 0}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <span className="text-xs font-semibold text-slate-400 block">Avaliação Média</span>
            <span className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
              {stats?.avgRating || '5.0'}
            </span>
          </div>
        </div>

        {/* Bar Chart of Open Requests per Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pedidos Abertos por Categoria</h3>
            <p className="text-xs text-slate-400">
              Distribuição da demanda atual nas especialidades atendidas
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} pedidos`,
                    item.payload.fullName,
                  ]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Bar dataKey="pedidos" radius={[6, 6, 0, 0]} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor || '#16A34A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              Últimas Solicitações Recebidas
            </h3>
            <Link
              to="/pedidos-disponiveis"
              className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRequests.map((req) => (
              <div key={req.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{req.titulo}</h4>
                  <span className="text-slate-400">
                    {req.cidade}/{req.estado} •{' '}
                    {new Date(req.data_criacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                      req.status === 'aberto'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'em_negociacao'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {req.status}
                  </span>
                  <Link
                    to={`/pedido/${req.id}`}
                    className="font-bold text-slate-600 hover:text-green-600"
                  >
                    Ver →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
