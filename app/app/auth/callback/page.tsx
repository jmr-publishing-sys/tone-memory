"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { error } =
        await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error("Auth callback error:", error.message);
      }

      router.replace("/");
    };

    run();
  }, [router]);

  return <p style={{ padding: 20 }}>Signing you in…</p>;
}
