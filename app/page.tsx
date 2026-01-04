'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signIn() {
    await supabase.auth.signInWithOtp({
      email: prompt('Enter your email') || '',
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) return <p>Loading...</p>

  return (
    <main style={{ padding: 24 }}>
      <h1>Tone Memory</h1>
      <p>Your personal guitar tone library.</p>

      {!user ? (
        <button onClick={signIn}>Sign in with Email</button>
      ) : (
        <>
          <p>Signed in as: {user.email}</p>
          <button onClick={signOut}>Sign out</button>
        </>
      )}
    </main>
  )
}
