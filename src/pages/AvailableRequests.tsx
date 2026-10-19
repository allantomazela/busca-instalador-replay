import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { ServiceRequest, Category, Proposal, User } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  MapPin,
  Clock,
  Filter,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'

export default function AvailableRequests() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [filterCity, setFilterCity] = useState('')
  const [maxDistance, setMaxDistance] = useState<number>(50)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Unlocked details local state: map of requestId -> { client: User, proposal: Proposal, expanded: boolean, inputValor: number, inputMsg: string }
  const [unlockedState, setUnlockedState] = useState<
    Record<
      string,
      {
        client?: User
        proposal?: Proposal
        inputValor?: number
        inputMsg?: string
        submitting?: boolean
      }
    >
  >({})

  const loadData = async () => {
    setLoading(true)
    try {
      const [allReqs, allCats] = await Promise.all([
        api.listRequests({ status: 'aberto' }),
        api.getCategories(),
      ])

      setRequests(allReqs)
      setCategories(allCats)

      // Check which requests this logged provider already unlocked
      if (user) {
        const userProposals = await api.listProposalsByProvider(user.id)
        const initialUnlocked: typeof unlockedState = {}

        for (const p of userProposals) {
          const req = allReqs.find((r) => r.id === p.request_id)
          if (req) {
            const client = await api.getUserById(req.cliente_id)
            initialUnlocked[p.request_id] = {
              client: client || undefined,
              proposal: p,
              inputValor: p.valor_estimado || 0,
              inputMsg: p.mensagem || '',
            }
          }
        }
        setUnlockedState(initialUnlocked)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Toggle category filter
  const handleToggleCategory = (catSlug: string) => {
    if (selectedCats.includes(catSlug)) {
      setSelectedCats(selectedCats.filter((s) => s !== catSlug))
    } else {
      setSelectedCats([...selectedCats, catSlug])
    }
  }

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const cat = categories.find((c) => c.id === r.categoria_id)
    if (selectedCats.length > 0 && (!cat || !selectedCats.includes(cat.slug))) {
      return false
    }
    if (filterCity.trim() && !r.cidade.toLowerCase().includes(filterCity.toLowerCase().trim())) {
      return false
    }
    return true
  })

  // Unlock contact handler (checks limit of 3 in service layer)
  const handleUnlockContact = async (req: ServiceRequest) => {
    if (!user) {
      toast({
        title: 'Faça login como profissional',
        description: 'Você precisa estar autenticado como prestador para liberar contatos.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { proposal, request: updatedReq } = await api.unlockRequestContact(req.id, user.id)
      const client = await api.getUserById(req.cliente_id)

      setUnlockedState((prev) => ({
        ...prev,
        [req.id]: {
          client: client || undefined,
          proposal,
          inputValor: proposal.valor_estimado || 0,
          inputMsg: proposal.mensagem || '',
        },
      }))

      // Update in local list
      setRequests(requests.map((r) => (r.id === req.id ? updatedReq : r)))

      toast({
        title: 'Contato liberado com sucesso!',
        description: 'Agora você pode ver o telefone do cliente e enviar uma proposta detalhada.',
      })
    } catch (err: any) {
      toast({
        title: 'Não foi possível liberar contato',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Update proposal value & message
  const handleUpdateProposal = async (reqId: string) => {
    const state = unlockedState[reqId]
    if (!state || !state.proposal) return

    setUnlockedState((prev) => ({
      ...prev,
      [reqId]: { ...prev[reqId], submitting: true },
    }))

    try {
      const updated = await api.updateProposal(
        state.proposal.id,
        Number(state.inputValor) || 0,
        state.inputMsg || '',
      )
      setUnlockedState((prev) => ({
        ...prev,
        [reqId]: { ...prev[reqId], proposal: updated, submitting: false },
      }))
      toast({
        title: 'Proposta atualizada!',
        description: 'Seu valor e mensagem foram registrados para o cliente.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar proposta',
        description: err.message,
        variant: 'destructive',
      })
      setUnlockedState((prev) => ({
        ...prev,
        [reqId]: { ...prev[reqId], submitting: false },
      }))
    }
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold uppercase tracking-wider text-xs">
              Mural de Oportunidades
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pedidos Disponíveis
            </h1>
            <p className="text-sm text-slate-500">
              Pedidos abertos na sua região e especialidade. Libere contatos e feche negócios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 rounded-xl"
            >
              <Filter className="w-4 h-4 text-green-600" />
              Filtros {selectedCats.length > 0 && `(${selectedCats.length})`}
            </Button>
          </div>
        </div>

        {/* Content Layout (Sidebar + Request Cards Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Desktop & Collapsible Mobile Filter Sidebar */}
          <div
            className={`md:col-span-4 lg:col-span-3 bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-6 ${
              mobileFilterOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-green-600" />
                Filtrar Pedidos
              </h3>
              {(selectedCats.length > 0 || filterCity) && (
                <button
                  onClick={() => {
                    setSelectedCats([])
                    setFilterCity('')
                  }}
                  className="text-xs text-green-600 hover:underline font-semibold"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* City input */}
            <div className="space-y-1.5">
              <Label htmlFor="filtro-cidade" className="text-xs font-bold text-slate-700">
                Cidade
              </Label>
              <Input
                id="filtro-cidade"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                placeholder="Ex: Belo Horizonte, SP..."
                className="rounded-xl text-xs"
              />
            </div>

            {/* Distance select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">
                Distância máxima: {maxDistance} km
              </Label>
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-green-600"
              />
            </div>

            {/* Categories Multi-select */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Categorias</Label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedCats.includes(cat.slug)}
                      onCheckedChange={() => handleToggleCategory(cat.slug)}
                    />
                    <span className="truncate">{cat.nome}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">
                  Nenhum pedido encontrado com estes filtros
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tente alterar a cidade selecionada ou marcar outras especialidades para ver mais
                  demandas.
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const cat = categories.find((c) => c.id === req.categoria_id)
                const isUnlocked = !!unlockedState[req.id]
                const unlockedData = unlockedState[req.id]
                const isLimitReached = (req.propostas_count || 0) >= 3

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl border transition-all ${
                      isUnlocked
                        ? 'border-green-400 ring-2 ring-green-400/20 shadow-md'
                        : 'border-slate-200 shadow-card hover:border-slate-300'
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {cat && (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold"
                                style={{
                                  backgroundColor: `${cat.cor}15`,
                                  color: cat.cor,
                                }}
                              >
                                <CategoryIcon name={cat.icone} className="w-3.5 h-3.5" />
                                {cat.nome}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-500">
                              Visita: {req.horario_visita}
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-slate-900 tracking-tight">
                            {req.titulo}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {req.bairro}, {req.cidade}/{req.estado}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(req.data_criacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Top Badges */}
                        <div className="flex items-center gap-2 self-start">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isLimitReached
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {req.propostas_count || 0} de 3 vagas
                          </Badge>

                          {isUnlocked && (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              Contato Liberado
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description clamped 3 lines */}
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        {req.descricao}
                      </p>

                      {/* Photos thumbnails preview */}
                      {req.fotos && req.fotos.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {req.fotos.slice(0, 3).map((f, i) => (
                            <img
                              key={i}
                              src={f}
                              alt="Local"
                              className="w-16 h-12 rounded-lg object-cover border border-slate-200 shadow-xs"
                            />
                          ))}
                          {req.fotos.length > 3 && (
                            <span className="text-xs text-slate-400 font-bold">
                              +{req.fotos.length - 3} fotos
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer: Locked vs Unlocked view */}
                      {!isUnlocked ? (
                        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Lock className="w-4 h-4 text-slate-400" />
                            <span>Contato protegido (Nome, Telefone e Endereço ocultos)</span>
                          </div>

                          <Button
                            onClick={() => handleUnlockContact(req)}
                            disabled={isLimitReached}
                            className={`font-bold rounded-xl py-5 px-6 shadow-md transition ${
                              isLimitReached
                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 text-white hover:scale-[1.02] active:scale-95'
                            }`}
                          >
                            <Zap className="w-4 h-4 mr-1.5 fill-white" />
                            {isLimitReached ? 'Limite de 3 Atingido' : 'Liberar Contato'}
                          </Button>
                        </div>
                      ) : (
                        /* Unlocked Panel with client data and Proposal Form */
                        <div className="pt-4 border-t border-green-200 space-y-4">
                          <div className="p-4 bg-green-50/80 rounded-2xl border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs text-slate-700 space-y-1">
                              <span className="font-bold text-green-900 block text-sm">
                                Dados do Cliente Liberados:
                              </span>
                              <p className="font-bold text-slate-900">
                                {unlockedData?.client?.nome || 'Cliente ServiçoJá'}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-green-700" />
                                {unlockedData?.client?.telefone || '(31) 98765-4321'}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-green-700" />
                                {req.logradouro}, {req.numero} {req.complemento} - {req.bairro},{' '}
                                {req.cidade}
                              </p>
                            </div>

                            {unlockedData?.client?.telefone && (
                              <Button
                                size="sm"
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xs whitespace-nowrap"
                              >
                                <a
                                  href={`https://wa.me/55${unlockedData.client.telefone.replace(
                                    /\D/g,
                                    '',
                                  )}?text=${encodeURIComponent(
                                    `Olá ${unlockedData.client.nome}! Sou profissional no ServiçoJá e vi seu pedido "${req.titulo}". Gostaria de apresentar meu orçamento.`,
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Chamar no WhatsApp
                                </a>
                              </Button>
                            )}
                          </div>

                          {/* Proposal Edit / Send Form */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                              Enviar / Atualizar Sua Proposta Formal:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Valor Estimado (R$)</Label>
                                <Input
                                  type="number"
                                  value={unlockedData?.inputValor || ''}
                                  onChange={(e) =>
                                    setUnlockedState({
                                      ...unlockedState,
                                      [req.id]: {
                                        ...unlockedData,
                                        inputValor: Number(e.target.value),
                                      },
                                    })
                                  }
                                  placeholder="Ex: 850"
                                  className="rounded-xl bg-white font-bold"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <Label className="text-xs">Mensagem para o cliente</Label>
                                <Input
                                  value={unlockedData?.inputMsg || ''}
                                  onChange={(e) =>
                                    setUnlockedState({
                                      ...unlockedState,
                                      [req.id]: {
                                        ...unlockedData,
                                        inputMsg: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Ex: Instalação completa com teste de sinal e garantia."
                                  className="rounded-xl bg-white"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end pt-1">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateProposal(req.id)}
                                disabled={unlockedData?.submitting}
                                className="bg-slate-900 hover:bg-green-600 text-white font-bold rounded-xl"
                              >
                                {unlockedData?.submitting ? 'Salvando...' : 'Salvar Proposta'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
