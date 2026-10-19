import { User, UserRole } from '@/types'

const USERS_STORAGE_KEY = 'servicoja_internal_users'
const CURRENT_USER_KEY = 'servicoja_current_user'

interface StoredUser extends User {
  senha: string
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'user-admin',
    nome: 'Carlos Eduardo (Dono)',
    email: 'admin@empresa.com',
    papel: 'admin',
    ativo: true,
    data_criacao: '2025-01-01T08:00:00Z',
    foto: 'https://img.usecurling.com/ppl/medium?gender=male&seed=10',
    telefone: '(11) 98888-1122',
    senha: '123456',
  },
  {
    id: 'user-func',
    nome: 'Juliana Ferreira',
    email: 'funcionario@empresa.com',
    papel: 'funcionario',
    ativo: true,
    data_criacao: '2025-01-10T10:00:00Z',
    foto: 'https://img.usecurling.com/ppl/medium?gender=female&seed=15',
    telefone: '(11) 97777-3344',
    senha: '123456',
  },
]

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    const parsed = JSON.parse(raw) as StoredUser[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_USERS
  } catch {
    return DEFAULT_USERS
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.error('Erro ao salvar usuários no localStorage:', err)
  }
}

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    await delay(100)
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as User
      // Verificar se o usuário ainda existe e está ativo
      const users = getStoredUsers()
      const found = users.find((u) => u.id === parsed.id)
      if (!found || !found.ativo) {
        localStorage.removeItem(CURRENT_USER_KEY)
        return null
      }
      const { senha: _, ...safeUser } = found
      return safeUser
    } catch {
      return null
    }
  },

  async login(email: string, pass: string): Promise<User> {
    await delay(300)
    const normalizedEmail = email.trim().toLowerCase()
    const users = getStoredUsers()
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail)

    if (!user) {
      throw new Error('E-mail não cadastrado no sistema interno da empresa.')
    }

    if (!user.ativo) {
      throw new Error('Esta conta de funcionário foi desativada pelo administrador.')
    }

    if (user.senha !== pass) {
      throw new Error('Senha incorreta. Tente novamente.')
    }

    const { senha: _, ...safeUser } = user
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
    } catch (e) {
      console.error(e)
    }

    return safeUser
  },

  async logout(): Promise<void> {
    await delay(100)
    try {
      localStorage.removeItem(CURRENT_USER_KEY)
    } catch (e) {
      console.error(e)
    }
  },

  async listUsers(): Promise<User[]> {
    await delay(200)
    const users = getStoredUsers()
    return users.map(({ senha: _, ...safeUser }) => safeUser)
  },

  async createUser(data: {
    nome: string
    email: string
    senha: string
    papel: UserRole
    telefone?: string
  }): Promise<User> {
    await delay(300)
    const users = getStoredUsers()
    const normalizedEmail = data.email.trim().toLowerCase()

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Já existe um funcionário com este e-mail.')
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      nome: data.nome.trim(),
      email: normalizedEmail,
      papel: data.papel,
      ativo: true,
      data_criacao: new Date().toISOString(),
      telefone: data.telefone?.trim(),
      foto: `https://img.usecurling.com/ppl/medium?gender=male&seed=${Math.floor(Math.random() * 50) + 20}`,
      senha: data.senha || '123456',
    }

    users.push(newUser)
    saveUsers(users)

    const { senha: _, ...safeUser } = newUser
    return safeUser
  },

  async toggleUserStatus(userId: string): Promise<User> {
    await delay(250)
    const users = getStoredUsers()
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) {
      throw new Error('Funcionário não encontrado.')
    }

    // Não permitir desativar a si mesmo se for admin único ativo
    users[index].ativo = !users[index].ativo
    saveUsers(users)

    const { senha: _, ...safeUser } = users[index]
    return safeUser
  },

  async resetDefaultUsers(): Promise<void> {
    saveUsers(DEFAULT_USERS)
  },
}
