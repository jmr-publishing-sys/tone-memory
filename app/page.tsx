'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

type Tone = {
  id: string
  user_id: string
  name: string
  amp: string | null
  cab: string | null
  guitar: string | null
  pedals: string | null
  notes: string | null
  tags: string | null
  created_at: string
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)

  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authEmail, setAuthEmail] = useState('')

  const [tones, setTones] = useState<Tone[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [amp, setAmp] = useState('')
  const [cab, setCab] = useState('')
  const [guitar, setGuitar] = useState('')
  const [pedals, setPedals] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  async function refreshSessionAndTones() {
    setLoading(true)
    setError(null)

    const { data, error: userErr } = await supabase.auth.getUser()
    if (userErr) {
      setUserEmail(null)
      setTones([])
      setLoading(false)
      return
    }

    const email = data.user?.email ?? null
    setUserEmail(email)

    if (!data.user) {
      setTones([])
      setLoading(false)
      return
    }

    const { data: toneRows, error: tonesErr } = await supabase
      .from('tones')
      .select('*')
      .order('created_at', { ascending: false })

    if (tonesErr) {
      setError(tonesErr.message)
      setTones([])
    } else {
      setTones((toneRows ?? []) as Tone[])
    }

    setLoading(false)
  }

  useEffect(() => {
    refreshSessionAndTones()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshSessionAndTones()
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!authEmail.trim()) {
      setError('Enter an email address.')
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        // This makes the magic link land back on your site
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    })

    if (error) setError(error.message)
    else setError('Magic link sent — check inbox (and junk).')
  }

  async function signOut() {
    setError(null)
    await supabase.auth.signOut()
    // auth listener will refresh UI
  }

  async function saveTone(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Tone name is required.')
      return
    }

    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      setSaving(false)
      setError('Please sign in again.')
      return
    }

    const { error } = await supabase.from('tones').insert({
      user_id: user.id,
      name: name.trim(),
      amp: amp.trim() || null,
      cab: cab.trim() || null,
      guitar: guitar.trim() || null,
      pedals: pedals.trim() || null,
      notes: notes.trim() || null,
      tags: tags.trim() || null,
    })

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    // Clear form + reload list
    setName('')
    setAmp('')
    setCab('')
    setGuitar('')
    setPedals('')
    setNotes('')
    setTags('')
    await refreshSessionAndTones()
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, -apple-system' }}>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>🎸 Tone Memory</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Your personal guitar tone library.</p>

      {loading ? (
        <p>Loading…</p>
      ) : userEmail ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>✅ Signed in as <strong>{userEmail}</strong></div>
            <button onClick={signOut} style={{ padding: '8px 12px', borderRadius: 10 }}>
              Sign out
            </button>
          </div>

          <hr style={{ margin: '18px 0' }} />

          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Create Tone</h2>

          <form onSubmit={saveTone} style={{ display: 'grid', gap: 10 }}>
            <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="amp" value={amp} onChange={(e) => setAmp(e.target.value)} />
            <input placeholder="cab" value={cab} onChange={(e) => setCab(e.target.value)} />
            <input placeholder="guitar" value={guitar} onChange={(e) => setGuitar(e.target.value)} />
            <input placeholder="pedals" value={pedals} onChange={(e) => setPedals(e.target.value)} />
            <textarea placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            <input placeholder="tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />

            <button type="submit" disabled={saving} style={{ padding: '10px 14px', borderRadius: 10 }}>
              {saving ? 'Saving…' : 'Save Tone'}
            </button>
          </form>

          <hr style={{ margin: '18px 0' }} />

          <h2 style={{ fontSize: 28, marginBottom: 12 }}>Your Tones</h2>

          {tones.length === 0 ? (
            <p>No tones yet. Save your first one above.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {tones.map((t) => (
                <div key={t.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{t.name}</div>
                  {t.amp ? <div><strong>Amp:</strong> {t.amp}</div> : null}
                  {t.cab ? <div><strong>Cab:</strong> {t.cab}</div> : null}
                  {t.guitar ? <div><strong>Guitar:</strong> {t.guitar}</div> : null}
                  {t.pedals ? <div><strong>Pedals:</strong> {t.pedals}</div> : null}
                  {t.notes ? <div style={{ marginTop: 8 }}><strong>Notes:</strong> {t.notes}</div> : null}
                  {t.tags ? <div style={{ marginTop: 8, opacity: 0.85 }}><strong>Tags:</strong> {t.tags}</div> : null}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h2 style={{ fontSize: 24 }}>Please sign in</h2>

          <form onSubmit={sendMagicLink} style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
            <input
              placeholder="you@email.com"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              inputMode="email"
              autoCapitalize="none"
            />
            <button type="submit" style={{ padding: '10px 14px', borderRadius: 10 }}>
              Sign in with Email
            </button>
          </form>
        </>
      )}

      {error ? (
        <p style={{ marginTop: 14, color: 'crimson' }}>
          {error}
        </p>
      ) : null}
    </main>
  )
}
