import React, { useState, useEffect, useTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchService } from '@/services/searchService'
import { listService } from '@/services/listService'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Professional, ProfessionalCategory } from '@/types'
import {
  Search,
  MapPin,
  Star,
  ExternalLink,
  Phone,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Building,
  Globe,
  SlidersHorizontal,
  Info,
  Key,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Se o usuário não estiver logado, a rota de busca interna requer autenticação
  // Embora o RouteGuard cuide disso, podemos garantir o redirect amigável
  useEffect(() => {
    if (!user) {
      navigate('/entrar')
    }
  }, [user, navigate])

  const [termo, setTermo] = useState('')
  const [localidade, setLocalidade] = useState('')
  const [categoria, setCategoria] = useState<string>('Todos')
  const [results, setResults] = useState<Professional[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(6)

  const categories = ['Todos', ...searchService.getAllCategories()]

  // Carregar lista de IDs salvos para atualizar os ícones
  const loadSavedIds = async () => {
    try {
      const list = await listService.getSavedList()
      setSavedIds(new Set(list.map((item) => item.professionalId)))
    } catch (e) {
      console.error(e)
    }
  }

  // Executar busca
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const resp = await searchService.searchProfessionals({
        termo,
        localidade,
        categoria: categoria === 'Todos' ? undefined : categoria,
      })
      setResults(resp.results)
      setTotalResults(resp.total)
      setIsDemoMode(resp.isDemoMode)
      setVisibleCount(6)
    } catch (err: any) {
      toast({
        title: 'Erro na busca',
        description: err.message || 'Não foi possível buscar profissionais.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Primeira carga
  useEffect(() => {
    handleSearch()
    loadSavedIds()
  }, [])

  // Atualizar quando clicar numa categoria rápida
  const handleCategorySelect = (cat: string) => {
    setCategoria(cat)
    setLoading(true)
    searchService
      .searchProfessionals({
        termo,
        localidade,
        categoria: cat === 'Todos' ? undefined : cat,
      })
      .then((resp) => {
        setResults(resp.results)
        setTotalResults(resp.total)
        setIsDemoMode(resp.isDemoMode)
        setVisibleCount(6)
      })
      .finally(() => setLoading(false))
  }

  // Salvar na lista interna
  const handleToggleSave = async (pro: Professional) => {
    if (!user) return
    const isSaved = savedIds.has(pro.id)
    setSavingId(pro.id)

    try {
      if (isSaved) {
        await listService.removeByProfessionalId(pro.id)
        savedIds.delete(pro.id)
        setSavedIds(new Set(savedIds))
        toast({
          title: 'Removido da lista interna',
          description: `${pro.nome} foi retirado da sua lista de acompanhamento.`,
        })
      } else {
        await listService.saveProfessional(pro, { id: user.id, nome: user.nome }, 'Novo', '')
        savedIds.add(pro.id)
        setSavedIds(new Set(savedIds))
        toast({
          title: 'Salvo na sua lista!',
          description: `${pro.nome} foi adicionado à lista para acompanhamento da equipe.`,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Não foi possível alterar a lista',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSavingId(null)
    }
  }

  // Google Maps link generator
  const getMapsUrl = (pro: Professional) => {
    const q = encodeURIComponent(`${pro.nome} ${pro.endereco_completo} ${pro.cidade} ${pro.uf}`)
    return `https://www.google.com/maps/search/?api=1&query=${q}`
  }

  // WhatsApp link generator
  const getWhatsAppUrl = (pro: Professional) => {
    const text = encodeURIComponent(
      `Olá ${pro.nome}! Encontrei o contato da sua empresa através de pesquisa de fornecedores e gostaria de solicitar um orçamento para um serviço.`,
    )
    return `https://wa.me/${pro.whatsapp}?text=${text}`
  }

  if (!user) {
    return null
  }

  const visibleResults = results.slice(0, visibleCount)

  return (
    <div className="min-h-screen pb-16">
      {/* Top Banner / Indicator: Modo Demonstração vs API Conectada */}
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {isDemoMode ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Modo Demonstração Ativo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-300 font-bold border border-green-500/40">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Google Places API Conectada
              </span>
            )}
            <span className="text-slate-400 hidden sm:inline">
              {isDemoMode
                ? 'Resultados baseados no dataset realista de prestadores brasileiros.'
                : 'Buscando fornecedores em tempo real via Google Places.'}
            </span>
          </div>

          {isDemoMode && user.papel === 'admin' && (
            <Link
              to="/admin"
              className="text-green-400 hover:text-green-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Key className="w-3.5 h-3.5" />
              Configurar Chave Google Places no Painel
            </Link>
          )}
        </div>
      </div>

      {/* Header com Boas-vindas corporativas e Barra de Busca */}
      <div className="bg-gradient-to-b from-white to-slate-100/60 border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider mb-1">
                <Building className="w-3.5 h-3.5" />
                <span>Base Interna de Fornecedores & Serviços</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Buscar Profissionais de Serviços
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Encontre empresas e técnicos de CFTV/câmeras, eletricistas, reparos e segurança
                eletrônica para demandas internas da empresa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-slate-300 text-slate-700 bg-white shadow-xs"
              >
                <Link to="/lista" className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-green-600" />
                  <span>Ver Minha Lista Salva ({savedIds.size})</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Box Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-2xl shadow-md border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
          >
            {/* Termo / Especialidade */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Ex: Câmeras IP, troca de disjuntor, cerca elétrica..."
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus:bg-white"
              />
            </div>

            {/* Localidade / Cidade ou CEP */}
            <div className="md:col-span-4 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Cidade, bairro ou CEP (ex: São Paulo, BH...)"
                value={localidade}
                onChange={(e) => setLocalidade(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-slate-50/70 border-slate-200 text-sm focus:bg-white"
              />
            </div>

            {/* Botão de Busca */}
            <div className="md:col-span-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-600/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pesquisando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar Profissionais</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Filtro de Categorias em Chips */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Categorias:
            </span>
            {categories.map((cat) => {
              const active = categoria === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Profissionais Encontrados</h2>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 font-bold">
              {totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}
            </Badge>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Contatos com link direto para WhatsApp e rota no Google Maps</span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4 rounded" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-12 w-full rounded" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Nenhum profissional encontrado
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Não encontramos resultados para os termos pesquisados. Tente limpar os filtros ou
              buscar por cidades maiores como "São Paulo", "Belo Horizonte" ou "Rio de Janeiro".
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setTermo('')
                setLocalidade('')
                setCategoria('Todos')
                searchService.searchProfessionals({}).then((r) => {
                  setResults(r.results)
                  setTotalResults(r.total)
                })
              }}
              className="rounded-xl border-slate-300"
            >
              Limpar Filtros e Ver Todos
            </Button>
          </div>
        )}

        {/* Cards Grid */}
        {!loading && results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleResults.map((pro) => {
                const isSaved = savedIds.has(pro.id)
                const isSaving = savingId === pro.id

                return (
                  <div
                    key={pro.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Header do Card */}
                    <div className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-1.5"
                          >
                            {pro.categoria}
                          </Badge>
                          <Link
                            to={`/profissional/${pro.id}`}
                            className="text-base font-black text-slate-900 group-hover:text-green-700 transition line-clamp-1 block"
                            title={pro.nome}
                          >
                            {pro.nome}
                          </Link>
                        </div>

                        {/* Botão de Salvar na Lista */}
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleToggleSave(pro)}
                          className={`p-2 rounded-xl transition border shadow-xs ${
                            isSaved
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                          title={isSaved ? 'Salvo na lista interna' : 'Salvar na lista interna'}
                          aria-label="Salvar na lista"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 fill-green-600 text-green-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Avaliação e Localização */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          <span>{pro.avaliacao.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">
                            ({pro.total_avaliacoes})
                          </span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-slate-500 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {pro.bairro}, {pro.cidade} - {pro.uf}
                          </span>
                        </div>
                      </div>

                      {/* Descrição curta */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {pro.descricao}
                      </p>

                      {/* Tags de especialidade */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pro.especialidades.slice(0, 3).map((esp, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {esp}
                          </span>
                        ))}
                        {pro.especialidades.length > 3 && (
                          <span className="text-[10px] text-slate-400 py-0.5 font-medium">
                            +{pro.especialidades.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rodapé com Ações Rápidas */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* WhatsApp Clicável */}
                        <a
                          href={getWhatsAppUrl(pro)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                          title={`Chamar ${pro.nome} no WhatsApp`}
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.993.541 1.939.813 2.796.813 3.183 0 5.768-2.587 5.768-5.766-.001-3.182-2.587-5.768-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.745 0-3.414-.452-4.887-1.309l-5.113 1.371 1.396-5.011c-.961-1.533-1.396-3.27-1.396-5.051 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>

                        {/* Ver no Google Maps */}
                        <a
                          href={getMapsUrl(pro)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs shadow-2xs transition"
                          title="Abrir localização no Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                          <span>Google Maps</span>
                        </a>
                      </div>

                      {/* Link Detalhes Completos */}
                      <Link
                        to={`/profissional/${pro.id}`}
                        className="text-center text-xs font-semibold text-slate-500 hover:text-green-700 py-1 transition flex items-center justify-center gap-1"
                      >
                        <span>Ver detalhes e contatos completos</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botão Carregar Mais */}
            {visibleCount < results.length && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="rounded-xl px-6 py-5 border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Carregar mais profissionais ({results.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
