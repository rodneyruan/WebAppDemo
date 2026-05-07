"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = mode === "login" ? await api.login(email, password) : await api.register(email, password);
      localStorage.setItem("token", result.access_token);
      router.push("/dashboard");
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

