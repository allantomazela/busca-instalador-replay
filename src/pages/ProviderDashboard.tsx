import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/services/api'
import { ProviderProfile, User, Proposal, ServiceRequest, Category } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ShieldCheck,
  Zap,
  Star,
  Send,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Edit3,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function ProviderDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<(ProviderProfile & { user: User }) | null>(null)
  const [proposals, setProposals] = useState<(Proposal & { request?: ServiceRequest })[]>([])
  const [availableCount, setAvailableCount] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Profile Modal Form State
  const [editOpen, setEditOpen] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editRaio, setEditRaio] = useState(30)
  const [editCidade, setEditCidade] = useState('')
  const [editUf, setEditUf] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [prof, userProps, allRequests, cats] = await Promise.all([
        api.getProviderProfile(user.id),
        api.listProposalsByProvider(user.id),
        api.listRequests({ status: 'aberto' }),
        api.getCategories(),
      ])

      setProfile(prof)
      setProposals(userProps)
      setCategories(cats)

      // Count open requests in provider categories
      if (prof) {
        const available = allRequests.filter((r) => {
          const cat = cats.find((c) => c.id === r.categoria_id)
          return cat && prof.categorias.includes(cat.slug)
        })
        setAvailableCount(available.length)

        setEditBio(prof.bio)
        setEditRaio(prof.raio_km)
        setEditCidade(prof.cidade)
        setEditUf(prof.uf)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    try {
      const updated = await api.updateProviderProfile(user.id, {
        bio: editBio,
        raio_km: editRaio,
        cidade: editCidade,
        uf: editUf,
      })
      if (profile) {
        setProfile({ ...profile, ...updated })
      }
      toast({
        title: 'Perfil atualizado com sucesso!',
        description: 'Suas informações já estão visíveis no seu perfil público.',
      })
      setEditOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingProfile(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-6">
        <div className="h-28 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // Calculate completeness
  let completeness = 25
  if (profile?.bio && profile.bio.length > 20) completeness += 25
  if (profile?.certificados && profile.certificados.length > 0) completeness += 25
  if (profile?.categorias && profile.categorias.length > 0) completeness += 25

  const acceptedCount = proposals.filter((p) => p.status === 'aceita').length

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                Painel do Prestador
              </span>
              {profile?.documentos_validados ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Profissional Verificado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-400 text-[11px]">
                  Documentação em análise
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Olá, {user.nome}!
            </h1>
            <p className="text-sm text-slate-500">
              Atendendo na região de {profile?.cidade || 'Belo Horizonte'}/{profile?.uf || 'MG'} num
              raio de {profile?.raio_km || 30} km.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-2xl shadow-md hover:scale-[1.02] active:scale-95 transition"
            >
              <Link to="/pedidos-disponiveis" className="flex items-center gap-2">
                <Zap className="w-5 h-5 fill-white" />
                Ver Pedidos Disponíveis
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl py-6 font-semibold border-slate-300"
            >
              <Link to={`/perfil/${user.id}`}>
                <ExternalLink className="w-4 h-4 mr-1 text-slate-500" />
                Ver Perfil Público
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Pedidos na Região</span>
              <span className="text-2xl font-black text-slate-900">{availableCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Propostas Enviadas</span>
              <span className="text-2xl font-black text-slate-900">{proposals.length}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Propostas Aceitas</span>
              <span className="text-2xl font-black text-slate-900">{acceptedCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Star className="w-6 h-6 fill-purple-500 stroke-purple-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Avaliação Média</span>
              <span className="text-2xl font-black text-slate-900">
                {profile?.avaliacao_media?.toFixed(1) || '5.0'}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({profile?.total_avaliacoes || 0})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completeness Callout */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Força do Perfil Profissional</span>
              <span className="text-sm font-black text-green-600">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2.5 bg-slate-100" />
            <p className="text-xs text-slate-500">
              Perfis 100% preenchidos com foto, certificados e biografia passam mais credibilidade e
              fecham 3x mais orçamentos!
            </p>
          </div>

          {/* Edit Profile Modal Trigger */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl border-slate-300 font-bold whitespace-nowrap flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-green-600" />
                Completar / Editar Perfil
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Editar Perfil Profissional</DialogTitle>
                <DialogDescription>
                  Atualize sua bio, raio de cobertura e cidade para receber as melhores
                  oportunidades.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Biografia / Experiência</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="rounded-xl resize-none"
                    placeholder="Descreva suas qualificações, marcas atendidas e diferenciais..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={editCidade}
                      onChange={(e) => setEditCidade(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="uf">UF</Label>
                    <Input
                      id="uf"
                      value={editUf}
                      onChange={(e) => setEditUf(e.target.value.toUpperCase())}
                      maxLength={2}
                      className="rounded-xl text-center font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label>Raio de Atendimento:</Label>
                    <span className="text-xs font-bold text-green-700">{editRaio} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={editRaio}
                    onChange={(e) => setEditRaio(Number(e.target.value))}
                    className="w-full accent-green-600"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-5"
                >
                  {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Proposals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Minhas Propostas e Contatos Liberados
            </h2>
            <span className="text-xs text-slate-400">{proposals.length} propostas no total</span>
          </div>

          {proposals.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Você ainda não enviou propostas</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Confira os pedidos abertos de clientes na sua cidade e libere contatos para fechar
                serviços.
              </p>
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
              >
                <Link to="/pedidos-disponiveis">Explorar Mural de Pedidos</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((prop) => {
                const req = prop.request
                const isAccepted = prop.status === 'aceita'
                const isRejected = prop.status === 'recusada'

                return (
                  <div
                    key={prop.id}
                    className={`bg-white p-6 rounded-3xl border transition-all ${
                      isAccepted
                        ? 'border-green-500 ring-2 ring-green-500/20 shadow-md'
                        : isRejected
                          ? 'border-slate-200 opacity-60'
                          : 'border-slate-200 shadow-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400">
                        Enviada em {new Date(prop.data_envio).toLocaleDateString('pt-BR')}
                      </span>
                      {isAccepted ? (
                        <Badge className="bg-green-600 text-white font-bold text-xs">
                          ✓ Proposta Aceita
                        </Badge>
                      ) : isRejected ? (
                        <Badge variant="outline" className="text-slate-400 text-xs">
                          Recusada
                        </Badge>
                      ) : (
                        <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 text-xs font-semibold">
                          Enviada
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {req?.titulo || 'Pedido de Serviço'}
                    </h3>

                    {req && (
                      <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {req.bairro}, {req.cidade}/{req.estado}
                      </p>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic mb-4 line-clamp-2">
                      "{prop.mensagem}"
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-semibold">
                          Valor Estimado
                        </span>
                        <span className="text-base font-black text-green-700">
                          {prop.valor_estimado > 0
                            ? `R$ ${prop.valor_estimado.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}`
                            : 'A combinar'}
                        </span>
                      </div>

                      {req && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-slate-300 font-semibold text-xs"
                        >
                          <Link to={`/pedido/${req.id}`}>Ver Pedido</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
