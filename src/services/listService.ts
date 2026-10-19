import { Professional, SavedProfessionalItem, FollowUpStatus } from '@/types'

const SAVED_LIST_STORAGE_KEY = 'servicoja_internal_saved_list'

function getStoredList(): SavedProfessionalItem[] {
  try {
    const raw = localStorage.getItem(SAVED_LIST_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProfessionalItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveList(list: SavedProfessionalItem[]): void {
  try {
    localStorage.setItem(SAVED_LIST_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.error('Erro ao salvar lista interna:', err)
  }
}

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms))

export const listService = {
  async getSavedList(): Promise<SavedProfessionalItem[]> {
    await delay(100)
    return getStoredList()
  },

  async isProfessionalSaved(professionalId: string): Promise<boolean> {
    const list = getStoredList()
    return list.some((item) => item.professionalId === professionalId)
  },

  async saveProfessional(
    professional: Professional,
    user: { id: string; nome: string },
    initialStatus: FollowUpStatus = 'Novo',
    notas = '',
  ): Promise<SavedProfessionalItem> {
    await delay(150)
    const list = getStoredList()
    const existingIndex = list.findIndex((i) => i.professionalId === professional.id)

    if (existingIndex >= 0) {
      throw new Error('Este profissional já está na sua lista interna.')
    }

    const newItem: SavedProfessionalItem = {
      id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      professionalId: professional.id,
      professional,
      status: initialStatus,
      notas: notas.trim(),
      data_salvo: new Date().toISOString(),
      ultima_atualizacao: new Date().toISOString(),
      salvo_por: {
        userId: user.id,
        nome: user.nome,
      },
    }

    list.unshift(newItem)
    saveList(list)
    return newItem
  },

  async updateSavedItem(
    savedId: string,
    updates: {
      status?: FollowUpStatus
      notas?: string
    },
  ): Promise<SavedProfessionalItem> {
    await delay(150)
    const list = getStoredList()
    const index = list.findIndex((i) => i.id === savedId)

    if (index === -1) {
      throw new Error('Item não encontrado na lista interna.')
    }

    const current = list[index]
    const updated: SavedProfessionalItem = {
      ...current,
      status: updates.status ?? current.status,
      notas: updates.notas !== undefined ? updates.notas : current.notas,
      ultima_atualizacao: new Date().toISOString(),
    }

    list[index] = updated
    saveList(list)
    return updated
  },

  async removeSavedItem(savedId: string): Promise<void> {
    await delay(150)
    const list = getStoredList()
    const filtered = list.filter((i) => i.id !== savedId)
    saveList(filtered)
  },

  async removeByProfessionalId(professionalId: string): Promise<void> {
    await delay(150)
    const list = getStoredList()
    const filtered = list.filter((i) => i.professionalId !== professionalId)
    saveList(filtered)
  },
}
