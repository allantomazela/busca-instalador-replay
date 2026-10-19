import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { ServiceRequest, Proposal, Review, Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([api.listRequests({ cliente_id: user.id }), api.getCategories()]).then(
      ([reqs, cats]) => {
        setRequests(reqs)
        setCategories(cats)
        setLoading(false)
      },
    )
  }, [user])

  if (!user) return null

  // Stats
  const activeRequests = requests.filter(
    (r) => r.status === 'aberto' || r.status === 'em_negociacao',
  )
  const historyRequests = requests.filter((r) => r.status === 'fechado' || r.status === 'cancelado')
  const totalProposals = requests.reduce((acc, r) => acc + (r.propostas_count || 0), 0)
  const inNegotiation = requests.filter((r) => r.status === 'em_negociacao').length

  // Pending reviews: closed requests that may need evaluation
  const pendingReviewRequests = requests.filter(
    (r) => r.status === 'fechado' || r.status === 'em_negociacao',
  )

  const getCategory = (catId: string) => categories.find((c) => c.id === catId)

  const statusBadge = (status: string) => {
    switch (status) {
      case 'aberto':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold">Aberto</Badge>
        )
      case 'em_negociacao':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold">
            Em Negociação
          </Badge>
        )
      case 'fechado':
        return (
          <Badge className="bg-slate-800 text-white hover:bg-slate-800 font-bold">Concluído</Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 font-bold">Cancelado</Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-600">
              Painel do Cliente
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Olá, {user.nome}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhe suas solicitações, orçamentos recebidos e avalie seus profissionais.
            </p>
          </div>

          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition"
          >
            <Link to="/pedido/novo" className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Novo Pedido de Serviço
            </Link>
          </Button>
        </div>

        {/* Stats Row (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Pedidos Ativos</span>
              <span className="text-2xl font-black text-slate-900">{activeRequests.length}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">
                Propostas Recebidas
              </span>
              <span className="text-2xl font-black text-slate-900">{totalProposals}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Em Negociação</span>
              <span className="text-2xl font-black text-slate-900">{inNegotiation}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Histórico Total</span>
              <span className="text-2xl font-black text-slate-900">{requests.length}</span>
            </div>
          </div>
        </div>

        {/* Pending Evaluation Banner if applicable */}
        {pendingReviewRequests.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Star className="w-5 h-5 fill-white stroke-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Você tem pedidos aguardando avaliação
                </h4>
                <p className="text-xs text-slate-600">
                  Avaliar o atendimento ajuda outros clientes e valoriza bons profissionais!
                </p>
              </div>
            </div>

            <Button
              size="sm"
              asChild
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl whitespace-nowrap"
            >
              <Link to={`/pedido/${pendingReviewRequests[0].id}`}>Ver Pedido para Avaliar</Link>
            </Button>
          </div>
        )}

        {/* Requests Tabs: Ativos / Histórico */}
        <div className="space-y-4">
          <Tabs defaultValue="ativos" className="w-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <TabsList className="bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="ativos" className="rounded-lg font-bold text-xs sm:text-sm">
                  Pedidos Ativos ({activeRequests.length})
                </TabsTrigger>
                <TabsTrigger value="historico" className="rounded-lg font-bold text-xs sm:text-sm">
                  Histórico ({historyRequests.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB ATIVOS */}
            <TabsContent value="ativos" className="mt-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : activeRequests.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Você não tem nenhum pedido ativo no momento
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Precisa instalar câmeras, trocar um disjuntor ou fazer reparos em casa? Peça
                    orçamentos grátis agora mesmo!
                  </p>
                  <Button
                    asChild
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-xl"
                  >
                    <Link to="/pedido/novo">Criar Primeiro Pedido</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRequests.map((req) => {
                    const cat = getCategory(req.categoria_id)
                    return (
                      <div
                        key={req.id}
                        className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            {cat && (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                                style={{
                                  backgroundColor: `${cat.cor}15`,
                                  color: cat.cor,
                                }}
                              >
                                <CategoryIcon name={cat.icone} className="w-3.5 h-3.5" />
                                {cat.nome}
                              </span>
                            )}
                            {statusBadge(req.status)}
                          </div>

                          <h3 className="text-base font-bold text-slate-900 group-hover:text-green-600 transition">
                            {req.titulo}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {req.descricao}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {req.bairro}, {req.cidade}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(req.data_criacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600">
                            {req.propostas_count} de 3 orçamentos
                          </span>

                          <Button
                            asChild
                            size="sm"
                            className="bg-slate-900 hover:bg-green-600 text-white font-semibold rounded-xl"
                          >
                            <Link to={`/pedido/${req.id}`}>
                              Ver Detalhes
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB HISTÓRICO */}
            <TabsContent value="historico" className="mt-6 space-y-4">
              {historyRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
                  Nenhum pedido finalizado ou cancelado no histórico.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 opacity-80 hover:opacity-100 transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {new Date(req.data_criacao).toLocaleDateString('pt-BR')}
                          </span>
                          {statusBadge(req.status)}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{req.titulo}</h4>
                        <p className="text-xs text-slate-500">
                          {req.bairro}, {req.cidade}/{req.estado}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex justify-end">
                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                          <Link to={`/pedido/${req.id}`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
