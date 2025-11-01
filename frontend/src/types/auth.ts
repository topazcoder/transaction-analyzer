export interface User {
  userId: string
  email: string
  name: string
  emailVerified: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresIn: number
  tokenType: string
  usageInstructions?: {
    authorization: string
    accessControl: string
    storage: string
  }
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
}
