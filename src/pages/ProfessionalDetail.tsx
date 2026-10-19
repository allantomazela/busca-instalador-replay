import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { searchService } from '@/services/searchService'
import { listService } from '@/services/listService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Professional, SavedProfessionalItem, FollowUpStatus } from '@/types'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  CheckCircle2,
  Building,
  FileText,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ProfessionalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedItem, setSavedItem] = useState<SavedProfessionalItem | null>(null)
  const [status, setStatus] = useState<FollowUpStatus>('Novo')
  const [notas, setNotas] = useState('')
  const [savingAction, setSavingAction] = useState(false)

  // Carregar dados do profissional e status salvo
  useEffect(() => {
    if (!id) return

    setLoading(true)
    Promise.all([searchService.getProfessionalById(id), listService.getSavedList()])
      .then(([pro, list]) => {
        if (!pro) {
          toast({
            title: 'Profissional não encontrado',
            description: 'O registro solicitado não está disponível.',
            variant: 'destructive',
          })
          navigate('/')
          return
        }
        setProfessional(pro)

        const foundSaved = list.find((item) => item.professionalId === id)
        if (foundSaved) {
          setSavedItem(foundSaved)
          setStatus(foundSaved.status)
          setNotas(foundSaved.notas)
        }
      })
      .catch((err) => {
        toast({
          title: 'Erro ao carregar detalhes',
          description: err.message,
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }, [id, navigate, toast])

  // Salvar ou Atualizar na Lista Interna
  const handleSaveOrUpdate = async () => {
    if (!professional || !user) return
    setSavingAction(true)

    try {
      if (savedItem) {
        // Atualizar
        const updated = await listService.updateSavedItem(savedItem.id, {
          status,
          notas,
        })
        setSavedItem(updated)
        toast({
          title: 'Registro atualizado',
          description: 'Notas e status interno atualizados com sucesso.',
        })
      } else {
        // Salvar novo
        const created = await listService.saveProfessional(
          professional,
          { id: user.id, nome: user.nome },
          status,
          notas,
        )
        setSavedItem(created)
        toast({
          title: 'Adicionado à sua lista interna!',
          description: 'Profissional pronto para acompanhamento pela equipe.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingAction(false)
    }
  }

  // Remover da lista
  const handleRemoveFromList = async () => {
    if (!savedItem) return
    setSavingAction(true)
    try {
      await listService.removeSavedItem(savedItem.id)
      setSavedItem(null)
      setNotas('')
      setStatus('Novo')
      toast({
        title: 'Removido da lista interna',
        description: 'O profissional não consta mais no acompanhamento.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao remover',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingAction(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500 mt-4">
          Carregando dados do profissional...
        </span>
      </div>
    )
  }

  if (!professional) {
    return null
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${professional.nome} ${professional.endereco_completo} ${professional.cidade} ${professional.uf}`,
  )}`

  const whatsappMessage = encodeURIComponent(
    `Olá ${professional.nome}, encontrei seu contato através de pesquisa de prestadores de serviços e gostaria de solicitar um orçamento para nossa empresa.`,
  )
  const whatsappUrl = `https://wa.me/${professional.whatsapp}?text=${whatsappMessage}`

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1000px] mx-auto space-y-6">
        {/* Top Back Nav */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Busca
            </Link>
          </Button>

          {savedItem && (
            <Badge className="bg-green-100 text-green-800 border-green-300 font-bold px-3 py-1 flex items-center gap-1.5">
              <BookmarkCheck className="w-4 h-4 text-green-700" />
              Salvo na Minha Lista ({savedItem.status})
            </Badge>
          )}
        </div>

        {/* Card Principal de Apresentação */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold">
                  {professional.categoria}
                </Badge>
                {professional.verificado_google && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-200 font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Registro Google Maps
                  </Badge>
                )}
                {professional.preco_nivel && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Faixa: {professional.preco_nivel}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {professional.nome}
              </h1>

              {/* Avaliação e Endereço */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  <span>{professional.avaliacao.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">
                    ({professional.total_avaliacoes} avaliações no Google)
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {professional.endereco_completo} — {professional.cidade}/{professional.uf}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botões Grandes de Ação Direta */}
          <div className="py-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition hover:scale-[1.01] active:scale-98"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.993.541 1.939.813 2.796.813 3.183 0 5.768-2.587 5.768-5.766-.001-3.182-2.587-5.768-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.745 0-3.414-.452-4.887-1.309l-5.113 1.371 1.396-5.011c-.961-1.533-1.396-3.27-1.396-5.051 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10z" />
              </svg>
              <span>Chamar no WhatsApp</span>
            </a>

            {/* Ligar */}
            <a
              href={`tel:${professional.telefone.replace(/\D/g, '')}`}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition hover:scale-[1.01] active:scale-98"
            >
              <Phone className="w-4 h-4 text-green-400" />
              <span>Ligar: {professional.telefone}</span>
            </a>

            {/* E-mail */}
            {professional.email ? (
              <a
                href={`mailto:${professional.email}?subject=Solicitação de Orçamento Corporativo`}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-2xs transition hover:scale-[1.01] active:scale-98"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span>Enviar E-mail</span>
              </a>
            ) : (
              <button
                disabled
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed"
              >
                <Mail className="w-4 h-4" />
                <span>Sem E-mail Cadastrado</span>
              </button>
            )}

            {/* Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 font-bold text-sm shadow-2xs transition hover:scale-[1.01] active:scale-98"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Abrir no Maps</span>
            </a>
          </div>

          {/* Informações detalhadas */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Sobre a Empresa / Profissional
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                  {professional.descricao}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Especialidades & Serviços Prestados
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {professional.especialidades.map((esp, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold bg-white border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl shadow-2xs"
                    >
                      ✓ {esp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Informações de Contato e Horários */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Dados de Atendimento
              </h3>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">
                      Horário de Funcionamento:
                    </span>
                    <span className="text-slate-600 text-xs">
                      {professional.horario_funcionamento || 'Horário comercial convencional'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">
                      Localização Completa:
                    </span>
                    <span className="text-slate-600 text-xs">
                      {professional.endereco_completo}, {professional.bairro}
                    </span>
                    <span className="text-slate-500 text-xs block">
                      {professional.cidade} - {professional.uf}{' '}
                      {professional.cep ? `• CEP: ${professional.cep}` : ''}
                    </span>
                  </div>
                </div>

                {professional.site && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">
                        Website Oficial:
                      </span>
                      <a
                        href={professional.site}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-700 hover:underline text-xs flex items-center gap-1 font-semibold"
                      >
                        {professional.site}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de Gestão Interna / Follow-up da Equipe */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-green-600/30 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-green-700 font-bold text-xs uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4" />
            <span>Acompanhamento Interno da Equipe</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-1">
            Status do Contato & Notas da Empresa
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Salve este prestador na lista interna da empresa e anote o andamento das negociações,
            valores propostos e data de retorno.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Status do Acompanhamento:
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as FollowUpStatus)}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-300 font-semibold text-sm">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Novo" className="font-semibold text-slate-700">
                    🟢 Novo (Aguardando contato)
                  </SelectItem>
                  <SelectItem value="Contatado" className="font-semibold text-blue-700">
                    🔵 Contatado
                  </SelectItem>
                  <SelectItem value="Em negociação" className="font-semibold text-amber-700">
                    🟡 Em negociação
                  </SelectItem>
                  <SelectItem value="Fechado" className="font-semibold text-emerald-700">
                    ✅ Fechado / Aprovado
                  </SelectItem>
                  <SelectItem value="Descartado" className="font-semibold text-red-700">
                    ❌ Descartado
                  </SelectItem>
                </SelectContent>
              </Select>

              {savedItem && (
                <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                  <div>
                    Salvo em:{' '}
                    <strong>{new Date(savedItem.data_salvo).toLocaleDateString('pt-BR')}</strong>
                  </div>
                  <div>
                    Responsável: <strong>{savedItem.salvo_por.nome}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Notas internas (visíveis para todos os funcionários):
              </label>
              <Textarea
                rows={3}
                placeholder="Ex: Conversei com o técnico Marcos. Ele cobra R$ 150 pela visita técnica e consegue comparecer na quinta-feira..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="rounded-xl bg-slate-50 border-slate-300 text-sm focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
            <div>
              {savedItem && (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={savingAction}
                  onClick={handleRemoveFromList}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold"
                >
                  Remover da Minha Lista
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto rounded-xl border-slate-300"
              >
                <Link to="/lista">Ir para Minha Lista</Link>
              </Button>

              <Button
                type="button"
                disabled={savingAction}
                onClick={handleSaveOrUpdate}
                className="w-full sm:w-auto rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
              >
                {savingAction
                  ? 'Salvando...'
                  : savedItem
                    ? 'Salvar Alterações'
                    : 'Salvar na Lista da Equipe'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
