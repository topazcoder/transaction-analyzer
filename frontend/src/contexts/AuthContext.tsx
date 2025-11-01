import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { User, AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const userInfo = await authService.getCurrentUser()
        setUser(userInfo)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authResponse = await authService.signIn({ email, password })
      localStorage.setItem('idToken', authResponse.idToken) // For API authorization
      localStorage.setItem('accessToken', authResponse.accessToken) // For future use if needed
      localStorage.setItem('refreshToken', authResponse.refreshToken) // For token refresh

      const userInfo = await authService.getCurrentUser()
      setUser(userInfo)
      navigate('/')
    } catch (error) {
      localStorage.removeItem('idToken')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    await authService.signUp({ email, password, name })
    navigate('/signin')
  }

  const signOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
