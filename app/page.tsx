'use client'

import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signIn = async () => {
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for the sign-in link.')
    }

    setLoading(false)
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Tone Memory</h1>
      <p>Your personal guitar tone library.</p>

      <input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, width: 260 }}
      />

      <br /><br />

      <button onClick={signIn} disabled={loading}>
        {loading ? 'Sending...' : 'Sign in with Email'}
      </button>

      {message && (
        <p style={{ marginTop: 16 }}>{message}</p>
      )}
    </main>
  )
}
