export type UserRole = 'admin' | 'funcionario'

export interface User {
  id: string
  nome: string
  email: string
  papel: UserRole
  ativo: boolean
  data_criacao: string
  foto?: string
  telefone?: string
}

export type ProfessionalCategory =
  | 'CFTV e Câmeras'
  | 'Eletricista'
  | 'Reparos Gerais'
  | 'Segurança Eletrônica'

export interface Professional {
  id: string
  nome: string
  categoria: ProfessionalCategory
  especialidades: string[]
  avaliacao: number
  total_avaliacoes: number
  telefone: string
  whatsapp: string // Formato numérico para wa.me, ex: '5511999998888'
  email?: string
  site?: string
  endereco_completo: string
  bairro: string
  cidade: string
  uf: string
  cep?: string
  horario_funcionamento?: string
  descricao: string
  verificado_google?: boolean
  preco_nivel?: '$' | '$$' | '$$$'
  fonte: 'demo' | 'google_places'
}

export type FollowUpStatus = 'Novo' | 'Contatado' | 'Em negociação' | 'Fechado' | 'Descartado'

export interface SavedProfessionalItem {
  id: string // id do registro salvo
  professionalId: string
  professional: Professional
  status: FollowUpStatus
  notas: string
  data_salvo: string
  ultima_atualizacao: string
  salvo_por: {
    userId: string
    nome: string
  }
}

export interface GoogleApiConfig {
  apiKey: string
  isEnabled: boolean
  lastTested?: string
}
