import type { User as SupabaseUser, Session as SupabaseSession } from "@supabase/supabase-js"

export type AuthUser = SupabaseUser

export interface Session extends SupabaseSession {}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name?: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export interface AuthActions {
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: RegisterCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  updatePassword: (data: UpdatePasswordData) => Promise<void>
  clearError: () => void
  refreshSession: () => Promise<void>
}

export type AuthError =
  | "invalid-credentials"
  | "user-not-found"
  | "email-already-in-use"
  | "weak-password"
  | "network-error"
  | "unknown-error"

export interface OAuthProvider {
  name: string
  provider: "google" | "github" | "apple" | "facebook"
  icon: string
  enabled: boolean
}
