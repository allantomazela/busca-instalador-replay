import { User, ProviderProfile, Category, ServiceRequest, Proposal, Review, CepInfo } from '@/types'

// Helper for simulated network delay (~300ms)
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

// CEP Mock Database
const CEP_DATABASE: Record<string, CepInfo> = {
  '30130-010': {
    cep: '30130-010',
    logradouro: 'Avenida Afonso Pena',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    uf: 'MG',
  },
  '01310-100': {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  '22041-011': {
    cep: '22041-011',
    logradouro: 'Avenida Nossa Senhora de Copacabana',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
}

// In-Memory Seed State
let mockUsers: (User & { senha_hash: string })[] = [
  {
    id: 'user-ana',
    nome: 'Ana Silva',
    email: 'ana.silva@email.com',
    telefone: '(31) 98765-4321',
    papel: 'cliente',
    foto: 'https://img.usecurling.com/ppl/medium?gender=female&seed=1',
    data_criacao: '2025-01-15T10:00:00Z',
    banido: false,
    senha_hash: '123456',
  },
  {
    id: 'user-carlos',
    nome: 'Carlos Lima',
    email: 'carlos.lima@email.com',
    telefone: '(31) 99123-4567',
    papel: 'profissional',
    foto: 'https://img.usecurling.com/ppl/medium?gender=male&seed=2',
    data_criacao: '2024-11-20T14:30:00Z',
    banido: false,
    senha_hash: '123456',
  },
  {
    id: 'user-admin',
    nome: 'Administrador Geral',
    email: 'admin@servicoja.com',
    telefone: '(11) 98888-0000',
    papel: 'admin',
    foto: 'https://img.usecurling.com/ppl/medium?gender=male&seed=3',
    data_criacao: '2024-01-01T08:00:00Z',
    banido: false,
    senha_hash: '123456',
  },
  {
    id: 'user-marcos',
    nome: 'Marcos Souza',
    email: 'marcos.souza@email.com',
    telefone: '(11) 97654-3210',
    papel: 'profissional',
    foto: 'https://img.usecurling.com/ppl/medium?gender=male&seed=4',
    data_criacao: '2025-02-01T09:00:00Z',
    banido: false,
    senha_hash: '123456',
  },
]

let mockProviderProfiles: ProviderProfile[] = [
  {
    user_id: 'user-carlos',
    bio: 'Especialista em segurança eletrônica, CFTV analógico e IP, alarmes monitorados e instalações elétricas residenciais e comerciais há mais de 10 anos. Trabalho com padrões técnicos rigorosos e garantia de 1 ano em todos os serviços.',
    categorias: ['cameras-cftv', 'eletricista', 'seguranca-eletronica'],
    cidade: 'Belo Horizonte',
    uf: 'MG',
    raio_km: 35,
    documentos_validados: true,
    avaliacao_media: 4.9,
    total_avaliacoes: 28,
    certificados: [
      { nome: 'Certificação Técnica CFTV Intelbras IP' },
      { nome: 'NR-10 Segurança em Instalações Elétricas' },
      { nome: 'NR-35 Trabalho em Altura' },
    ],
    portfolio: [
      {
        id: 'port-1',
        url: 'https://img.usecurling.com/p/600/400?q=cctv+camera+installation',
        titulo: 'Instalação de 8 câmeras IP em condomínio residencial',
      },
      {
        id: 'port-2',
        url: 'https://img.usecurling.com/p/600/400?q=electrical+panel+wiring',
        titulo: 'Reforma completa de quadro elétrico e disjuntores',
      },
    ],
    tipo_atuacao: 'MEI',
    cnpj: '45.123.456/0001-89',
  },
  {
    user_id: 'user-marcos',
    bio: 'Técnico em cabeamento estruturado e redes de alta velocidade, automação de portões e interfonia predial. Atendimento ágil e orçamentos justos para toda grande São Paulo.',
    categorias: ['cabeamento-rede', 'portao-automatico', 'interfone'],
    cidade: 'São Paulo',
    uf: 'SP',
    raio_km: 40,
    documentos_validados: true,
    avaliacao_media: 4.8,
    total_avaliacoes: 19,
    certificados: [
      { nome: 'Certificado Furukawa Data Cabling System' },
      { nome: 'NR-10 Segurança Elétrica' },
    ],
    portfolio: [
      {
        id: 'port-3',
        url: 'https://img.usecurling.com/p/600/400?q=server+rack+network',
        titulo: 'Rack de cabeamento estruturado Cat6 para escritório',
      },
    ],
    tipo_atuacao: 'Pessoa Física',
  },
]

let mockCategories: Category[] = [
  {
    id: 'cat-cameras',
    nome: 'Câmeras e CFTV',
    slug: 'cameras-cftv',
    icone: 'Camera',
    cor: '#0EA5E9',
    descricao: 'Instalação, manutenção de câmeras de segurança, DVRs e visualização remota.',
    subcategorias: [
      {
        id: 'sub-inst-cameras',
        categoria_id: 'cat-cameras',
        nome: 'Instalação de Câmeras',
        slug: 'instalacao-cameras',
        perguntas_personalizadas: [
          {
            id: 'qtd_cameras',
            pergunta: 'Quantas câmeras você precisa instalar?',
            tipo: 'select',
            opcoes: ['1 a 2 câmeras', '3 a 4 câmeras', '5 a 8 câmeras', 'Mais de 8 câmeras'],
            obrigatorio: true,
          },
          {
            id: 'tipo_imovel',
            pergunta: 'Qual o tipo de imóvel?',
            tipo: 'select',
            opcoes: ['Casa', 'Apartamento', 'Comércio / Loja', 'Empresa / Galpão', 'Condomínio'],
            obrigatorio: true,
          },
          {
            id: 'fiacao_passada',
            pergunta: 'Já existe fiação ou tubulação passada?',
            tipo: 'boolean',
            obrigatorio: true,
            ajuda: 'Selecione SIM se já tiver conduítes livres no local.',
          },
          {
            id: 'precisa_dvr',
            pergunta: 'Precisa de gravador (DVR/NVR) incluso?',
            tipo: 'boolean',
            obrigatorio: true,
          },
          {
            id: 'pe_direito',
            pergunta: 'Pé-direito aproximado do local:',
            tipo: 'select',
            opcoes: ['Até 3 metros (padrão)', 'De 3 a 5 metros', 'Acima de 5 metros'],
            obrigatorio: false,
          },
        ],
      },
      {
        id: 'sub-manut-cameras',
        categoria_id: 'cat-cameras',
        nome: 'Manutenção / Reparo de Câmeras',
        slug: 'manutencao-cameras',
        perguntas_personalizadas: [
          {
            id: 'problema',
            pergunta: 'Qual o principal problema identificado?',
            tipo: 'select',
            opcoes: [
              'Câmera sem sinal / tela preta',
              'Imagem chuviscada ou travando',
              'DVR não grava ou não liga',
              'Acesso remoto pelo celular parou',
            ],
            obrigatorio: true,
          },
          {
            id: 'qtd_cameras_afetadas',
            pergunta: 'Quantos pontos apresentam defeito?',
            tipo: 'select',
            opcoes: ['1 ponto', '2 a 3 pontos', 'Todas as câmeras'],
            obrigatorio: true,
          },
        ],
      },
      {
        id: 'sub-cameras-wifi',
        categoria_id: 'cat-cameras',
        nome: 'Câmeras Wi-Fi / Sem Fio',
        slug: 'cameras-wifi',
        perguntas_personalizadas: [
          {
            id: 'possui_aparelho',
            pergunta: 'Você já possui as câmeras ou quer que o profissional forneça?',
            tipo: 'select',
            opcoes: [
              'Já possuo as câmeras (só instalação e configuração)',
              'Quero recomendação e compra com o profissional',
            ],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-eletricista',
    nome: 'Eletricista',
    slug: 'eletricista',
    icone: 'Zap',
    cor: '#F59E0B',
    descricao: 'Quadros elétricos, disjuntores, fiação, tomadas, iluminação e reparos.',
    subcategorias: [
      {
        id: 'sub-troca-disjuntor',
        categoria_id: 'cat-eletricista',
        nome: 'Troca de Disjuntor e Quadro Elétrico',
        slug: 'troca-disjuntor',
        perguntas_personalizadas: [
          {
            id: 'motivo_troca',
            pergunta: 'Qual a razão do serviço?',
            tipo: 'select',
            opcoes: [
              'Disjuntor desarmando com frequência',
              'Quadro antigo necessitando modernização',
              'Aumento de carga / novo chuveiro ou ar condicionado',
              'Cheiro de queimado ou curto',
            ],
            obrigatorio: true,
          },
          {
            id: 'tipo_imovel',
            pergunta: 'Tipo de imóvel:',
            tipo: 'select',
            opcoes: ['Apartamento', 'Casa térrea', 'Sobrado', 'Comércio'],
            obrigatorio: true,
          },
        ],
      },
      {
        id: 'sub-instalacao-eletrica',
        categoria_id: 'cat-eletricista',
        nome: 'Instalação Elétrica Completa',
        slug: 'instalacao-eletrica-completa',
        perguntas_personalizadas: [
          {
            id: 'tamanho_imovel',
            pergunta: 'Área aproximada do imóvel (m²):',
            tipo: 'select',
            opcoes: ['Até 50 m²', '50 a 100 m²', '100 a 200 m²', 'Acima de 200 m²'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-reparos',
    nome: 'Reparos Domésticos',
    slug: 'reparos-domesticos',
    icone: 'Wrench',
    cor: '#F97316',
    descricao: 'Pequenos consertos, marido de aluguel, suportes de TV e instalações gerais.',
    subcategorias: [
      {
        id: 'sub-suporte-tv',
        categoria_id: 'cat-reparos',
        nome: 'Instalação de Suporte de TV e Quadros',
        slug: 'instalacao-suporte-tv',
        perguntas_personalizadas: [
          {
            id: 'tipo_parede',
            pergunta: 'Tipo da parede onde será fixado:',
            tipo: 'select',
            opcoes: [
              'Alvenaria / Tijolo comum',
              'Drywall / Gesso acartonado',
              'Concreto maciço',
              'Painel de madeira / MDF',
            ],
            obrigatorio: true,
          },
        ],
      },
      {
        id: 'sub-pequenos-consertos',
        categoria_id: 'cat-reparos',
        nome: 'Pequenos Consertos e Reparos Gerais',
        slug: 'pequenos-consertos',
        perguntas_personalizadas: [
          {
            id: 'lista_servicos',
            pergunta: 'Quantos itens precisam de reparo aproximadamente?',
            tipo: 'select',
            opcoes: ['1 a 2 itens', '3 a 5 itens', 'Dia completo de pequenos reparos'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-seguranca',
    nome: 'Segurança Eletrônica',
    slug: 'seguranca-eletronica',
    icone: 'Shield',
    cor: '#EF4444',
    descricao: 'Cerca elétrica, concertina, controle de acesso e sensores perimetrais.',
    subcategorias: [
      {
        id: 'sub-cerca-eletrica',
        categoria_id: 'cat-seguranca',
        nome: 'Instalação de Cerca Elétrica / Concertina',
        slug: 'cerca-eletrica',
        perguntas_personalizadas: [
          {
            id: 'metragem_linear',
            pergunta: 'Metragem linear aproximada do muro:',
            tipo: 'select',
            opcoes: ['Até 15 metros', '15 a 30 metros', '30 a 60 metros', 'Mais de 60 metros'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-alarme',
    nome: 'Alarme e Monitoramento',
    slug: 'alarme-monitoramento',
    icone: 'BellRing',
    cor: '#14B8A6',
    descricao: 'Centrais de alarme, sensores de presença e sirenes com aviso no celular.',
    subcategorias: [
      {
        id: 'sub-central-alarme',
        categoria_id: 'cat-alarme',
        nome: 'Sistema de Alarme Residencial / Comercial',
        slug: 'central-alarme',
        perguntas_personalizadas: [
          {
            id: 'qtd_sensores',
            pergunta: 'Quantidade de cômodos ou portas a proteger:',
            tipo: 'select',
            opcoes: ['Até 4 sensores', '5 a 8 sensores', 'Mais de 8 sensores'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-rede',
    nome: 'Cabeamento de Rede',
    slug: 'cabeamento-rede',
    icone: 'Network',
    cor: '#8B5CF6',
    descricao: 'Pontos de rede estruturada, roteadores Wi-Fi Mesh e organização de racks.',
    subcategorias: [
      {
        id: 'sub-pontos-rede',
        categoria_id: 'cat-rede',
        nome: 'Pontos de Rede e Wi-Fi Estruturado',
        slug: 'pontos-rede',
        perguntas_personalizadas: [
          {
            id: 'qtd_pontos',
            pergunta: 'Quantos pontos de rede cabeados?',
            tipo: 'select',
            opcoes: ['1 a 3 pontos', '4 a 8 pontos', 'Mais de 8 pontos'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-portao',
    nome: 'Portão Automático',
    slug: 'portao-automatico',
    icone: 'DoorOpen',
    cor: '#10B981',
    descricao: 'Motores para portão deslizante, basculante, travas elétricas e controles.',
    subcategorias: [
      {
        id: 'sub-motor-portao',
        categoria_id: 'cat-portao',
        nome: 'Instalação ou Troca de Motor de Portão',
        slug: 'motor-portao',
        perguntas_personalizadas: [
          {
            id: 'tipo_portao',
            pergunta: 'Tipo de abertura do portão:',
            tipo: 'select',
            opcoes: [
              'Deslizante (corre para o lado)',
              'Basculante (sobe)',
              'Pivotante (abre como porta)',
            ],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
  {
    id: 'cat-interfone',
    nome: 'Interfone e Vídeo Porteiro',
    slug: 'interfone',
    icone: 'PhoneCall',
    cor: '#EC4899',
    descricao: 'Interfonia coletiva para condomínio e vídeo porteiro eletrônico residencial.',
    subcategorias: [
      {
        id: 'sub-video-porteiro',
        categoria_id: 'cat-interfone',
        nome: 'Instalação de Vídeo Porteiro Wi-Fi / IP',
        slug: 'video-porteiro',
        perguntas_personalizadas: [
          {
            id: 'tipo_local',
            pergunta: 'Local de instalação:',
            tipo: 'select',
            opcoes: ['Casa unifamiliar', 'Condomínio de casas', 'Prédio pequeno'],
            obrigatorio: true,
          },
        ],
      },
    ],
  },
]

let mockRequests: ServiceRequest[] = [
  {
    id: 'req-bh-cameras',
    cliente_id: 'user-ana',
    categoria_id: 'cat-cameras',
    subcategoria_id: 'sub-inst-cameras',
    titulo: 'Instalação de 4 câmeras de segurança IP em residência',
    descricao:
      'Preciso instalar 4 câmeras de segurança na parte externa da casa (frente, garagem e quintal dos fundos). Já comprei os conduítes, falta passar os cabos de rede e fixar o DVR com gravação.',
    respostas_dinamicas: {
      qtd_cameras: '3 a 4 câmeras',
      tipo_imovel: 'Casa',
      fiacao_passada: false,
      precisa_dvr: true,
      pe_direito: 'Até 3 metros (padrão)',
    },
    cep: '30130-010',
    logradouro: 'Avenida Afonso Pena',
    numero: '1500',
    complemento: 'Casa 2',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    latitude: -19.9208,
    longitude: -43.9378,
    fotos: [
      'https://img.usecurling.com/p/600/400?q=house+exterior+wall',
      'https://img.usecurling.com/p/600/400?q=home+front+yard',
    ],
    horario_contato: 'Manhã',
    horario_visita: 'Fim de semana',
    status: 'aberto',
    data_criacao: '2025-02-20T10:30:00Z',
    propostas_count: 1,
    desbloqueado_por: ['user-carlos'],
  },
  {
    id: 'req-sp-disjuntor',
    cliente_id: 'user-ana',
    categoria_id: 'cat-eletricista',
    subcategoria_id: 'sub-troca-disjuntor',
    titulo: 'Troca de Disjuntor geral desarmando com chuveiro',
    descricao:
      'Toda vez que liga o chuveiro elétrico no modo inverno o disjuntor geral do apartamento desarma após 5 minutos. Preciso verificar a fiação e trocar o disjuntor por um compatível com segurança.',
    respostas_dinamicas: {
      motivo_troca: 'Disjuntor desarmando com frequência',
      tipo_imovel: 'Apartamento',
    },
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    numero: '800',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    latitude: -23.5617,
    longitude: -46.6559,
    fotos: ['https://img.usecurling.com/p/600/400?q=electrical+fuse+box'],
    horario_contato: 'Tarde',
    horario_visita: 'Manhã',
    status: 'aberto',
    data_criacao: '2025-02-22T14:15:00Z',
    propostas_count: 0,
    desbloqueado_por: [],
  },
  {
    id: 'req-rj-portao',
    cliente_id: 'user-ana',
    categoria_id: 'cat-portao',
    subcategoria_id: 'sub-motor-portao',
    titulo: 'Substituição de motor para portão basculante',
    descricao: 'Motor antigo queimou na última tempestade. Portão de alumínio 3 metros.',
    respostas_dinamicas: {
      tipo_portao: 'Basculante (sobe)',
    },
    cep: '22041-011',
    logradouro: 'Avenida Nossa Senhora de Copacabana',
    numero: '450',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    fotos: [],
    horario_contato: 'Qualquer horário',
    horario_visita: 'Tarde',
    status: 'fechado',
    data_criacao: '2025-01-10T09:00:00Z',
    propostas_count: 2,
    desbloqueado_por: ['user-carlos', 'user-marcos'],
  },
]

let mockProposals: Proposal[] = [
  {
    id: 'prop-1',
    request_id: 'req-bh-cameras',
    provider_id: 'user-carlos',
    valor_estimado: 750.0,
    mensagem:
      'Olá Ana! Sou especialista certificado em CFTV em BH. O valor cobre a passagem dos 4 pontos de rede, fixação e alinhamento das câmeras, configuração do DVR no app do seu celular e teste de gravação noturna. Posso visitar no sábado de manhã!',
    data_envio: '2025-02-20T11:45:00Z',
    status: 'enviada',
  },
  {
    id: 'prop-2',
    request_id: 'req-rj-portao',
    provider_id: 'user-carlos',
    valor_estimado: 890.0,
    mensagem:
      'Instalação completa com motor rápido PPA ou Rossi de 1/3 HP incluso com 2 controles e cremalheiras novas.',
    data_envio: '2025-01-10T12:00:00Z',
    status: 'aceita',
  },
]

let mockReviews: Review[] = [
  {
    id: 'rev-1',
    request_id: 'req-rj-portao',
    cliente_id: 'user-ana',
    provider_id: 'user-carlos',
    nota: 5,
    comentario:
      'O Carlos foi extremamente pontual, explicou o funcionamento do motor e deixou tudo limpo e funcionando perfeitamente. Recomendo demais!',
    data: '2025-01-15T16:00:00Z',
  },
]

// Current active session (default to null, or remembered demo)
let currentSessionUser: User | null = null

// SERVICE LAYER API
export const api = {
  // === AUTH ===
  async getCurrentUser(): Promise<User | null> {
    await delay(150)
    return currentSessionUser
  },

  async login(email: string, senha: string): Promise<User> {
    await delay(300)
    const normalizedEmail = email.trim().toLowerCase()
    const found = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail)
    if (!found || found.senha_hash !== senha) {
      throw new Error('E-mail ou senha incorretos.')
    }
    if (found.banido) {
      throw new Error('Esta conta está suspensa. Entre em contato com o suporte.')
    }
    const { senha_hash: _, ...safeUser } = found
    currentSessionUser = safeUser
    return safeUser
  },

  async registerUser(params: {
    nome: string
    email: string
    telefone: string
    senha: string
    papel: 'cliente' | 'profissional'
    profissionalData?: {
      tipo_atuacao?: 'Pessoa Física' | 'MEI' | 'Empresa'
      cnpj?: string
      bio: string
      categorias: string[]
      raio_km: number
      cidade: string
      uf: string
      certificados: { nome: string; url?: string }[]
    }
  }): Promise<User> {
    await delay(350)
    const normalizedEmail = params.email.trim().toLowerCase()
    if (mockUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.')
    }

    const newUser: User & { senha_hash: string } = {
      id: `user-${Date.now()}`,
      nome: params.nome.trim(),
      email: normalizedEmail,
      telefone: params.telefone.trim(),
      papel: params.papel,
      foto: `https://img.usecurling.com/ppl/medium?seed=${Date.now() % 100}`,
      data_criacao: new Date().toISOString(),
      banido: false,
      senha_hash: params.senha,
    }

    mockUsers.unshift(newUser)

    if (params.papel === 'profissional' && params.profissionalData) {
      const newProfile: ProviderProfile = {
        user_id: newUser.id,
        bio: params.profissionalData.bio,
        categorias: params.profissionalData.categorias,
        cidade: params.profissionalData.cidade,
        uf: params.profissionalData.uf,
        raio_km: params.profissionalData.raio_km || 30,
        documentos_validados: false,
        avaliacao_media: 5.0,
        total_avaliacoes: 0,
        certificados: params.profissionalData.certificados || [],
        portfolio: [],
        tipo_atuacao: params.profissionalData.tipo_atuacao,
        cnpj: params.profissionalData.cnpj,
      }
      mockProviderProfiles.unshift(newProfile)
    }

    const { senha_hash: _, ...safeUser } = newUser
    currentSessionUser = safeUser
    return safeUser
  },

  async logout(): Promise<void> {
    await delay(150)
    currentSessionUser = null
  },

  // === CEP LOOKUP (MOCK VIACEP) ===
  async lookupCep(rawCep: string): Promise<CepInfo> {
    await delay(250)
    const cleanCep = rawCep.replace(/\D/g, '')
    const formatted =
      cleanCep.length === 8 ? `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}` : rawCep

    if (CEP_DATABASE[formatted]) {
      return CEP_DATABASE[formatted]
    }

    // Fallback generic address for testing any other CEP
    return {
      cep: formatted.length === 9 ? formatted : '00000-000',
      logradouro: 'Rua das Flores',
      bairro: 'Bairro Novo',
      cidade: 'Belo Horizonte',
      uf: 'MG',
    }
  },

  // === CATEGORIES ===
  async getCategories(): Promise<Category[]> {
    await delay(200)
    return JSON.parse(JSON.stringify(mockCategories))
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await delay(200)
    const cat = mockCategories.find((c) => c.slug === slug)
    return cat ? JSON.parse(JSON.stringify(cat)) : null
  },

  async saveCategory(category: Category): Promise<Category> {
    await delay(300)
    const idx = mockCategories.findIndex((c) => c.id === category.id)
    if (idx >= 0) {
      mockCategories[idx] = category
    } else {
      mockCategories.push(category)
    }
    return JSON.parse(JSON.stringify(category))
  },

  async deleteCategory(id: string): Promise<void> {
    await delay(300)
    mockCategories = mockCategories.filter((c) => c.id !== id)
  },

  // === SERVICE REQUESTS ===
  async listRequests(filters?: {
    status?: string
    categoria_slug?: string
    cidade?: string
    cliente_id?: string
  }): Promise<ServiceRequest[]> {
    await delay(300)
    let list = [...mockRequests]

    if (filters?.cliente_id) {
      list = list.filter((r) => r.cliente_id === filters.cliente_id)
    }
    if (filters?.status) {
      list = list.filter((r) => r.status === filters.status)
    }
    if (filters?.categoria_slug) {
      const cat = mockCategories.find((c) => c.slug === filters.categoria_slug)
      if (cat) {
        list = list.filter((r) => r.categoria_id === cat.id)
      }
    }
    if (filters?.cidade) {
      const c = filters.cidade.toLowerCase()
      list = list.filter((r) => r.cidade.toLowerCase().includes(c))
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
    return JSON.parse(JSON.stringify(list))
  },

  async getRequestById(id: string): Promise<ServiceRequest | null> {
    await delay(250)
    const req = mockRequests.find((r) => r.id === id)
    return req ? JSON.parse(JSON.stringify(req)) : null
  },

  async createRequest(
    data: Omit<
      ServiceRequest,
      'id' | 'data_criacao' | 'propostas_count' | 'status' | 'desbloqueado_por'
    >,
  ): Promise<ServiceRequest> {
    await delay(350)
    const newReq: ServiceRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'aberto',
      data_criacao: new Date().toISOString(),
      propostas_count: 0,
      desbloqueado_por: [],
    }
    mockRequests.unshift(newReq)
    return JSON.parse(JSON.stringify(newReq))
  },

  async cancelRequest(id: string): Promise<ServiceRequest> {
    await delay(300)
    const req = mockRequests.find((r) => r.id === id)
    if (!req) throw new Error('Pedido não encontrado.')
    if (req.status !== 'aberto') {
      throw new Error('Apenas pedidos em status aberto podem ser cancelados.')
    }
    req.status = 'cancelado'
    return JSON.parse(JSON.stringify(req))
  },

  // === PROPOSALS & UNLOCKING ===
  // Note: LIMIT OF 3 ENFORCED IN SERVICE LAYER
  async unlockRequestContact(
    requestId: string,
    providerId: string,
  ): Promise<{ proposal: Proposal; request: ServiceRequest }> {
    await delay(350)
    const req = mockRequests.find((r) => r.id === requestId)
    if (!req) throw new Error('Pedido não encontrado.')

    if (!req.desbloqueado_por) req.desbloqueado_por = []

    // If provider already unlocked, find and return existing proposal
    const existingProp = mockProposals.find(
      (p) => p.request_id === requestId && p.provider_id === providerId,
    )
    if (req.desbloqueado_por.includes(providerId) && existingProp) {
      return {
        proposal: JSON.parse(JSON.stringify(existingProp)),
        request: JSON.parse(JSON.stringify(req)),
      }
    }

    // Enforce max 3
    if (req.propostas_count >= 3 || req.desbloqueado_por.length >= 3) {
      throw new Error('Este pedido já atingiu o limite de 3 profissionais.')
    }

    req.desbloqueado_por.push(providerId)
    req.propostas_count += 1

    if (req.propostas_count >= 3 && req.status === 'aberto') {
      req.status = 'em_negociacao'
    }

    const newProp: Proposal = {
      id: `prop-${Date.now()}`,
      request_id: requestId,
      provider_id: providerId,
      valor_estimado: 0,
      mensagem: 'Contato liberado! Em negociação pelo WhatsApp.',
      data_envio: new Date().toISOString(),
      status: 'enviada',
    }

    mockProposals.unshift(newProp)

    return {
      proposal: JSON.parse(JSON.stringify(newProp)),
      request: JSON.parse(JSON.stringify(req)),
    }
  },

  async updateProposal(proposalId: string, valor: number, mensagem: string): Promise<Proposal> {
    await delay(300)
    const prop = mockProposals.find((p) => p.id === proposalId)
    if (!prop) throw new Error('Proposta não encontrada.')
    prop.valor_estimado = valor
    prop.mensagem = mensagem
    return JSON.parse(JSON.stringify(prop))
  },

  async listProposalsByRequest(requestId: string): Promise<Proposal[]> {
    await delay(250)
    const list = mockProposals.filter((p) => p.request_id === requestId)
    return JSON.parse(JSON.stringify(list))
  },

  async listProposalsByProvider(
    providerId: string,
  ): Promise<(Proposal & { request?: ServiceRequest })[]> {
    await delay(250)
    const list = mockProposals
      .filter((p) => p.provider_id === providerId)
      .map((p) => ({
        ...p,
        request: mockRequests.find((r) => r.id === p.request_id),
      }))
    return JSON.parse(JSON.stringify(list))
  },

  async acceptProposal(
    proposalId: string,
  ): Promise<{ proposal: Proposal; request: ServiceRequest }> {
    await delay(300)
    const prop = mockProposals.find((p) => p.id === proposalId)
    if (!prop) throw new Error('Proposta não encontrada.')
    const req = mockRequests.find((r) => r.id === prop.request_id)
    if (!req) throw new Error('Pedido não encontrado.')

    prop.status = 'aceita'
    req.status = 'em_negociacao'

    return {
      proposal: JSON.parse(JSON.stringify(prop)),
      request: JSON.parse(JSON.stringify(req)),
    }
  },

  async rejectProposal(proposalId: string): Promise<Proposal> {
    await delay(300)
    const prop = mockProposals.find((p) => p.id === proposalId)
    if (!prop) throw new Error('Proposta não encontrada.')
    prop.status = 'recusada'
    return JSON.parse(JSON.stringify(prop))
  },

  // === REVIEWS ===
  async createReview(data: {
    request_id: string
    cliente_id: string
    provider_id: string
    nota: number
    comentario: string
  }): Promise<Review> {
    await delay(350)
    // Check if review already exists
    const existing = mockReviews.find(
      (r) => r.request_id === data.request_id && r.cliente_id === data.cliente_id,
    )
    if (existing) {
      throw new Error('Você já enviou uma avaliação para este pedido.')
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      request_id: data.request_id,
      cliente_id: data.cliente_id,
      provider_id: data.provider_id,
      nota: data.nota,
      comentario: data.comentario.trim(),
      data: new Date().toISOString(),
    }
    mockReviews.unshift(review)

    // Mark request as 'fechado' if not yet
    const req = mockRequests.find((r) => r.id === data.request_id)
    if (req) {
      req.status = 'fechado'
    }

    // Recalculate provider average
    const providerReviews = mockReviews.filter((r) => r.provider_id === data.provider_id)
    const sum = providerReviews.reduce((acc, cur) => acc + cur.nota, 0)
    const avg = Number((sum / providerReviews.length).toFixed(1))

    const profile = mockProviderProfiles.find((p) => p.user_id === data.provider_id)
    if (profile) {
      profile.avaliacao_media = avg
      profile.total_avaliacoes = providerReviews.length
    }

    return JSON.parse(JSON.stringify(review))
  },

  async getReview(requestId: string, clienteId: string): Promise<Review | null> {
    await delay(200)
    const rev = mockReviews.find((r) => r.request_id === requestId && r.cliente_id === clienteId)
    return rev ? JSON.parse(JSON.stringify(rev)) : null
  },

  async listReviewsByProvider(providerId: string): Promise<Review[]> {
    await delay(250)
    const list = mockReviews.filter((r) => r.provider_id === providerId)
    return JSON.parse(JSON.stringify(list))
  },

  // === PROVIDER PROFILES ===
  async getProviderProfile(userId: string): Promise<(ProviderProfile & { user: User }) | null> {
    await delay(250)
    const profile = mockProviderProfiles.find((p) => p.user_id === userId)
    const user = mockUsers.find((u) => u.id === userId)
    if (!profile || !user) return null
    const { senha_hash: _, ...safeUser } = user
    return JSON.parse(JSON.stringify({ ...profile, user: safeUser }))
  },

  async updateProviderProfile(
    userId: string,
    data: Partial<ProviderProfile>,
  ): Promise<ProviderProfile> {
    await delay(300)
    const idx = mockProviderProfiles.findIndex((p) => p.user_id === userId)
    if (idx < 0) throw new Error('Perfil não encontrado.')
    mockProviderProfiles[idx] = { ...mockProviderProfiles[idx], ...data }
    return JSON.parse(JSON.stringify(mockProviderProfiles[idx]))
  },

  // === ADMIN API ===
  async listAllUsers(): Promise<User[]> {
    await delay(250)
    return mockUsers.map(({ senha_hash: _, ...u }) => ({ ...u }))
  },

  async getUserById(id: string): Promise<User | null> {
    await delay(200)
    const user = mockUsers.find((u) => u.id === id)
    if (!user) return null
    const { senha_hash: _, ...safeUser } = user
    return safeUser
  },

  async setUserBanned(userId: string, banido: boolean): Promise<User> {
    await delay(250)
    const user = mockUsers.find((u) => u.id === userId)
    if (!user) throw new Error('Usuário não encontrado.')
    user.banido = banido
    const { senha_hash: _, ...safeUser } = user
    return safeUser
  },

  async deleteUser(userId: string): Promise<void> {
    await delay(300)
    mockUsers = mockUsers.filter((u) => u.id !== userId)
    mockProviderProfiles = mockProviderProfiles.filter((p) => p.user_id !== userId)
  },

  async setProviderDocsValidated(
    providerUserId: string,
    validado: boolean,
  ): Promise<ProviderProfile> {
    await delay(300)
    const prof = mockProviderProfiles.find((p) => p.user_id === providerUserId)
    if (!prof) throw new Error('Perfil do prestador não encontrado.')
    prof.documentos_validados = validado
    return JSON.parse(JSON.stringify(prof))
  },

  async getAdminStats() {
    await delay(300)
    const totalUsers = mockUsers.length
    const verifiedProviders = mockProviderProfiles.filter((p) => p.documentos_validados).length
    const openRequests = mockRequests.filter((r) => r.status === 'aberto').length
    const closedRequests = mockRequests.filter((r) => r.status === 'fechado').length
    const inNegotiation = mockRequests.filter((r) => r.status === 'em_negociacao').length

    const avgRating =
      mockReviews.length > 0
        ? Number((mockReviews.reduce((acc, r) => acc + r.nota, 0) / mockReviews.length).toFixed(1))
        : 5.0

    return {
      totalUsers,
      verifiedProviders,
      openRequests,
      closedRequests,
      inNegotiation,
      avgRating,
      categoriesCount: mockCategories.length,
      totalReviews: mockReviews.length,
      totalProposals: mockProposals.length,
    }
  },
}
