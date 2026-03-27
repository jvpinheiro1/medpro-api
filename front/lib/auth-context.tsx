'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Role, LoginCredentials } from './types'
import { authApi, setToken, getToken, removeToken } from './api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  hasRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// Decodifica o JWT para extrair informações do usuário
function decodeToken(token: string): User | null {
  try {
    const payload = token.split('.')[1]
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64))
    return {
      id: decoded.id || 0,
      nome: decoded.nome || decoded.name || decoded.sub || 'Usuário',
      email: decoded.sub || decoded.email || '',
      role: decoded.role || 'RECEPCIONISTA',
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verifica token existente no carregamento
  useEffect(() => {
    const token = getToken()
    if (token) {
      const userData = decodeToken(token)
      if (userData) {
        setUser(userData)
      } else {
        removeToken()
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)
    setToken(response.token)
    
    const userData = response.user || decodeToken(response.token)
    setUser(userData)
    router.push('/dashboard')
  }, [router])

  const logout = useCallback(() => {
    removeToken()
    setUser(null)
    router.push('/login')
  }, [router])

  const hasRole = useCallback((roles: Role[]) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Hook para proteção de rotas
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  return { isAuthenticated, isLoading }
}
