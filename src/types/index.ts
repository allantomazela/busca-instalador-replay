export type UserRole = 'cliente' | 'profissional' | 'admin'

export interface User {
  id: string
  nome: string
  email: string
  telefone: string
  papel: UserRole
  foto?: string
  data_criacao: string
  banido: boolean
}

export interface ProviderProfile {
  user_id: string
  bio: string
  categorias: string[] // slugs
  cidade: string
  uf: string
  raio_km: number
  documentos_validados: boolean
  avaliacao_media: number
  total_avaliacoes: number
  certificados: { nome: string; url?: string }[]
  portfolio: { id: string; url: string; titulo: string }[]
  tipo_atuacao?: 'Pessoa Física' | 'MEI' | 'Empresa'
  cnpj?: string
}

export type QuestionType = 'select' | 'boolean' | 'text' | 'textarea' | 'number'

export interface DynamicQuestion {
  id: string
  pergunta: string
  tipo: QuestionType
  opcoes?: string[]
  obrigatorio?: boolean
  ajuda?: string
}

export interface Subcategory {
  id: string
  categoria_id: string
  nome: string
  slug: string
  perguntas_personalizadas: DynamicQuestion[]
}

export interface Category {
  id: string
  nome: string
  slug: string
  icone: string
  cor: string
  descricao: string
  subcategorias: Subcategory[]
}

export type RequestStatus = 'aberto' | 'em_negociacao' | 'fechado' | 'cancelado'

export interface ServiceRequest {
  id: string
  cliente_id: string
  categoria_id: string
  subcategoria_id: string
  titulo: string
  descricao: string
  respostas_dinamicas: Record<string, any>
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
  fotos: string[]
  horario_contato: string
  horario_visita: string
  status: RequestStatus
  data_criacao: string
  propostas_count: number
  desbloqueado_por?: string[] // provider user ids
}

export type ProposalStatus = 'enviada' | 'aceita' | 'recusada'

export interface Proposal {
  id: string
  request_id: string
  provider_id: string
  valor_estimado: number
  mensagem: string
  data_envio: string
  status: ProposalStatus
}

export interface Review {
  id: string
  request_id: string
  cliente_id: string
  provider_id: string
  nota: number // 1 to 5
  comentario: string
  data: string
}

export interface CepInfo {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  uf: string
}
