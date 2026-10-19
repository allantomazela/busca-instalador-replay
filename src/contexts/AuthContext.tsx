import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'
import { api } from '@/services/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, pass: string) => Promise<User>
  register: (params: Parameters<typeof api.registerUser>[0]) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const current = await api.getCurrentUser()
      setUser(current)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (email: string, pass: string) => {
    const logged = await api.login(email, pass)
    setUser(logged)
    return logged
  }

  const register = async (params: Parameters<typeof api.registerUser>[0]) => {
    const registered = await api.registerUser(params)
    setUser(registered)
    return registered
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
