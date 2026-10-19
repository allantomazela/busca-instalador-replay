import React, { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Category, Subcategory, DynamicQuestion } from '@/types'
import { AdminLayout } from '@/components/AdminLayout'
import { CategoryIcon } from '@/components/CategoryIcon'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Code,
  Eye,
  Check,
  PlusCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function AdminCategories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Expanded subcategories per category
  const [expandedCatIds, setExpandedCatIds] = useState<string[]>([])

  // Modal: New Category
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [newCatNome, setNewCatNome] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [newCatIcone, setNewCatIcone] = useState('Camera')
  const [newCatCor, setNewCatCor] = useState('#0EA5E9')
  const [newCatDesc, setNewCatDesc] = useState('')

  // Subcategory Question JSON Editor Modal
  const [editingSubcat, setEditingSubcat] = useState<{
    catId: string
    subcat: Subcategory
  } | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Confirm delete
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const loadCategories = async () => {
    setLoading(true)
    const list = await api.getCategories()
    setCategories(list)
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const toggleExpand = (id: string) => {
    if (expandedCatIds.includes(id)) {
      setExpandedCatIds(expandedCatIds.filter((x) => x !== id))
    } else {
      setExpandedCatIds([...expandedCatIds, id])
    }
  }

  // Handle new category name change auto slug
  const handleNewCatNomeChange = (val: string) => {
    setNewCatNome(val)
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setNewCatSlug(slug)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatNome.trim() || !newCatSlug.trim()) return

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      nome: newCatNome.trim(),
      slug: newCatSlug.trim(),
      icone: newCatIcone,
      cor: newCatCor,
      descricao: newCatDesc.trim() || 'Serviços especializados.',
      subcategorias: [],
    }

    try {
      await api.saveCategory(newCat)
      setCategories([...categories, newCat])
      toast({
        title: 'Categoria criada com sucesso!',
        description: `A categoria ${newCat.nome} já está ativa.`,
      })
      setNewCatOpen(false)
      setNewCatNome('')
      setNewCatSlug('')
      setNewCatDesc('')
    } catch (err: any) {
      toast({
        title: 'Erro ao criar categoria',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    try {
      await api.deleteCategory(categoryToDelete.id)
      setCategories(categories.filter((c) => c.id !== categoryToDelete.id))
      toast({
        title: 'Categoria excluída',
        description: 'A categoria foi removida com sucesso.',
      })
      setCategoryToDelete(null)
    } catch (err: any) {
      toast({
        title: 'Erro ao excluir',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Open JSON editor for questions
  const handleOpenJsonEditor = (catId: string, subcat: Subcategory) => {
    setEditingSubcat({ catId, subcat })
    setJsonText(JSON.stringify(subcat.perguntas_personalizadas, null, 2))
    setJsonError(null)
    setPreviewMode(false)
  }

  // Save JSON
  const handleSaveJsonQuestions = async () => {
    if (!editingSubcat) return
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) {
        throw new Error('O JSON deve ser um array de perguntas ([{ id, pergunta, tipo }])')
      }

      const cat = categories.find((c) => c.id === editingSubcat.catId)
      if (!cat) return

      const updatedSubcats = cat.subcategorias.map((s) =>
        s.id === editingSubcat.subcat.id ? { ...s, perguntas_personalizadas: parsed } : s,
      )

      const updatedCat: Category = {
        ...cat,
        subcategorias: updatedSubcats,
      }

      await api.saveCategory(updatedCat)
      setCategories(categories.map((c) => (c.id === updatedCat.id ? updatedCat : c)))

      toast({
        title: 'Perguntas salvas com sucesso!',
        description: 'O wizard do cliente já está utilizando as novas perguntas dinâmicas.',
      })
      setEditingSubcat(null)
    } catch (err: any) {
      setJsonError(err.message || 'JSON inválido.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gerenciar Categorias & Questionários
            </h1>
            <p className="text-sm text-slate-500">
              Configure as especialidades e edite as perguntas personalizadas dinâmicas do Wizard.
            </p>
          </div>

          <Button
            onClick={() => setNewCatOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const isExpanded = expandedCatIds.includes(cat.id)

            return (
              <div
                key={cat.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden transition-all"
              >
                {/* Category Header Row */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.cor}18`, color: cat.cor }}
                    >
                      <CategoryIcon name={cat.icone} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{cat.nome}</h3>
                        <Badge variant="outline" className="text-xs font-mono text-slate-500">
                          {cat.slug}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {cat.subcategorias.length} subcategorias
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleExpand(cat.id)}
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center gap-1 text-xs font-semibold"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">
                        {isExpanded ? 'Recolher' : 'Subcategorias'}
                      </span>
                    </button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCategoryToDelete(cat)}
                      className="text-red-500 hover:bg-red-50 rounded-lg p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Subcategories Expandable Row */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-5 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subcategorias & Formulários Dinâmicos
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {cat.subcategorias.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800">{sub.nome}</span>
                              <Badge className="bg-slate-100 text-slate-600 text-[10px]">
                                {sub.perguntas_personalizadas.length} perguntas
                              </Badge>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{sub.slug}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenJsonEditor(cat.id, sub)}
                              className="rounded-xl text-xs font-bold text-green-700 border-green-200 hover:bg-green-50"
                            >
                              <Code className="w-3.5 h-3.5 mr-1" />
                              Editar Perguntas (JSON)
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Modal: Nova Categoria */}
        <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              <DialogDescription>Crie uma categoria principal para a plataforma.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="nome-cat">Nome da Categoria</Label>
                <Input
                  id="nome-cat"
                  required
                  value={newCatNome}
                  onChange={(e) => handleNewCatNomeChange(e.target.value)}
                  placeholder="Ex: Câmeras e CFTV"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug-cat">Slug (URL amigável)</Label>
                <Input
                  id="slug-cat"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="cameras-cftv"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ícone</Label>
                  <select
                    value={newCatIcone}
                    onChange={(e) => setNewCatIcone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                  >
                    <option value="Camera">Camera (CFTV)</option>
                    <option value="Zap">Zap (Eletricista)</option>
                    <option value="Wrench">Wrench (Reparos)</option>
                    <option value="Shield">Shield (Segurança)</option>
                    <option value="BellRing">BellRing (Alarmes)</option>
                    <option value="Network">Network (Redes)</option>
                    <option value="DoorOpen">DoorOpen (Portão)</option>
                    <option value="PhoneCall">PhoneCall (Interfone)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Cor de Destaque</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatCor}
                      onChange={(e) => setNewCatCor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer p-0.5 border border-slate-200"
                    />
                    <span className="text-xs font-mono font-bold">{newCatCor}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc-cat">Descrição Curta</Label>
                <Textarea
                  id="desc-cat"
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Explicação do serviço para exibição nos cards..."
                  className="rounded-xl resize-none text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-5"
                >
                  Salvar Categoria
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: JSON Question Editor & Live Preview */}
        <Dialog open={!!editingSubcat} onOpenChange={(open) => !open && setEditingSubcat(null)}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Perguntas de {editingSubcat?.subcat.nome}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      !previewMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5 inline mr-1" />
                    Editor JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    Live Preview
                  </button>
                </div>
              </DialogTitle>
              <DialogDescription>
                Personalize o questionário dinâmico respondido pelo cliente na Etapa 2 do Wizard.
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {!previewMode ? (
                <div className="space-y-2">
                  <Textarea
                    rows={12}
                    value={jsonText}
                    onChange={(e) => {
                      setJsonText(e.target.value)
                      setJsonError(null)
                    }}
                    className="font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 p-4 border border-slate-800 resize-none leading-relaxed"
                  />
                  {jsonError && <p className="text-xs text-red-500 font-bold">{jsonError}</p>}
                  <p className="text-[11px] text-slate-400">
                    Estrutura suportada: Array de objetos com <code>id</code>, <code>pergunta</code>
                    , <code>tipo</code> ('select' | 'boolean' | 'text'), <code>opcoes</code>[],{' '}
                    <code>obrigatorio</code> (boolean).
                  </p>
                </div>
              ) : (
                /* LIVE PREVIEW OF THE FORM */
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700 block">
                    Visualização em Tempo Real (Como o cliente verá no Wizard):
                  </span>
                  {(() => {
                    try {
                      const questions: DynamicQuestion[] = JSON.parse(jsonText)
                      return (
                        <div className="space-y-3">
                          {questions.map((q) => (
                            <div
                              key={q.id}
                              className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5"
                            >
                              <Label className="text-xs font-bold text-slate-800">
                                {q.pergunta}{' '}
                                {q.obrigatorio && <span className="text-red-500">*</span>}
                              </Label>
                              {q.tipo === 'select' && q.opcoes && (
                                <div className="grid grid-cols-2 gap-1.5">
                                  {q.opcoes.map((o) => (
                                    <span
                                      key={o}
                                      className="p-2 border rounded-lg text-[11px] bg-slate-50 text-slate-700 font-medium"
                                    >
                                      {o}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {q.tipo === 'boolean' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <span className="p-2 border rounded-lg text-xs font-bold text-center bg-slate-50">
                                    Sim
                                  </span>
                                  <span className="p-2 border rounded-lg text-xs font-bold text-center bg-slate-50">
                                    Não
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    } catch {
                      return (
                        <p className="text-xs text-red-500">
                          Corrija a sintaxe do JSON no editor para visualizar o preview.
                        </p>
                      )
                    }
                  })()}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingSubcat(null)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveJsonQuestions}
                className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
              >
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Confirm */}
        <AlertDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => !open && setCategoryToDelete(null)}
        >
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir a categoria {categoryToDelete?.nome}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá a categoria e suas subcategorias da listagem do marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
              >
                Sim, Excluir Categoria
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
