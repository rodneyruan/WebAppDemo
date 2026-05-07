"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        router.push("/dashboard");
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          router.push("/dashboard");
        } else {
          setMessage("Account created. Check your email to confirm the account, then log in.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main auth-page">
      <section className="auth-box">
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="muted">Your first 5 image generations are free.</p>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="current-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required type="password" />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="muted">{message}</p> : null}
          <button className="button accent" disabled={loading} type="submit">
            {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div className="actions">
          <button className="button secondary" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Need an account?" : "Already have an account?"}
          </button>
        </div>
      </section>
    </main>
  );
}
