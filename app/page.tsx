'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type Tone = {
  id: string
  user_id: string
  name: string | null
  amp: string | null
  cab: string | null
  guitar: string | null
  pedals: string | null
  notes: string | null
  tags: string | null
}

export default function HomePage() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // auth form
  const [email, setEmail] = useState('')

  // tone form
  const [name, setName] = useState('')
  const [amp, setAmp] = useState('')
  const [cab, setCab] = useState('')
  const [guitar, setGuitar] = useState('')
  const [pedals, setPedals] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  const [tones, setTones] = useState<Tone[]>([])
  const [saving, setSaving] = useState(false)

  async function loadSessionAndTones() {
    setLoading(true)

    const { data } = await supabase.auth.getSession()
    const s = data.session
    setSessionEmail(s?.user?.email ?? null)

    if (s?.user?.id) {
      const { data: tonesData } = await supabase
        .from('tones')
        .select('*')
        .order('created_at', { ascending: false })

      setTones((tonesData as Tone[]) ?? [])
    } else {
      setTones([])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSessionAndTones()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadSessionAndTones()
    })

    return () => {
      sub.subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Magic link sent! Check your email and open the link on this device/browser.')
    setEmail('')
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function saveTone(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: s } = await supabase.auth.getSession()
    const userId = s.session?.user?.id
    if (!userId) {
      alert('Please sign in first.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('tones').insert({
      user_id: userId,
      name,
      amp,
      cab,
      guitar,
      pedals,
      notes,
      tags,
    })

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    // clear form + refresh list
    setName('')
    setAmp('')
    setCab('')
    setGuitar('')
    setPedals('')
    setNotes('')
    setTags('')
    await loadSessionAndTones()
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h1>Tone Memory</h1>
        <p>Loading…</p>
      </main>
    )
  }

  // NOT SIGNED IN: show sign-in form on homepage
  if (!sessionEmail) {
    return (
      <main style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
        <h1>Tone Memory</h1>
        <p>Please sign in using the magic link.</p>

        <form onSubmit={sendMagicLink} style={{ marginTop: 16 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            inputMode="email"
            autoCapitalize="none"
            style={{ width: '100%', padding: 12, marginBottom: 12 }}
          />
          <button type="submit" style={{ padding: '10px 14px' }}>
            Send magic link
          </button>
        </form>
      </main>
    )
  }

  // SIGNED IN: show create tone + list
  return (
    <main style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h1>🎸 Tone Memory</h1>
      <p>✅ Signed in as {sessionEmail}</p>
      <button onClick={signOut} style={{ padding: '8px 12px', marginBottom: 24 }}>
        Sign out
      </button>

      <h2>Create Tone</h2>
      <form onSubmit={saveTone} style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="name" style={{ padding: 12 }} />
        <input value={amp} onChange={(e) => setAmp(e.target.value)} placeholder="amp" style={{ padding: 12 }} />
        <input value={cab} onChange={(e) => setCab(e.target.value)} placeholder="cab" style={{ padding: 12 }} />
        <input value={guitar} onChange={(e) => setGuitar(e.target.value)} placeholder="guitar" style={{ padding: 12 }} />
        <input value={pedals} onChange={(e) => setPedals(e.target.value)} placeholder="pedals" style={{ padding: 12 }} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="notes" style={{ padding: 12 }} />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags" style={{ padding: 12 }} />

        <button type="submit" disabled={saving} style={{ padding: '10px 14px' }}>
          {saving ? 'Saving…' : 'Save Tone'}
        </button>
      </form>

      <h2>Your Tones</h2>
      {tones.length === 0 ? (
        <p>No tones yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {tones.map((t) => (
            <div key={t.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <strong>{t.name || '(untitled)'}</strong>
              <div>Amp: {t.amp || ''}</div>
              <div>Cab: {t.cab || ''}</div>
              <div>Guitar: {t.guitar || ''}</div>
              <div>Pedals: {t.pedals || ''}</div>
              <div>Notes: {t.notes || ''}</div>
              <div>Tags: {t.tags || ''}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
