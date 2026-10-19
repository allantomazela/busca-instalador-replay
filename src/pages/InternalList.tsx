import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listService } from '@/services/listService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { SavedProfessionalItem, FollowUpStatus } from '@/types'
import {
  BookmarkCheck,
  Search,
  ExternalLink,
  Phone,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  FileText,
  Filter,
  Save,
  MessageCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function InternalList() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [items, setItems] = useState<SavedProfessionalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [editingItem, setEditingItem] = useState<SavedProfessionalItem | null>(null)
  const [editStatus, setEditStatus] = useState<FollowUpStatus>('Novo')
  const [editNotas, setEditNotas] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadList = async () => {
    setLoading(true)
    try {
      const data = await listService.getSavedList()
      setItems(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar lista',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const handleOpenEdit = (item: SavedProfessionalItem) => {
    setEditingItem(item)
    setEditStatus(item.status)
    setEditNotas(item.notas)
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    setSavingEdit(true)
    try {
      const updated = await listService.updateSavedItem(editingItem.id, {
        status: editStatus,
        notas: editNotas,
      })

      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))

      toast({
        title: 'Acompanhamento atualizado',
        description: `Status de ${updated.professional.nome} alterado para "${updated.status}".`,
      })
      setEditingItem(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleQuickStatusChange = async (itemId: string, newStatus: FollowUpStatus) => {
    try {
      const updated = await listService.updateSavedItem(itemId, { status: newStatus })
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
      toast({
        title: 'Status atualizado',
        description: `Status alterado para "${newStatus}".`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteItem = async (itemId: string, nome: string) => {
    setDeletingId(itemId)
    try {
      await listService.removeSavedItem(itemId)
      setItems((prev) => prev.filter((i) => i.id !== itemId))
      toast({
        title: 'Removido da lista',
        description: `${nome} foi excluído do acompanhamento.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'Todos') return true
    return item.status === filterStatus
  })

  // Badges coloridos por status
  const getStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'Novo':
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-300 font-bold">🟢 Novo</Badge>
        )
      case 'Contatado':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold">
            🔵 Contatado
          </Badge>
        )
      case 'Em negociação':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-bold">
            🟡 Em negociação
          </Badge>
        )
      case 'Fechado':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold">
            ✅ Fechado
          </Badge>
        )
      case 'Descartado':
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-200 font-bold">
            ❌ Descartado
          </Badge>
        )
    }
  }

  const getWhatsAppUrl = (pro: SavedProfessionalItem['professional']) => {
    const text = encodeURIComponent(
      `Olá ${pro.nome}! Entramos em contato referente a serviços de ${pro.categoria} para nossa empresa.`,
    )
    return `https://wa.me/${pro.whatsapp}?text=${text}`
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-[1240px] mx-auto space-y-6">
        {/* Header da Tela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
              <BookmarkCheck className="w-4 h-4" />
              <span>Controle Interno de Contatos & Fornecedores</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Minha Lista de Acompanhamento
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Profissionais salvos pela equipe para contato comercial, orçamento e negociação.
            </p>
          </div>

          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xs"
          >
            <Link to="/" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Buscar Mais Profissionais</span>
            </Link>
          </Button>
        </div>

        {/* Barra de Filtro de Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filtrar por Status:
            </span>
            {['Todos', 'Novo', 'Contatado', 'Em negociação', 'Fechado', 'Descartado'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition border ${
                  filterStatus === st
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                {st}{' '}
                {st === 'Todos'
                  ? `(${items.length})`
                  : `(${items.filter((i) => i.status === st).length})`}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total exibido: <strong>{filteredItems.length}</strong>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500 mt-4">
              Carregando contatos salvos...
            </span>
          </div>
        )}

        {/* Estado Vazio */}
        {!loading && filteredItems.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              <BookmarkCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {filterStatus === 'Todos'
                ? 'Nenhum profissional salvo ainda'
                : `Nenhum item com status "${filterStatus}"`}
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {filterStatus === 'Todos'
                ? 'Ao buscar profissionais na tela inicial, clique em "Salvar na lista" para trazê-los para este painel de acompanhamento.'
                : 'Tente selecionar outro filtro de status ou adicionar novos profissionais.'}
            </p>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
            >
              <Link to="/" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Explorar Profissionais Agora</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Tabela / Cards de Acompanhamento */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => {
              const pro = item.professional

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Dados do Prestador */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 text-[11px] font-semibold"
                      >
                        {pro.categoria}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        Salvo em {new Date(item.data_salvo).toLocaleDateString('pt-BR')} por{' '}
                        {item.salvo_por.nome}
                      </span>
                    </div>

                    <Link
                      to={`/profissional/${pro.id}`}
                      className="text-lg font-black text-slate-900 hover:text-green-700 transition block truncate"
                    >
                      {pro.nome}
                    </Link>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{pro.avaliacao.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {pro.bairro}, {pro.cidade} - {pro.uf}
                        </span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-slate-600 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pro.telefone}</span>
                      </div>
                    </div>

                    {/* Notas Internas */}
                    <div className="mt-3 bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400" />
                          Notas Internas da Equipe:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="text-green-700 hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Editar notas
                        </button>
                      </div>
                      <p className="text-slate-700 italic">
                        {item.notas || 'Nenhuma observação interna anotada ainda.'}
                      </p>
                    </div>
                  </div>

                  {/* Ações e Mudança Rápida de Status */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* Select de Status Rápido */}
                    <div className="w-full sm:w-48">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Alterar Status:
                      </label>
                      <Select
                        value={item.status}
                        onValueChange={(val) =>
                          handleQuickStatusChange(item.id, val as FollowUpStatus)
                        }
                      >
                        <SelectTrigger className="h-9 text-xs rounded-xl font-bold bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Novo" className="text-xs font-semibold">
                            🟢 Novo
                          </SelectItem>
                          <SelectItem value="Contatado" className="text-xs font-semibold">
                            🔵 Contatado
                          </SelectItem>
                          <SelectItem value="Em negociação" className="text-xs font-semibold">
                            🟡 Em negociação
                          </SelectItem>
                          <SelectItem value="Fechado" className="text-xs font-semibold">
                            ✅ Fechado
                          </SelectItem>
                          <SelectItem value="Descartado" className="text-xs font-semibold">
                            ❌ Descartado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={getWhatsAppUrl(pro)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition"
                        title="Chamar no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-300 text-slate-700 text-xs font-bold"
                      >
                        <Link to={`/profissional/${pro.id}`}>Detalhes</Link>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === item.id}
                        onClick={() => handleDeleteItem(item.id, pro.nome)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        title="Remover da lista"
                        aria-label="Excluir item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal de Edição de Notas e Status */}
        {editingItem && (
          <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-slate-900">
                  Editar Acompanhamento Interno
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {editingItem.professional.nome} — {editingItem.professional.categoria}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status Atual:
                  </label>
                  <Select
                    value={editStatus}
                    onValueChange={(val) => setEditStatus(val as FollowUpStatus)}
                  >
                    <SelectTrigger className="rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Novo">🟢 Novo (Aguardando contato)</SelectItem>
                      <SelectItem value="Contatado">🔵 Contatado</SelectItem>
                      <SelectItem value="Em negociação">🟡 Em negociação</SelectItem>
                      <SelectItem value="Fechado">✅ Fechado / Aprovado</SelectItem>
                      <SelectItem value="Descartado">❌ Descartado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Notas Internas:
                  </label>
                  <Textarea
                    rows={4}
                    value={editNotas}
                    onChange={(e) => setEditNotas(e.target.value)}
                    placeholder="Anote detalhes de valores, prazos, orçamentos recebidos ou motivos de descarte..."
                    className="rounded-xl resize-none text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                >
                  {savingEdit ? 'Salvando...' : 'Salvar Informações'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
