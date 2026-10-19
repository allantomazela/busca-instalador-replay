import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { ProviderProfile, User, Review, Category, ServiceRequest } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { CategoryIcon } from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  FileCheck,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react'

export default function PublicProviderProfile() {
  const { providerProfileId } = useParams<{ providerProfileId: string }>()
  const { user } = useAuth()

  const [provider, setProvider] = useState<(ProviderProfile & { user: User }) | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeRequestWithClient, setActiveRequestWithClient] = useState<ServiceRequest | null>(
    null,
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!providerProfileId) return
    setLoading(true)

    Promise.all([
      api.getProviderProfile(providerProfileId),
      api.listReviewsByProvider(providerProfileId),
      api.getCategories(),
    ]).then(async ([prof, revs, cats]) => {
      setProvider(prof)
      setReviews(revs)
      setCategories(cats)

      // If client is logged in, check if they have a request in negotiation with this provider
      if (user && user.papel === 'cliente') {
        const clientReqs = await api.listRequests({ cliente_id: user.id })
        const matching = clientReqs.find(
          (r) => r.desbloqueado_por?.includes(providerProfileId) && r.status === 'em_negociacao',
        )
        if (matching) setActiveRequestWithClient(matching)
      }
      setLoading(false)
    })
  }, [providerProfileId, user])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 space-y-6">
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-800">Perfil não encontrado</h2>
        <p className="text-sm text-slate-500">
          O prestador solicitado não foi encontrado na plataforma.
        </p>
        <Button asChild className="bg-green-600 text-white rounded-xl">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    )
  }

  const cleanPhone = provider.user.telefone.replace(/\D/g, '')

  return (
    <div className="min-h-[85vh] bg-slate-50 pb-16">
      {/* 1. Cover Banner (Gradient Navy -> Green) */}
      <div className="w-full bg-gradient-to-r from-slate-950 via-slate-900 to-green-950 text-white pt-12 pb-24 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto">
          {/* Active Negotiation Banner if applicable */}
          {activeRequestWithClient && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/40 rounded-2xl backdrop-blur-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-green-200">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span>
                  Vocês estão em negociação no pedido{' '}
                  <strong>"{activeRequestWithClient.titulo}"</strong>
                </span>
              </div>
              <Button
                size="sm"
                asChild
                className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-xs whitespace-nowrap"
              >
                <Link to={`/pedido/${activeRequestWithClient.id}`}>Ver Pedido</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Profile Card Overlapping Cover */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-card border border-slate-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Big Avatar */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0 -mt-14 sm:-mt-20 bg-slate-100">
              <img
                src={
                  provider.user.foto || 'https://img.usecurling.com/ppl/large?gender=male&seed=2'
                }
                alt={provider.user.nome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Badges */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {provider.user.nome}
                </h1>
                {provider.documentos_validados && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                    Profissional Verificado
                  </Badge>
                )}
                {provider.tipo_atuacao && (
                  <Badge variant="outline" className="text-slate-500 text-xs">
                    {provider.tipo_atuacao}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-bold text-amber-600 text-sm">
                  <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                  {provider.avaliacao_media.toFixed(1)}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({provider.total_avaliacoes} avaliações)
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {provider.cidade}, {provider.uf}
                </span>
                <span>•</span>
                <span>Atende raio de até {provider.raio_km} km</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-2xl shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition"
            >
              <a
                href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                  `Olá ${provider.user.nome}! Encontrei seu perfil no ServiçoJá e gostaria de um orçamento.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Conversar no WhatsApp
              </a>
            </Button>
          </div>
        </div>

        {/* 3. About & Specialities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-3">
              <h3 className="text-base font-bold text-slate-900">Sobre o Profissional</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {provider.bio || 'Profissional parceiro cadastrado e atuante no ServiçoJá.'}
              </p>
            </div>

            {/* Portfolio Grid */}
            {provider.portfolio && provider.portfolio.length > 0 && (
              <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Portfólio de Serviços Realizados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {provider.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl overflow-hidden border border-slate-200 group"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                          {item.titulo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Reviews List */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Avaliações de Clientes ({reviews.length})
                </h3>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                  {provider.avaliacao_media.toFixed(1)} / 5.0
                </div>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Este prestador ainda não recebeu avaliações na plataforma.
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.nota }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(rev.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {rev.comentario && (
                        <p className="text-xs text-slate-700 italic leading-relaxed">
                          "{rev.comentario}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Specialities & Certifications */}
          <div className="space-y-6">
            {/* Categories chips */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                Especialidades Atendidas
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.categorias.map((catSlug) => {
                  const cat = categories.find((c) => c.slug === catSlug)
                  return (
                    <span
                      key={catSlug}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {cat && (
                        <CategoryIcon name={cat.icone} className="w-3.5 h-3.5 text-green-600" />
                      )}
                      {cat ? cat.nome : catSlug}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Certifications list */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-green-600" />
                Certificações Técnicas
              </h3>
              {provider.certificados && provider.certificados.length > 0 ? (
                <div className="space-y-2">
                  {provider.certificados.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 bg-green-50/60 rounded-xl border border-green-200/80 text-xs text-green-950 font-medium"
                    >
                      <FileCheck className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate">{cert.nome}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Nenhum certificado listado.</p>
              )}
            </div>

            {/* Coverage info */}
            <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900">Raio de Atendimento</h4>
              <p>
                Atende até <strong>{provider.raio_km} km</strong> a partir do centro de{' '}
                <strong>
                  {provider.cidade}/{provider.uf}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
