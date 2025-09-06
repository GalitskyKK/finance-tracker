import { create } from "zustand"
import type {
  AuthState,
  AuthActions,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordData,
  UpdatePasswordData
} from "@/types"
import { supabase } from "@/lib/supabase"

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true, // Начинаем с true, пока не проверим сессию
  error: null,
  isAuthenticated: false,

  signIn: async (credentials: LoginCredentials): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        loading: false,
        error: null
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false
      })
      throw error
    }
  },

  signUp: async (credentials: RegisterCredentials): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name
          }
        }
      })

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        loading: false,
        error: null
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false
      })
      throw error
    }
  },

  signOut: async (): Promise<void> => {
    set({ loading: true })

    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false,
        error: null
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email)

      if (error) throw error

      set({ loading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  updatePassword: async (data: UpdatePasswordData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (error) throw error

      set({ loading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  refreshSession: async (): Promise<void> => {
    set({ loading: true })

    try {
      const { data, error } = await supabase.auth.refreshSession()

      if (error) throw error

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: errorMessage,
        loading: false
      })
    }
  },

  clearError: (): void => set({ error: null })
}))

// Слушатель изменений состояния аутентификации
supabase.auth.onAuthStateChange((_event, session) => {
  const state = useAuthStore.getState()

  state.user = session?.user ?? null
  state.session = session
  state.isAuthenticated = !!session
  state.loading = false

  // Обновляем store
  useAuthStore.setState({
    user: session?.user ?? null,
    session: session,
    isAuthenticated: !!session,
    loading: false
  })
})

// Инициализация - проверяем текущую сессию
const initializeAuth = async (): Promise<void> => {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) throw error

    useAuthStore.setState({
      user: session?.user ?? null,
      session: session,
      isAuthenticated: !!session,
      loading: false
    })
  } catch (error) {
    useAuthStore.setState({
      loading: false,
      error: error instanceof Error ? error.message : "Failed to initialize auth"
    })
  }
}

// Запускаем инициализацию
initializeAuth()
