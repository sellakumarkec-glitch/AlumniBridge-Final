import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, Profile, UserRole } from './supabase'

type AuthState = {
  user: Profile | null
  loading: boolean
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

type SignUpParams = {
  email: string
  password: string
  full_name: string
  role: UserRole
  department?: string
  graduation_year?: number
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) { console.error('profile load error', error); return null }
    return data as Profile | null
  }

  useEffect(() => {
    let mounted = true

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        if (data.session?.user) {
          const profile = await loadProfile(data.session.user.id)
          if (mounted) setUser(profile)
        }
      } catch (error) {
        console.error('session load error', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initSession()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          setUser(profile)
        } else {
          setUser(null)
        }
        setLoading(false)
      })()
    })

    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [])

  const signUp: AuthState['signUp'] = async ({ email, password, full_name, role, department, graduation_year }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    const uid = data.user?.id
    if (!uid) return { error: 'Sign-up failed. Please try again.' }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: uid, email, full_name, role,
      department: department ?? null, graduation_year: graduation_year ?? null,
      is_verified: role === 'student' || role === 'placement' || role === 'admin',
    })
    if (profileError) return { error: profileError.message }

    if (role === 'alumni') {
      await supabase.from('alumni_profiles').insert({ id: uid, willing_to_mentor: true })
    }

    const profile = await loadProfile(uid)
    setUser(profile)
    return { error: null }
  }

  const signIn: AuthState['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const refresh = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      const profile = await loadProfile(data.session.user.id)
      setUser(profile)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
