import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '@/services/api'
import { ServiceRequest, ProviderProfile, User, Review } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ReviewPage() {
  const { requestId, providerId } = useParams<{ requestId: string; providerId: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [request, setRequest] = useState<ServiceRequest | null>(null)
  const [provider, setProvider] = useState<(ProviderProfile & { user: User }) | null>(null)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)

  const [nota, setNota] = useState<number>(5)
  const [hoverNota, setHoverNota] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const ratingLabels: Record<number, string> = {
    1: 'Péssimo',
    2: 'Ruim',
    3: 'Regular',
    4: 'Bom',
    5: 'Excelente',
  }

  useEffect(() => {
    if (!requestId || !providerId || !user) return

    Promise.all([
      api.getRequestById(requestId),
      api.getProviderProfile(providerId),
      api.getReview(requestId, user.id),
    ]).then(([req, prov, rev]) => {
      setRequest(req)
      setProvider(prov)
      if (rev) {
        setExistingReview(rev)
        setNota(rev.nota)
        setComentario(rev.comentario)
      }
      setLoading(false)
    })
  }, [requestId, providerId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !requestId || !providerId) return

    setSubmitting(true)
    try {
      await api.createReview({
        request_id: requestId,
        cliente_id: user.id,
        provider_id: providerId,
        nota,
        comentario,
      })

      toast({
        title: 'Avaliação enviada com sucesso!',
        description: 'Obrigado por ajudar outros clientes com sua opinião.',
      })

      navigate('/painel/cliente')
    } catch (err: any) {
      toast({
        title: 'Erro ao enviar avaliação',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-card border border-slate-200 space-y-8">
        <Link
          to={`/pedido/${requestId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-green-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Pedido
        </Link>

        {/* Provider Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg mx-auto">
            <img
              src={
                provider?.user.foto ||
                'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=99'
              }
              alt={provider?.user.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {provider?.user.nome}
              </h1>
              {provider?.documentos_validados && (
                <ShieldCheck className="w-5 h-5 text-green-600 fill-green-100" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Serviço realizado: <strong>{request?.titulo}</strong>
            </p>
          </div>
        </div>

        {existingReview ? (
          <div className="p-6 bg-green-50/70 border border-green-200 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Você já avaliou este atendimento</h3>
            <div className="flex justify-center gap-1 text-amber-500">
              {Array.from({ length: existingReview.nota }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-400" />
              ))}
            </div>
            {existingReview.comentario && (
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-green-100">
                "{existingReview.comentario}"
              </p>
            )}
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
            >
              <Link to="/painel/cliente">Voltar ao Meu Painel</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Interactive Stars */}
            <div className="text-center space-y-3">
              <Label className="text-sm font-bold text-slate-700 block">
                Como foi sua experiência geral com o profissional?
              </Label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverNota !== null ? hoverNota : nota) >= star
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverNota(star)}
                      onMouseLeave={() => setHoverNota(null)}
                      onClick={() => setNota(star)}
                      className="p-1 hover:scale-125 transition-transform duration-150 focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 stroke-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Star rating label */}
              <span className="text-sm font-bold text-amber-600 block transition-all">
                {ratingLabels[hoverNota || nota]}
              </span>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="comentario">Deixe um comentário (opcional)</Label>
                <span className="text-xs text-slate-400">{comentario.length}/500</span>
              </div>
              <Textarea
                id="comentario"
                rows={4}
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte o que achou da pontualidade, da qualidade do serviço e da comunicação do técnico..."
                className="rounded-2xl resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-2xl shadow-md hover:scale-[1.01] active:scale-98 transition text-base"
            >
              {submitting ? 'Enviando avaliação...' : 'Enviar Avaliação'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
