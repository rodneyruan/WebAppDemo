"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function redirectSignedInUser() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (mounted && session) {
        router.replace("/dashboard");
      }
    }

    redirectSignedInUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        const redirectTo = typeof window === "undefined" ? undefined : `${window.location.origin}/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (resetError) {
          throw resetError;
        }
        setMessage("Reset email sent. Open the link in your inbox to choose a new password.");
      } else if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          throw signInError;
        }
        router.replace("/dashboard");
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          router.replace("/dashboard");
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
        <h1>{mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}</h1>
        <p className="muted">
          {mode === "forgot" ? "Enter your email and we will send a reset link." : "Your first 5 image generations are free."}
        </p>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
          </label>
          {mode !== "forgot" ? (
            <label className="field">
              <span>Password</span>
              <input autoComplete="current-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required type="password" />
            </label>
          ) : null}
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="muted">{message}</p> : null}
          <button className="button accent" disabled={loading} type="submit">
            {mode === "login" ? <LogIn size={18} /> : mode === "register" ? <UserPlus size={18} /> : <KeyRound size={18} />}
            {loading ? "Working..." : mode === "login" ? "Login" : mode === "register" ? "Register" : "Send reset link"}
          </button>
        </form>
        <div className="auth-links">
          <button
            className="link-button"
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account?" : "Already have an account?"}
          </button>
          {mode === "login" ? (
            <button className="link-button" type="button" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          ) : null}
          {mode === "forgot" ? (
            <button className="link-button" type="button" onClick={() => setMode("login")}>
              Back to login
            </button>
          ) : null}
          <Link className="link-button" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
