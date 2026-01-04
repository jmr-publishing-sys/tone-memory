"use client";

import { useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link.");
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Tone Memory</h1>
      <p>Your personal guitar tone library.</p>

      <input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />

      <button onClick={signIn}>Sign in with Email</button>

      {message && <p>{message}</p>}
    </main>
  );
}
