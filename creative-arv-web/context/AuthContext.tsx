'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/types'
import { getAccessToken, setTokens, clearTokens } from '@/lib/auth'
import { apiRequest } from '@/lib/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (access: string, refresh: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      apiRequest<User>('/api/users/me/', { auth: true })
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  async function login(access: string, refresh: string) {
    setTokens(access, refresh)
    const me = await apiRequest<User>('/api/users/me/', { auth: true })
    setUser(me)
  }

  function logout() {
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}