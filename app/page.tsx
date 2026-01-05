'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (!error) {
      setSent(true)
    } else {
      alert(error.message)
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Tone Memory</h1>

      {!sent ? (
        <>
          <input
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, marginRight: 8 }}
          />
          <button onClick={signIn}>Send Magic Link</button>
        </>
      ) : (
        <p>Check your email for the magic link.</p>
      )}
    </main>
  )
}
