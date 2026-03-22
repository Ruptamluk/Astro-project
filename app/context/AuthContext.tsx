'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface User {
  id: string
  email?: string
  phone?: string
  dob?: string
  zodiac_sign?: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null)

  const setUser = useCallback((newUser: User) => {
    setUserState(newUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }, [])

  const logout = useCallback(() => {
    setUserState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
