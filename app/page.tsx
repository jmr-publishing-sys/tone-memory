'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Tone = {
  id: string
  name: string
  amp: string
  cab: string
  guitar: string
  pedals: string
  notes: string
  tags: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tones, setTones] = useState<Tone[]>([])

  const [form, setForm] = useState({
    name: '',
    amp: '',
    cab: '',
    guitar: '',
    pedals: '',
    notes: '',
    tags: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session?.user) loadTones()
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) loadTones()
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const loadTones = async () => {
    const { data } = await supabase
      .from('tones')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setTones(data)
  }

  const saveTone = async () => {
    if (!form.name) return alert('Name your tone first')

    const { error } = await supabase.from('tones').insert([
      {
        ...form,
        user_id: user.id,
        is_public: false,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      setForm({
        name: '',
        amp: '',
        cab: '',
        guitar: '',
        pedals: '',
        notes: '',
        tags: '',
      })
      loadTones()
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>

  if (!user) {
    return <p style={{ padding: 40 }}>Please sign in</p>
  }

  return (
    <div style={{ padding: 40, maxWidth: 700 }}>
      <h1>🎸 Tone Memory</h1>
      <p>Signed in as {user.email}</p>

      <h2>Create Tone</h2>

      {Object.keys(form).map((key) => (
        <input
          key={key}
          placeholder={key}
          value={(form as any)[key]}
          onChange={(e) =>
            setForm({ ...form, [key]: e.target.value })
          }
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 8,
            padding: 8,
          }}
        />
      ))}

      <button onClick={saveTone}>Save Tone</button>

      <hr style={{ margin: '30px 0' }} />

      <h2>Your Tones</h2>

      {tones.length === 0 && <p>No tones yet</p>}

      {tones.map((tone) => (
        <div
          key={tone.id}
          style={{
            border: '1px solid #ccc',
            padding: 12,
            marginBottom: 10,
          }}
        >
          <strong>{tone.name}</strong>
          <div>Amp: {tone.amp}</div>
          <div>Cab: {tone.cab}</div>
          <div>Guitar: {tone.guitar}</div>
          <div>Pedals: {tone.pedals}</div>
          <div>Notes: {tone.notes}</div>
          <div>Tags: {tone.tags}</div>
        </div>
      ))}
    </div>
  )
}
