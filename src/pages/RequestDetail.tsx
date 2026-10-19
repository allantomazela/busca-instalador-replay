import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { ServiceRequest, Proposal, Category, ProviderProfile, User } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  ShieldCheck,
  Send,
  MessageCircle,
  Phone,
  Mail,
  ExternalLink,
  Info,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [providersMap, setProvidersMap] = useState<
    Record<string, ProviderProfile & { user: User }>
  >({})
  const [loading, setLoading] = useState(true)
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null)

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const req = await api.getRequestById(id)
      if (!req) {
        toast({
          title: 'Pedido não encontrado',
          description: 'O pedido solicitado não existe ou foi removido.',
          variant: 'destructive',
        })
        navigate('/')
        return
      }
      setRequest(req)

      // Fetch category
      const categories = await api.getCategories()
      const foundCat = categories.find((c) => c.id === req.categoria_id)
      if (foundCat) setCategory(foundCat)

      // Fetch proposals
      const props = await api.listProposalsByRequest(req.id)
      setProposals(props)

      // Fetch provider profiles
      const pMap: Record<string, ProviderProfile & { user: User }> = {}
      for (const p of props) {
        if (!pMap[p.provider_id]) {
          const prof = await api.getProviderProfile(p.provider_id)
          if (prof) pMap[p.provider_id] = prof
        }
      }
      setProvidersMap(pMap)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  // Accept proposal
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const { proposal, request: updatedReq } = await api.acceptProposal(proposalId)
      toast({
        title: 'Proposta aceita!',
        description: 'Os dados de contato do profissional foram liberados abaixo.',
      })
      setRequest(updatedReq)
      setProposals(proposals.map((p) => (p.id === proposalId ? proposal : p)))
    } catch (err: any) {
      toast({
        title: 'Erro ao aceitar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Reject proposal
  const handleRejectProposal = async (proposalId: string) => {
    try {
      const rejected = await api.rejectProposal(proposalId)
      toast({
        title: 'Proposta recusada',
        description: 'A proposta foi marcada como recusada.',
      })
      setProposals(proposals.map((p) => (p.id === proposalId ? rejected : p)))
    } catch (err: any) {
      toast({
        title: 'Erro ao recusar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Cancel request
  const handleCancelRequest = async () => {
    if (!request) return
    try {
      const updated = await api.cancelRequest(request.id)
      setRequest(updated)
      toast({
        title: 'Pedido cancelado',
        description: 'O pedido foi cancelado com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao cancelar',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  if (loading || !request) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-44 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    )
  }

  const isOwner = user?.id === request.cliente_id
  const isProvider = user?.papel === 'profissional'
  const currentSubcat = category?.subcategorias.find((s) => s.id === request.subcategoria_id)

  const statusBadge = () => {
    switch (request.status) {
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
          <Badge className="bg-slate-800 text-white hover:bg-slate-800 font-bold">Fechado</Badge>
        )
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 font-bold">Cancelado</Badge>
        )
    }
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={isProvider ? '/pedidos-disponiveis' : '/painel/cliente'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-green-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {isProvider ? 'Voltar para Pedidos Disponíveis' : 'Voltar para Meus Pedidos'}
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Status do Pedido:</span>
            {statusBadge()}
          </div>
        </div>

        {/* Main Request Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                {category && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                    style={{ backgroundColor: `${category.cor}15`, color: category.cor }}
                  >
                    <CategoryIcon name={category.icone} className="w-3.5 h-3.5" />
                    {category.nome}
                  </span>
                )}
                <span>•</span>
                <span>{currentSubcat?.nome}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {request.titulo}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {request.bairro}, {request.cidade}/{request.estado}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Criado em {new Date(request.data_criacao).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Visita: {request.horario_visita} • Contato: {request.horario_contato}
                </span>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && request.status === 'aberto' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                  >
                    Cancelar Pedido
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deseja realmente cancelar este pedido?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao cancelar, profissionais não poderão mais enviar orçamentos para esta
                      demanda.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelRequest}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                    >
                      Sim, Cancelar Pedido
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Descrição do Cliente
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {request.descricao}
            </p>
          </div>

          {/* Dynamic Answers Breakdown */}
          {request.respostas_dinamicas && Object.keys(request.respostas_dinamicas).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Respostas do Questionário Técnico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(request.respostas_dinamicas).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-col"
                  >
                    <span className="text-slate-500 font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5">
                      {typeof val === 'boolean' ? (val ? 'Sim' : 'Não') : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Gallery with Lightbox */}
          {request.fotos && request.fotos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Fotos do Local ({request.fotos.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {request.fotos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePhotoModal(url)}
                    className="group relative rounded-2xl overflow-hidden aspect-video border border-slate-200 hover:border-green-500 transition-all focus:outline-none"
                  >
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Ampliar
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Proposals Section (Client View) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Orçamentos e Propostas Recebidas
              </h2>
              <p className="text-xs text-slate-500">
                Limite de até 3 profissionais qualificados por pedido ({request.propostas_count} de
                3 vagas preenchidas).
              </p>
            </div>
            {request.propostas_count >= 3 && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs font-bold">
                Limite de 3 orçamentos atingido
              </Badge>
            )}
          </div>

          {proposals.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl shadow-card border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                <Send className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Nenhuma proposta recebida ainda</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Seu pedido foi notificado para técnicos da sua região. Em breve você receberá até 3
                contatos com orçamentos detalhados!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => {
                const providerInfo = providersMap[prop.provider_id]
                const isAccepted = prop.status === 'aceita'
                const isRejected = prop.status === 'recusada'

                return (
                  <div
                    key={prop.id}
                    className={`bg-white p-6 rounded-3xl border transition-all ${
                      isAccepted
                        ? 'border-green-500 ring-2 ring-green-500/20 shadow-lg'
                        : isRejected
                          ? 'border-slate-200 opacity-60 bg-slate-50/70'
                          : 'border-slate-200 shadow-card'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                          <img
                            src={
                              providerInfo?.user.foto ||
                              'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99'
                            }
                            alt={providerInfo?.user.nome || 'Profissional'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/perfil/${prop.provider_id}`}
                              className="text-base font-bold text-slate-900 hover:text-green-600 transition"
                            >
                              {providerInfo?.user.nome || 'Prestador Parceiro'}
                            </Link>
                            {providerInfo?.documentos_validados && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0">
                                <ShieldCheck className="w-3 h-3 mr-0.5 inline" /> Verificado
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 text-amber-600 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
                              {providerInfo?.avaliacao_media || '5.0'}
                            </span>
                            <span>•</span>
                            <span>
                              {providerInfo?.cidade}, {providerInfo?.uf}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs font-semibold text-slate-400 block">
                          Valor Estimado
                        </span>
                        <span className="text-xl sm:text-2xl font-black text-green-600">
                          {prop.valor_estimado > 0
                            ? `R$ ${prop.valor_estimado.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}`
                            : 'A combinar no WhatsApp'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Enviado em {new Date(prop.data_envio).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Proposal message */}
                    <div className="py-4">
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 italic">
                        "{prop.mensagem}"
                      </p>
                    </div>

                    {/* Actions if client viewing */}
                    {isOwner && (
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <Badge className="bg-green-600 text-white font-bold py-1 px-3 text-xs">
                              ✓ Proposta Aceita
                            </Badge>
                          ) : isRejected ? (
                            <Badge variant="outline" className="text-slate-400 text-xs">
                              ✕ Proposta Recusada
                            </Badge>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptProposal(prop.id)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                              >
                                Aceitar Proposta
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectProposal(prop.id)}
                                className="text-slate-500 hover:text-red-600 border-slate-200 rounded-xl"
                              >
                                Recusar
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Unlocked Contact Details if accepted */}
                        {isAccepted && providerInfo && (
                          <div className="w-full mt-3 p-4 bg-green-50/80 rounded-2xl border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs text-slate-700 space-y-1">
                              <span className="font-bold text-green-900 block text-sm">
                                Contato Liberado do Profissional:
                              </span>
                              <p className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-green-700" />
                                {providerInfo.user.telefone}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-green-700" />
                                {providerInfo.user.email}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                asChild
                                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xs"
                              >
                                <a
                                  href={`https://wa.me/55${providerInfo.user.telefone.replace(
                                    /\D/g,
                                    '',
                                  )}?text=${encodeURIComponent(
                                    `Olá ${providerInfo.user.nome}, aceitei sua proposta no ServiçoJá para o pedido "${request.titulo}". Vamos combinar os detalhes?`,
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Conversar no WhatsApp
                                </a>
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="border-green-300 text-green-800 bg-white hover:bg-green-50 rounded-xl"
                              >
                                <Link to={`/avaliar/${request.id}/${providerInfo.user.id}`}>
                                  <Star className="w-3.5 h-3.5 mr-1 text-amber-500" />
                                  Avaliar Serviço
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Lightbox Modal */}
        {activePhotoModal && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActivePhotoModal(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={activePhotoModal}
                alt="Foto ampliada"
                className="w-full h-full object-contain max-h-[85vh]"
              />
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white text-black flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
