'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
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

  const signIn = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://tone-memory.vercel.app/auth/callback',
      },
    })
    alert('Magic link sent!')
  }

  if (loading) {
    return <p style={{ padding: 40 }}>Loading…</p>
  }

  if (user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>✅ Signed in</h1>
        <p>{user.email}</p>
        <button onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Tone Memory</h1>
      <input
        placeholder="you@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button onClick={signIn}>Sign in with magic link</button>
    </div>
  )
}
