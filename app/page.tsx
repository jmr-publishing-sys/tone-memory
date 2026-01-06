'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function sendLink() {
    setStatus('Sending magic link...')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setStatus(`Error: ${error.message}`)
    } else {
      setStatus('Check your email for the magic link (check Junk too).')
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
    setStatus('Signed out.')
  }

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>🎸 Tone Memory</h1>

      {userEmail ? (
        <>
          <p>✅ Signed in as {userEmail}</p>
          <button onClick={signOut}>Sign out</button>
        </>
      ) : (
        <>
          <p>Please sign in</p>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ padding: 10, width: '100%', maxWidth: 360, marginTop: 8 }}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={sendLink} disabled={!email}>
              Send magic link
            </button>
          </div>
        </>
      )}

      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  )
}
