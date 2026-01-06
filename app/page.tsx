'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
  created_at: string
}

export default function Page() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // form fields
  const [name, setName] = useState('')
  const [amp, setAmp] = useState('')
  const [cab, setCab] = useState('')
  const [guitar, setGuitar] = useState('')
  const [pedals, setPedals] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  // tones list
  const [tones, setTones] = useState<Tone[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadSessionAndTones() {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const session = sessionData.session

    if (!session?.user) {
      setUserEmail(null)
      setTones([])
      setLoading(false)
      return
    }

    setUserEmail(session.user.email ?? null)

    const { data, error } = await supabase
      .from('tones')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) setError(error.message)
    setTones((data as Tone[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadSessionAndTones()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadSessionAndTones()
    })

    return () => subscription.unsubscribe()
  }, [])

  async function saveTone() {
    setSaving(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) {
      setError('Not signed in.')
      setSaving(false)
      return
    }

    const payload = {
      user_id: user.id,
      name,
      amp,
      cab,
      guitar,
      pedals,
      notes,
      tags,
    }

    const { error } = await supabase.from('tones').insert(payload)

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    // clear form
    setName('')
    setAmp('')
    setCab('')
    setGuitar('')
    setPedals('')
    setNotes('')
    setTags('')

    await loadSessionAndTones()
    setSaving(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    await loadSessionAndTones()
  }

  if (loading) {
    return <main style={{ padding: 24 }}>Loading…</main>
  }

  if (!userEmail) {
    return (
      <main style={{ padding: 24, maxWidth: 520 }}>
        <h1>Tone Memory</h1>
        <p>Please sign in using the magic link.</p>
        <p style={{ opacity: 0.7 }}>
          (If you need the sign-in form back on this page, tell me and we’ll add it next.)
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: 24, maxWidth: 700 }}>
      <h1 style={{ marginBottom: 8 }}>🎸 Tone Memory</h1>
      <p style={{ marginTop: 0 }}>✅ Signed in as {userEmail}</p>

      <button onClick={signOut} style={{ marginBottom: 24 }}>
        Sign out
      </button>

      <h2>Create Tone</h2>

      <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
        <input placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="amp" value={amp} onChange={(e) => setAmp(e.target.value)} />
        <input placeholder="cab" value={cab} onChange={(e) => setCab(e.target.value)} />
        <input placeholder="guitar" value={guitar} onChange={(e) => setGuitar(e.target.value)} />
        <input placeholder="pedals" value={pedals} onChange={(e) => setPedals(e.target.value)} />
        <input placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <input placeholder="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>

      <button onClick={saveTone} disabled={saving}>
        {saving ? 'Saving…' : 'Save Tone'}
      </button>

      {error && (
        <p style={{ color: 'crimson', marginTop: 12 }}>
          Error: {error}
        </p>
      )}

      <hr style={{ margin: '24px 0' }} />

      <h2>Your Tones</h2>
      {tones.length === 0 ? (
        <p>No tones yet. Create one above 👆</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {tones.map((t) => (
            <div
              key={t.id}
              style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
            >
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
