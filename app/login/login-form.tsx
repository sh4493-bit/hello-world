"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginForm({ callbackFailed }: { callbackFailed: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(callbackFailed ? "Sign-in could not be completed. Please try again." : "");
  const [busy, setBusy] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function finishSignIn() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("first_name, last_name").eq("id", user.id).maybeSingle()
      : { data: null };
    router.push(profile?.first_name?.trim() && profile.last_name?.trim() ? "/members" : "/profile?setup=1");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm your account, then come back to sign in.");
    } else {
      await finishSignIn();
    }

    setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  return (
    <div className="login-form">
      <div className="mode-switch" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={mode === "signin"} onClick={() => { setMode("signin"); setMessage(""); }}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setMessage(""); }}>
          Create account
        </button>
      </div>

      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Email address
          <input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input autoComplete={mode === "signin" ? "current-password" : "new-password"} type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in with email" : "Create account"}
        </button>
      </form>

      <div className="divider"><span>or</span></div>
      <button className="secondary-button google-button" type="button" onClick={signInWithGoogle} disabled={busy}>
        <span className="google-mark" aria-hidden="true">G</span>
        Continue with Google
      </button>
      <p className="form-message" aria-live="polite">{message}</p>
    </div>
  );
}