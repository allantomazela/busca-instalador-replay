import { Professional, ProfessionalCategory, GoogleApiConfig } from '@/types'
import { DEMO_PROFESSIONALS } from './demoProfessionals'

const GOOGLE_CONFIG_KEY = 'servicoja_google_api_config'

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export const searchService = {
  getGoogleConfig(): GoogleApiConfig {
    try {
      const raw = localStorage.getItem(GOOGLE_CONFIG_KEY)
      if (!raw) {
        return { apiKey: '', isEnabled: false }
      }
      return JSON.parse(raw) as GoogleApiConfig
    } catch {
      return { apiKey: '', isEnabled: false }
    }
  },

  saveGoogleConfig(config: GoogleApiConfig): void {
    try {
      localStorage.setItem(GOOGLE_CONFIG_KEY, JSON.stringify(config))
    } catch (e) {
      console.error('Erro ao salvar configuração do Google:', e)
    }
  },

  /**
   * Ponto isolado de chamada à Google Places API (Text Search / Nearby Search)
   * Quando houver backend ou chave configurada pelo admin, esta função executará
   * a chamada HTTP real. No frontend, chamadas diretas com chave podem esbarrar em CORS
   * caso a Google exija proxy backend, por isso a arquitetura está preparada e isolada.
   */
  async executeGooglePlacesSearch(
    query: string,
    location: string,
    apiKey: string,
  ): Promise<Professional[]> {
    // Isolamento da chamada externa
    // Em produção com backend ou Edge Function:
    // const res = await fetch(`/api/places-search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`, ...)
    console.info(
      `[Google Places API isolada] Buscando "${query}" em "${location}" com chave terminada em ...${apiKey.slice(-4)}`,
    )

    // Como a chave ainda não está validada com backend, simulamos o fallback elegante
    return []
  },

  async searchProfessionals(params: {
    termo?: string
    localidade?: string
    categoria?: string
  }): Promise<{
    results: Professional[]
    total: number
    isDemoMode: boolean
    searchedGoogle: boolean
  }> {
    // Simula o tempo de resposta (~400ms solicitado no briefing)
    await delay(400)

    const config = this.getGoogleConfig()
    const hasActiveKey = Boolean(
      config.apiKey && config.apiKey.trim().length > 10 && config.isEnabled,
    )

    const termo = (params.termo || '').trim().toLowerCase()
    const localidade = (params.localidade || '').trim().toLowerCase()
    const categoria = (params.categoria || 'Todos').trim()

    // Se tiver chave ativa configurada futuramente, tenta a Places API
    if (hasActiveKey) {
      try {
        const googleResults = await this.executeGooglePlacesSearch(
          `${categoria !== 'Todos' ? categoria : ''} ${termo}`.trim(),
          localidade,
          config.apiKey,
        )
        if (googleResults.length > 0) {
          return {
            results: googleResults,
            total: googleResults.length,
            isDemoMode: false,
            searchedGoogle: true,
          }
        }
      } catch (err) {
        console.warn('Falha na chamada ao Google Places, recorrendo ao dataset:', err)
      }
    }

    // Modo demonstração (padrão)
    let filtered = [...DEMO_PROFESSIONALS]

    if (categoria && categoria !== 'Todos') {
      filtered = filtered.filter((p) => p.categoria.toLowerCase() === categoria.toLowerCase())
    }

    if (termo) {
      filtered = filtered.filter((p) => {
        const inNome = p.nome.toLowerCase().includes(termo)
        const inDesc = p.descricao.toLowerCase().includes(termo)
        const inEsp = p.especialidades.some((e) => e.toLowerCase().includes(termo))
        const inCat = p.categoria.toLowerCase().includes(termo)
        return inNome || inDesc || inEsp || inCat
      })
    }

    if (localidade) {
      filtered = filtered.filter((p) => {
        const inCidade = p.cidade.toLowerCase().includes(localidade)
        const inUf = p.uf.toLowerCase().includes(localidade)
        const inBairro = p.bairro.toLowerCase().includes(localidade)
        const inCep = p.cep?.replace(/\D/g, '').includes(localidade.replace(/\D/g, '')) || false
        return inCidade || inUf || inBairro || inCep
      })
    }

    return {
      results: filtered,
      total: filtered.length,
      isDemoMode: !hasActiveKey,
      searchedGoogle: hasActiveKey,
    }
  },

  async getProfessionalById(id: string): Promise<Professional | null> {
    await delay(150)
    const found = DEMO_PROFESSIONALS.find((p) => p.id === id)
    return found ? { ...found } : null
  },

  getAllCategories(): ProfessionalCategory[] {
    return ['CFTV e Câmeras', 'Eletricista', 'Reparos Gerais', 'Segurança Eletrônica']
  },
}
