import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { Category } from '@/types'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  MapPin,
  CheckCircle2,
  Star,
  ShieldCheck,
  FileText,
  MessageSquare,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react'

export default function Index() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')
  const [cep, setCep] = useState('')

  useEffect(() => {
    let mounted = true
    api.getCategories().then((data) => {
      if (mounted) {
        setCategories(data)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Format CEP mask 00000-000
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8)
    if (raw.length > 5) {
      setCep(`${raw.slice(0, 5)}-${raw.slice(5)}`)
    } else {
      setCep(raw)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('termo', searchTerm.trim())
    if (cep.trim()) params.append('cep', cep.trim())
    navigate(`/pedido/novo?${params.toString()}`)
  }

  const testimonials = [
    {
      nome: 'Juliana Mendes',
      cidade: 'Belo Horizonte, MG',
      servico: 'Instalação de 4 Câmeras CFTV',
      estrelas: 5,
      comentario:
        'Recebi 3 orçamentos no mesmo dia! O técnico Carlos foi pontual, organizou todos os cabos e me ensinou a usar o app no celular. Experiência fantástica!',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=12',
    },
    {
      nome: 'Rodrigo Alencar',
      cidade: 'São Paulo, SP',
      servico: 'Troca de Quadro de Disjuntores',
      estrelas: 5,
      comentario:
        'Meu chuveiro vivia desarmando. Pelo ServiçoJá achei um eletricista com certificação NR-10 que resolveu em menos de 2 horas. Muito seguro e transparente.',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=33',
    },
    {
      nome: 'Patrícia Castro',
      cidade: 'Rio de Janeiro, RJ',
      servico: 'Manutenção de Portão Automático',
      estrelas: 5,
      comentario:
        'Adorei o fato de não ficar recebendo dezenas de ligações chatas. No máximo 3 profissionais entram em contato pelo WhatsApp e você escolhe o melhor.',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=44',
    },
  ]

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center bg-gradient-to-b from-sky-50 via-emerald-50/20 to-slate-50 pt-6 pb-20">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-green-200/20 to-sky-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Pitch */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-full flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  Profissionais Verificados
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-sky-50 text-sky-700 border-sky-200 py-1.5 px-3 text-xs sm:text-sm font-semibold rounded-full flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  Até 3 orçamentos por pedido
                </Badge>
              </div>

              {/* Main Headline */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Encontre profissionais de confiança{' '}
                  <span className="relative inline-block text-slate-900">
                    para o seu dia a dia
                    <span className="absolute left-0 bottom-1 w-full h-3 bg-green-400/30 -z-10 rounded-sm transform -rotate-1" />
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Compare orçamentos, escolha o melhor preço e contrate com segurança. Instalação de
                câmeras, eletricistas, reparos e segurança eletrônica na sua região.
              </p>

              {/* 2. SEARCH BAR CARD */}
              <div id="HeroSearch" className="w-full pt-2">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3 transition-shadow hover:shadow-2xl"
                >
                  <div className="relative flex-1 w-full">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="O que você precisa? Ex: Câmeras CFTV, Eletricista..."
                      className="pl-11 pr-4 py-6 rounded-xl border-slate-200 focus-visible:ring-green-500 text-sm sm:text-base font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative w-full sm:w-44">
                    <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      placeholder="CEP 00000-000"
                      maxLength={9}
                      className="pl-11 pr-3 py-6 rounded-xl border-slate-200 focus-visible:ring-green-500 text-sm sm:text-base font-medium placeholder:text-slate-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-600/25 hover:scale-[1.02] active:scale-95 transition whitespace-nowrap"
                  >
                    Buscar Profissionais
                  </Button>
                </form>

                {/* Popular tags below search */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500 justify-center lg:justify-start">
                  <span className="font-semibold text-slate-600">Mais buscados:</span>
                  <Link
                    to="/pedido/novo?categoria=cameras-cftv"
                    className="px-2.5 py-1 bg-white/80 hover:bg-white rounded-md border border-slate-200 hover:text-green-600 transition"
                  >
                    Instalação de Câmeras
                  </Link>
                  <Link
                    to="/pedido/novo?categoria=eletricista"
                    className="px-2.5 py-1 bg-white/80 hover:bg-white rounded-md border border-slate-200 hover:text-green-600 transition"
                  >
                    Quadro Elétrico
                  </Link>
                  <Link
                    to="/pedido/novo?categoria=portao-automatico"
                    className="px-2.5 py-1 bg-white/80 hover:bg-white rounded-md border border-slate-200 hover:text-green-600 transition"
                  >
                    Motor de Portão
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards (Floating animation 3s) */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center min-h-[440px]">
              {/* Backing glow circle */}
              <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-green-500/10 to-blue-500/10 absolute -z-10 blur-xl" />

              {/* Stacked floating UI cards */}
              <div className="relative w-full max-w-sm flex flex-col gap-4">
                {/* Floating Card 1: Solicitação enviada */}
                <div className="animate-float bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 flex items-center gap-3.5 transform -translate-x-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                      Solicitação enviada
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Instalação de 4 Câmeras CFTV IP
                    </span>
                    <span className="text-xs text-slate-400">Belo Horizonte, MG • há 10 min</span>
                  </div>
                </div>

                {/* Floating Card 2: Proposta recebida */}
                <div className="animate-float-delayed bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-green-200 shadow-xl shadow-green-900/5 flex items-center justify-between gap-3 transform translate-x-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-green-500 shrink-0">
                      <img
                        src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2"
                        alt="Carlos Lima"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-900">Carlos Lima</span>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1.5 py-0 h-4">
                          ✓ Pro
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">Técnico em CFTV e Eletricista</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400 block">Proposta</span>
                    <span className="text-base font-extrabold text-green-600">R$ 750,00</span>
                  </div>
                </div>

                {/* Floating Card 3: Avaliação 5.0 */}
                <div className="animate-float-slow bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/60 flex items-center gap-3.5 transform -translate-x-2">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 fill-amber-500 stroke-amber-500" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-slate-900">Avaliação 5.0</span>
                      <div className="flex text-amber-500">
                        {'★★★★★'.split('').map((s, i) => (
                          <span key={i} className="text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 italic line-clamp-1">
                      "Serviço impecável e sem fios aparentes!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION (Anchor "Categorias") */}
      <section id="Categorias" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold uppercase tracking-wider text-xs">
                Especialidades
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                O que você precisa hoje?
              </h2>
              <p className="text-slate-600 max-w-xl text-base">
                Selecione uma categoria para descrever seu pedido e receber orçamentos de
                profissionais certificados e avaliados.
              </p>
            </div>
            <Link
              to="/pedido/novo"
              className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 group whitespace-nowrap"
            >
              Ver todas as categorias
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/pedido/novo?categoria=${cat.slug}`}
                  className="group relative bg-slate-50/70 hover:bg-white p-6 rounded-2xl border border-slate-200 hover:border-green-400 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-13 h-13 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200"
                      style={{ backgroundColor: `${cat.cor}15`, color: cat.cor }}
                    >
                      <CategoryIcon name={cat.icone} className="w-7 h-7 stroke-[2]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                      {cat.nome}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {cat.descricao}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-green-600">
                    <span>{cat.subcategorias?.length || 0} serviços</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Pedir Orçamento →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS (Anchor "Como Funciona") */}
      <section id="Como Funciona" className="py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-bold uppercase tracking-wider text-xs">
              Passo a Passo
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Como funciona o ServiçoJá?
            </h2>
            <p className="text-slate-600 text-base">
              Em apenas 3 etapas simples você resolve seu problema sem perder tempo com dezenas de
              orçamentos desnecessários.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-card border border-slate-200 flex flex-col items-center text-center">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-green-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 mt-2">
                <FileText className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Descreva o serviço</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Responda a perguntas rápidas sobre o seu imóvel, quantidade de pontos e horários
                preferenciais para visita técnica.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-card border border-slate-200 flex flex-col items-center text-center">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-green-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6 mt-2">
                <MessageSquare className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Receba até 3 orçamentos</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Apenas os 3 primeiros profissionais mais próximos e qualificados desbloqueiam o seu
                contato diretamente no WhatsApp.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-card border border-slate-200 flex flex-col items-center text-center">
              <div className="absolute -top-5 w-10 h-10 rounded-full bg-green-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 mt-2">
                <Award className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Escolha e avalie</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compare os perfis, portfólios e avaliações reais. Após a conclusão, avalie o
                prestador e ajude a comunidade.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl text-base shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition"
            >
              <Link to="/pedido/novo">Fazer Pedido de Serviço Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 5. FOR PROFESSIONALS SECTION (Anchor "Para Profissionais") */}
      <section id="Para Profissionais" className="py-20 bg-slate-900 text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-wider text-xs font-bold">
                Parceiros de Sucesso
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Seja um profissional parceiro no ServiçoJá
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Aumente sua carteira de clientes sem mensalidades abusivas. Receba notificações de
                pedidos abertos na sua região e fale direto pelo WhatsApp com o cliente.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Receba pedidos da sua região</h4>
                    <p className="text-sm text-slate-400">
                      Filtre por distância em km e aceite apenas trabalhos convenientes para a sua
                      rota.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      Escolha os serviços que atende
                    </h4>
                    <p className="text-sm text-slate-400">
                      Configure suas especialidades (CFTV, Eletricista, Alarmes) e receba apenas
                      demandas compatíveis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">
                      Divulgue portfólio e conquiste avaliações
                    </h4>
                    <p className="text-sm text-slate-400">
                      Crie um perfil público profissional verificado com fotos de instalações e
                      certificados técnicos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-6 px-8 rounded-xl text-base shadow-lg shadow-green-600/30 hover:scale-[1.02] active:scale-95 transition text-center"
                >
                  <Link to="/cadastro?papel=profissional">Quero ser profissional parceiro</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 py-6 px-6 rounded-xl font-semibold"
                >
                  <Link to="/pedidos-disponiveis">Ver Pedidos Disponíveis</Link>
                </Button>
              </div>
            </div>

            {/* Right Mock Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500 animate-ping" />
                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
                      Novo pedido agora
                    </span>
                  </div>
                  <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                    Há 12 min
                  </Badge>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
                    <CategoryIcon name="Camera" className="w-4 h-4" />
                    <span>Câmeras e CFTV • Instalação</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Instalação de 4 câmeras IP em residência
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2">
                    Passar fiação externa e configurar acesso remoto no celular da cliente...
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      Belo Horizonte, MG (a 4 km de você)
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">1 de 3 vagas preenchidas</span>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-sm"
                    asChild
                  >
                    <Link to="/pedidos-disponiveis">Liberar Contato</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 font-bold uppercase tracking-wider text-xs">
              Depoimentos Reais
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Quem contratou, recomenda
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Milhares de clientes satisfeitos encontrando os melhores especialistas para seus
              lares.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: t.estrelas }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                    "{t.comentario}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <img
                    src={t.avatar}
                    alt={t.nome}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{t.nome}</span>
                    <span className="text-xs text-slate-500">{t.cidade}</span>
                    <span className="text-[11px] font-medium text-green-700">{t.servico}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 text-white relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Pronto para encontrar seu profissional?
            </h3>
            <p className="text-green-100 text-base">
              Publique seu pedido grátis em menos de 2 minutos e receba até 3 orçamentos no seu
              WhatsApp.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-slate-100 text-green-700 font-extrabold px-8 py-7 rounded-xl text-lg shadow-xl shadow-green-900/30 hover:scale-[1.02] active:scale-95 transition"
          >
            <Link to="/pedido/novo">Solicitar Orçamento Grátis</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
