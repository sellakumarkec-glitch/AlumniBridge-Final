import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

let supabase: any

const mockProfiles = new Map<string, any>()
const mockUsers = new Map<string, { id: string; email: string; password: string }>()
let mockSession: { user: { id: string; email: string } } | null = null
let authChangeCallback: ((event: string, session: any) => void) | null = null

const createMockProfile = (profile: any) => {
  mockProfiles.set(profile.id, profile)
  mockUsers.set(profile.email, { id: profile.id, email: profile.email, password: profile.password })
}

createMockProfile({
  id: 'demo-student',
  email: 'student@alumni.edu',
  password: 'AlumniBridge2026!',
  full_name: 'Demo Student',
  role: 'student',
  avatar_url: null,
  bio: null,
  phone: null,
  location: null,
  department: 'MCA',
  graduation_year: 2027,
  is_verified: true,
  created_at: new Date().toISOString(),
})

const notifyAuthChange = () => {
  if (authChangeCallback) {
    authChangeCallback('SIGNED_IN', { session: mockSession })
  }
}

const createMockClient = () => ({
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authChangeCallback = callback
      return { data: { subscription: { unsubscribe: () => { authChangeCallback = null } } } }
    },
    getSession: async () => ({ data: { session: mockSession } }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const user = mockUsers.get(email)
      if (!user || user.password !== password) {
        return { data: null, error: { message: 'Invalid login credentials' } }
      }
      mockSession = { user: { id: user.id, email: user.email } }
      notifyAuthChange()
      return { data: { session: mockSession }, error: null }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      if (mockUsers.has(email)) {
        return { data: null, error: { message: 'User already exists' } }
      }
      const id = `demo-${Date.now()}`
      const profile = {
        id,
        email,
        password,
        full_name: 'New Demo User',
        role: 'student',
        avatar_url: null,
        bio: null,
        phone: null,
        location: null,
        department: null,
        graduation_year: null,
        is_verified: true,
        created_at: new Date().toISOString(),
      }
      createMockProfile(profile)
      mockSession = { user: { id, email } }
      notifyAuthChange()
      return { data: { user: { id, email } }, error: null }
    },
    signOut: async () => {
      mockSession = null
      notifyAuthChange()
      return { error: null }
    },
  },
  from: (table: string) => ({
    select: () => ({
      eq: (key: string, value: any) => ({
        maybeSingle: async () => {
          if (table === 'profiles' && key === 'id') {
            return { data: mockProfiles.get(value) ?? null, error: null }
          }
          return { data: null, error: null }
        },
      }),
    }),
    insert: async (payload: any) => {
      if (table === 'profiles') {
        mockProfiles.set(payload.id, { ...payload, created_at: new Date().toISOString() })
        return { data: payload, error: null }
      }
      if (table === 'alumni_profiles') {
        return { data: payload, error: null }
      }
      return { data: null, error: null }
    },
    update: async () => ({ data: null, error: null }),
  }),
})

if (useMockData || !url || !anonKey) {
  console.warn('⚠️ Supabase env vars missing or mock mode enabled. Running in DEMO MODE.')
  supabase = createMockClient()
} else {
  supabase = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
}

export { supabase }

export type UserRole = 'student' | 'alumni' | 'placement' | 'admin'

export type Profile = {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  bio: string | null
  phone: string | null
  location: string | null
  department: string | null
  graduation_year: number | null
  is_verified: boolean | null
  created_at: string
}
