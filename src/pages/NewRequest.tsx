import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { Category, Subcategory } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  MapPin,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  Lock,
} from 'lucide-react'

export default function NewRequestWizard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, login, register } = useAuth()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)

  // Step 1: Service selection
  const [selectedCatId, setSelectedCatId] = useState<string>('')
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('')

  // Step 2: Dynamic details
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({})
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')

  // Step 3: Photos (up to 6)
  const [fotos, setFotos] = useState<string[]>([])

  // Step 4: Location & Schedules
  const [cep, setCep] = useState(searchParams.get('cep') || '')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('MG')
  const [horarioContato, setHorarioContato] = useState('Manhã')
  const [horarioVisita, setHorarioVisita] = useState('Fim de semana')
  const [searchingCep, setSearchingCep] = useState(false)

  // Step 5: Inline quick auth if not logged in
  const [inlineAuthMode, setInlineAuthMode] = useState<'login' | 'register'>('login')
  const [inlineEmail, setInlineEmail] = useState('')
  const [inlineSenha, setInlineSenha] = useState('')
  const [inlineNome, setInlineNome] = useState('')
  const [inlineTelefone, setInlineTelefone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)

  // Load categories
  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats)
      setLoadingCats(false)

      // Query params pre-fill
      const catSlug = searchParams.get('categoria')
      const termo = searchParams.get('termo')?.toLowerCase()

      if (catSlug) {
        const found = cats.find((c) => c.slug === catSlug)
        if (found) {
          setSelectedCatId(found.id)
          if (found.subcategorias.length > 0) {
            setSelectedSubcatId(found.subcategorias[0].id)
            setTitulo(found.subcategorias[0].nome)
          }
        }
      } else if (termo) {
        // Find best match by keyword
        for (const c of cats) {
          const sub = c.subcategorias.find(
            (s) => s.nome.toLowerCase().includes(termo) || s.slug.includes(termo),
          )
          if (sub) {
            setSelectedCatId(c.id)
            setSelectedSubcatId(sub.id)
            setTitulo(sub.nome)
            break
          }
        }
      }
    })
  }, [searchParams])

  // Lookup CEP if prefilled
  useEffect(() => {
    if (cep.replace(/\D/g, '').length === 8) {
      handleLookupCep(cep)
    }
  }, [])

  const currentCategory = categories.find((c) => c.id === selectedCatId)
  const currentSubcategory = currentCategory?.subcategorias.find((s) => s.id === selectedSubcatId)

  // When subcategory changes, update title & reset dynamic questions
  const handleSelectSubcategory = (sub: Subcategory) => {
    setSelectedSubcatId(sub.id)
    setTitulo(sub.nome)
    // Prefill default answers
    const defaults: Record<string, any> = {}
    sub.perguntas_personalizadas.forEach((q) => {
      if (q.tipo === 'boolean') defaults[q.id] = false
      if (q.tipo === 'select' && q.opcoes && q.opcoes.length > 0) defaults[q.id] = q.opcoes[0]
      if (q.tipo === 'text' || q.tipo === 'textarea') defaults[q.id] = ''
    })
    setDynamicAnswers(defaults)
  }

  // CEP lookup
  const handleLookupCep = async (targetCep: string) => {
    if (targetCep.replace(/\D/g, '').length < 8) return
    setSearchingCep(true)
    try {
      const data = await api.lookupCep(targetCep)
      setLogradouro(data.logradouro)
      setBairro(data.bairro)
      setCidade(data.cidade)
      setEstado(data.uf)
      setCep(data.cep)
      toast({
        title: 'Endereço localizado',
        description: `${data.logradouro}, ${data.bairro} - ${data.cidade}/${data.uf}`,
      })
    } catch {
      toast({
        title: 'CEP não encontrado',
        description: 'Preencha seu endereço manualmente.',
        variant: 'destructive',
      })
    } finally {
      setSearchingCep(false)
    }
  }

  const handleCepInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw
    setCep(formatted)
    if (raw.length === 8) {
      handleLookupCep(formatted)
    }
  }

  // Photo handlers (mock preview upload)
  const handleAddSamplePhoto = () => {
    if (fotos.length >= 6) {
      toast({
        title: 'Limite atingido',
        description: 'Você pode adicionar no máximo 6 fotos por pedido.',
      })
      return
    }
    const samplePhotos = [
      'https://img.usecurling.com/p/600/400?q=electrical+panel+breaker',
      'https://img.usecurling.com/p/600/400?q=cctv+camera+wall',
      'https://img.usecurling.com/p/600/400?q=house+entrance+gate',
      'https://img.usecurling.com/p/600/400?q=wall+socket+switch',
      'https://img.usecurling.com/p/600/400?q=roof+cable+duct',
    ]
    const nextPhoto = samplePhotos[fotos.length % samplePhotos.length]
    setFotos([...fotos, nextPhoto])
    toast({
      title: 'Foto adicionada',
      description: 'Foto do local anexada com sucesso.',
    })
  }

  const handleRemovePhoto = (idx: number) => {
    setFotos(fotos.filter((_, i) => i !== idx))
  }

  // Quick Auth handlers on Step 5
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      await login(inlineEmail, inlineSenha)
      toast({
        title: 'Conectado!',
        description: 'Agora você pode publicar seu pedido.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao autenticar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      await register({
        nome: inlineNome,
        email: inlineEmail,
        telefone: inlineTelefone,
        senha: inlineSenha,
        papel: 'cliente',
      })
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você está conectado e pode publicar seu pedido.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao criar conta',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setAuthLoading(false)
    }
  }

  // Publish Request
  const handlePublish = async () => {
    if (!user) {
      toast({
        title: 'Identificação necessária',
        description: 'Faça login ou crie uma conta rápida para publicar.',
        variant: 'destructive',
      })
      return
    }

    setPublishing(true)
    try {
      const created = await api.createRequest({
        cliente_id: user.id,
        categoria_id: selectedCatId,
        subcategoria_id: selectedSubcatId,
        titulo: titulo.trim() || currentSubcategory?.nome || 'Pedido de Serviço',
        descricao: descricao.trim() || 'Serviço solicitado conforme detalhes especificados.',
        respostas_dinamicas: dynamicAnswers,
        cep,
        logradouro,
        numero: numero.trim() || 'S/N',
        complemento,
        bairro,
        cidade,
        estado,
        fotos,
        horario_contato: horarioContato,
        horario_visita: horarioVisita,
      })

      toast({
        title: 'Pedido publicado com sucesso!',
        description: 'Agora é só aguardar propostas dos melhores profissionais.',
      })

      navigate(`/pedido/${created.id}`)
    } catch (err: any) {
      toast({
        title: 'Erro ao publicar pedido',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setPublishing(false)
    }
  }

  // Validation before advancing
  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedSubcatId) {
        toast({
          title: 'Selecione o serviço',
          description: 'Escolha uma categoria e subcategoria para continuar.',
          variant: 'destructive',
        })
        return
      }
    }
    if (step === 2) {
      if (!titulo.trim()) {
        toast({
          title: 'Título obrigatório',
          description: 'Dê um título curto para o seu pedido.',
          variant: 'destructive',
        })
        return
      }
      // Check required dynamic questions
      if (currentSubcategory) {
        for (const q of currentSubcategory.perguntas_personalizadas) {
          if (
            q.obrigatorio &&
            (dynamicAnswers[q.id] === undefined || dynamicAnswers[q.id] === '')
          ) {
            toast({
              title: 'Pergunta obrigatória',
              description: `Por favor responda: "${q.pergunta}"`,
              variant: 'destructive',
            })
            return
          }
        }
      }
    }
    if (step === 4) {
      if (!cep || !logradouro || !cidade || !estado) {
        toast({
          title: 'Endereço incompleto',
          description: 'Preencha o CEP, logradouro, número e cidade.',
          variant: 'destructive',
        })
        return
      }
    }
    setStep((s) => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const stepsLabels = ['Serviço', 'Detalhes', 'Fotos', 'Local', 'Publicar']

  return (
    <div className="min-h-[85vh] bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Top Header with Progress Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Solicitar Novo Orçamento
            </span>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Cancelar e Sair ✕
            </Link>
          </div>

          {/* Stepper Circles */}
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-0" />
            {/* Green Active Fill Line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-600 transition-all duration-300 -z-0"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />

            {stepsLabels.map((lbl, idx) => {
              const stepNumber = idx + 1
              const isCompleted = stepNumber < step
              const isCurrent = stepNumber === step

              return (
                <div key={lbl} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-600 text-white shadow-md'
                        : isCurrent
                          ? 'bg-green-600 text-white ring-4 ring-green-100 shadow-md scale-110'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : stepNumber}
                  </div>
                  <span
                    className={`hidden sm:block text-xs mt-2 font-semibold ${
                      isCurrent
                        ? 'text-green-700 font-bold'
                        : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-400'
                    }`}
                  >
                    {lbl}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Wizard Step Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200 transition-all duration-200">
          {/* STEP 1: CATEGORY & SUBCATEGORY */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Qual serviço você precisa?
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Selecione a categoria principal e a especialidade desejada.
                </p>
              </div>

              {loadingCats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    const isSelected = selectedCatId === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCatId(cat.id)
                          setSelectedSubcatId('')
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col items-center sm:items-start transition-all ${
                          isSelected
                            ? 'border-green-600 bg-green-50/70 shadow-sm ring-2 ring-green-600/20'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                          style={{ backgroundColor: `${cat.cor}18`, color: cat.cor }}
                        >
                          <CategoryIcon name={cat.icone} className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                          {cat.nome}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Subcategories list */}
              {currentCategory && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Label className="text-sm font-bold text-slate-700">
                    Selecione a especialidade em {currentCategory.nome}:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentCategory.subcategorias.map((sub) => {
                      const isSelected = selectedSubcatId === sub.id
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSelectSubcategory(sub)}
                          className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-sm transition ${
                            isSelected
                              ? 'border-green-600 bg-green-50 text-green-900 font-bold shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <span>{sub.nome}</span>
                          {isSelected && <Check className="w-4 h-4 text-green-600" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DYNAMIC DETAILS */}
          {step === 2 && currentSubcategory && (
            <div className="space-y-6">
              <div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 mb-2">
                  {currentCategory?.nome}
                </Badge>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Detalhes sobre {currentSubcategory.nome}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Responda com precisão para receber orçamentos assertivos dos profissionais.
                </p>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="titulo">Título do Pedido *</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Instalação de 4 câmeras IP em residência"
                    className="rounded-xl font-medium"
                  />
                </div>

                {/* Dynamic Questions generated from subcategory */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Perguntas específicas do serviço
                  </h3>

                  {currentSubcategory.perguntas_personalizadas.map((q) => (
                    <div
                      key={q.id}
                      className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200"
                    >
                      <Label className="text-sm font-bold text-slate-800">
                        {q.pergunta} {q.obrigatorio && <span className="text-red-500">*</span>}
                      </Label>

                      {/* Select type */}
                      {q.tipo === 'select' && q.opcoes && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.opcoes.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setDynamicAnswers({ ...dynamicAnswers, [q.id]: opt })}
                              className={`p-2.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition ${
                                dynamicAnswers[q.id] === opt
                                  ? 'border-green-600 bg-white text-green-800 font-bold ring-2 ring-green-600/10'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Boolean type (Sim / Não) */}
                      {q.tipo === 'boolean' && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setDynamicAnswers({ ...dynamicAnswers, [q.id]: true })}
                            className={`p-2.5 rounded-xl border text-center text-sm font-bold transition ${
                              dynamicAnswers[q.id] === true
                                ? 'border-green-600 bg-green-600 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            Sim
                          </button>
                          <button
                            type="button"
                            onClick={() => setDynamicAnswers({ ...dynamicAnswers, [q.id]: false })}
                            className={`p-2.5 rounded-xl border text-center text-sm font-bold transition ${
                              dynamicAnswers[q.id] === false
                                ? 'border-slate-700 bg-slate-800 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            Não
                          </button>
                        </div>
                      )}

                      {q.ajuda && <p className="text-[11px] text-slate-400">{q.ajuda}</p>}
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="descricao">Descrição detalhada do que você precisa</Label>
                  <Textarea
                    id="descricao"
                    rows={4}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva detalhes como pontos de energia próximos, altura do teto, se o material já foi comprado, etc."
                    className="rounded-xl resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PHOTOS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Fotos do local (Opcional)
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Tire fotos do local, do quadro de energia e dos pontos onde deseja os
                  equipamentos.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={handleAddSamplePhoto}
                className="p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-green-500 bg-slate-50/70 hover:bg-green-50/20 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md text-green-600 flex items-center justify-center mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  Clique ou arraste até 6 imagens (máx 5MB cada)
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Formatos JPG, PNG ou WebP. Clique para simular o anexo de fotos reais do imóvel.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-4 border-green-600 text-green-700 hover:bg-green-50 font-semibold"
                >
                  + Adicionar Foto Simulada
                </Button>
              </div>

              {/* Photos Grid */}
              {fotos.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Fotos anexadas ({fotos.length} de 6)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-xs"
                      >
                        <img
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-md"
                          title="Remover foto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Você não adicionou fotos. Não tem problema! Pedidos com fotos recebem propostas
                    até 40% mais rápido, mas você pode continuar normalmente.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: LOCATION & SCHEDULE */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Localização e Horários
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Informe o endereço onde o serviço será realizado para buscar prestadores locais.
                </p>
              </div>

              <div className="space-y-4">
                {/* CEP with lookup */}
                <div className="space-y-1.5">
                  <Label htmlFor="cep">CEP do Imóvel *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      value={cep}
                      onChange={handleCepInput}
                      placeholder="00000-000"
                      maxLength={9}
                      className="rounded-xl font-bold max-w-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleLookupCep(cep)}
                      disabled={searchingCep}
                      className="rounded-xl font-semibold border-slate-300"
                    >
                      {searchingCep ? 'Buscando...' : 'Buscar CEP'}
                    </Button>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Dica de teste: 30130-010 (Belo Horizonte), 01310-100 (São Paulo) ou 22041-011
                    (Rio).
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="logradouro">Rua / Avenida *</Label>
                    <Input
                      id="logradouro"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Ex: Av. Afonso Pena"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Ex: 1200"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="complemento">Complemento (opcional)</Label>
                    <Input
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Apto, Bloco..."
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Belo Horizonte"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Schedules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Melhor horário para contato
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Manhã', 'Tarde', 'Noite', 'Fim de semana'].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHorarioContato(h)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                            horarioContato === h
                              ? 'border-green-600 bg-green-50 text-green-800'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Melhor horário para visita técnica
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Manhã', 'Tarde', 'Noite', 'Fim de semana'].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setHorarioVisita(h)}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                            horarioVisita === h
                              ? 'border-green-600 bg-green-50 text-green-800'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & PUBLISH */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Revise e Publique seu Pedido
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Verifique os dados abaixo antes de enviar para os profissionais locais.
                </p>
              </div>

              {/* Summary Cards with edit links */}
              <div className="space-y-3">
                {/* Section 1 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Serviço Solicitado
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{titulo}</h4>
                    <p className="text-xs text-slate-600">
                      {currentCategory?.nome} • {currentSubcategory?.nome}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-green-600 hover:underline"
                  >
                    Editar
                  </button>
                </div>

                {/* Section 2 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Respostas do Questionário
                    </span>
                    {Object.entries(dynamicAnswers).map(([k, v]) => (
                      <p key={k} className="text-slate-700">
                        <strong className="capitalize">{k.replace('_', ' ')}:</strong>{' '}
                        {typeof v === 'boolean' ? (v ? 'Sim' : 'Não') : String(v)}
                      </p>
                    ))}
                    {descricao && (
                      <p className="text-slate-600 italic mt-1 line-clamp-2">"{descricao}"</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-green-600 hover:underline"
                  >
                    Editar
                  </button>
                </div>

                {/* Section 3 */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Localização e Horários
                    </span>
                    <p className="font-semibold text-slate-800">
                      {logradouro}, {numero} {complemento ? `- ${complemento}` : ''}
                    </p>
                    <p className="text-slate-600">
                      {bairro} - {cidade}/{estado} (CEP {cep})
                    </p>
                    <p className="text-slate-500 pt-1">
                      Contato preferido: <strong>{horarioContato}</strong> • Visita:{' '}
                      <strong>{horarioVisita}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="text-xs font-bold text-green-600 hover:underline"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Inline Quick Auth if not logged in */}
              {!user ? (
                <div className="p-6 bg-green-50/70 border-2 border-green-200 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-slate-900 text-base">
                      Identifique-se para publicar o pedido
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600">
                    Seus dados de contato ficam seguros e só serão liberados para até 3
                    profissionais.
                  </p>

                  {inlineAuthMode === 'login' ? (
                    <form onSubmit={handleInlineLogin} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          type="email"
                          required
                          value={inlineEmail}
                          onChange={(e) => setInlineEmail(e.target.value)}
                          placeholder="Seu e-mail cadastrado"
                          className="bg-white rounded-xl"
                        />
                        <Input
                          type="password"
                          required
                          value={inlineSenha}
                          onChange={(e) => setInlineSenha(e.target.value)}
                          placeholder="Sua senha"
                          className="bg-white rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setInlineAuthMode('register')}
                          className="text-xs font-bold text-green-700 hover:underline"
                        >
                          Não tem conta? Criar conta rápida →
                        </button>
                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        >
                          {authLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleInlineRegister} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          required
                          value={inlineNome}
                          onChange={(e) => setInlineNome(e.target.value)}
                          placeholder="Nome completo"
                          className="bg-white rounded-xl"
                        />
                        <Input
                          required
                          value={inlineTelefone}
                          onChange={(e) => setInlineTelefone(e.target.value)}
                          placeholder="WhatsApp (00) 00000-0000"
                          className="bg-white rounded-xl"
                        />
                        <Input
                          type="email"
                          required
                          value={inlineEmail}
                          onChange={(e) => setInlineEmail(e.target.value)}
                          placeholder="E-mail"
                          className="bg-white rounded-xl"
                        />
                        <Input
                          type="password"
                          required
                          value={inlineSenha}
                          onChange={(e) => setInlineSenha(e.target.value)}
                          placeholder="Crie uma senha (mín 6)"
                          className="bg-white rounded-xl"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setInlineAuthMode('login')}
                          className="text-xs font-bold text-green-700 hover:underline"
                        >
                          Já tem conta? Fazer login →
                        </button>
                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                        >
                          {authLoading ? 'Criando...' : 'Criar Conta Rápida'}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800">
                      Publicando como {user.nome} ({user.email})
                    </span>
                    <p className="text-slate-500">
                      Os profissionais entrarão em contato pelo seu WhatsApp {user.telefone}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Bottom Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl font-semibold border-slate-300"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-6 rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!user || publishing}
                onClick={handlePublish}
                className="bg-green-600 hover:bg-green-700 text-white font-extrabold py-6 px-8 rounded-xl text-base shadow-lg shadow-green-600/30 hover:scale-[1.02] active:scale-95 transition"
              >
                {publishing ? 'Publicando...' : 'Publicar Pedido de Orçamento'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
