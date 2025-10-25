import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosClient, setAuthToken } from '../lib/axiosClient'

type User = {
  id: number
  name: string
  email: string
}

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('tm_token')
    const savedUser = localStorage.getItem('tm_user')
    if (savedToken) {
      setToken(savedToken)
      setAuthToken(savedToken)
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  useEffect(() => {
    if (token) localStorage.setItem('tm_token', token)
    else localStorage.removeItem('tm_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('tm_user', JSON.stringify(user))
    else localStorage.removeItem('tm_user')
  }, [user])

  const login = async (email: string, password: string) => {
    const { data } = await axiosClient.post('/auth/login', { email, password })
    setUser(data.user)
    setToken(data.token)
    setAuthToken(data.token)
    navigate('/tasks')
  }

  const register = async (name: string, email: string, password: string) => {
    const { data } = await axiosClient.post('/auth/register', { name, email, password })
    setUser(data.user)
    setToken(data.token)
    setAuthToken(data.token)
    navigate('/tasks')
  }

  const logout = async () => {
    try {
      await axiosClient.post('/auth/logout')
    } catch {}
    setUser(null)
    setToken(null)
    setAuthToken(null)
    navigate('/login')
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
