import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: any

if (!url || !anonKey) {
  console.warn('⚠️ Supabase env vars missing. Running in DEMO MODE.')
  // Create a mock client for demo purposes
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Demo mode' } }),
      signUp: async () => ({ data: null, error: { message: 'Demo mode' } }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
      insert: async () => ({ data: null }),
      update: async () => ({ data: null }),
    }),
  }
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
