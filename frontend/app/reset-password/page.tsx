"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const hash = window.location.hash.startsWith("#") ? new URLSearchParams(window.location.hash.slice(1)) : null;
      const accessToken = hash?.get("access_token");
      const refreshToken = hash?.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (sessionError && mounted) {
          setError(sessionError.message);
          return;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError("This reset link is invalid or expired. Request a new one from the login page.");
        return;
      }

      setReady(true);
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        throw updateError;
      }

      setMessage("Password updated. Sending you back to login.");
      setTimeout(() => {
        supabase.auth.signOut().finally(() => {
          router.push("/login");
        });
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main auth-page">
      <section className="auth-box">
        <h1>Choose a new password</h1>
        <p className="muted">Use a password you have not used here before.</p>
        <form className="form" onSubmit={submit}>
          <label className="field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          {message ? <p className="muted">{message}</p> : null}
          <button className="button accent" disabled={loading || !ready} type="submit">
            <KeyRound size={18} />
            {loading ? "Saving..." : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}
