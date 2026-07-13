'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type User = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type UserContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial session
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .eq('id', authUser.id)
          .single()
        setUser(profile ?? null)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    loadUser()

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })

    // Cleanup listener when component unmounts
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used inside UserProvider')
  return context
}