"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ImagePlus, LogOut, Sparkles } from "lucide-react";
import { api, GeneratedImage, User } from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setError("");

      try {
        const {
          data: { user: authUser }
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.replace("/login");
          return;
        }

        const [profile, existingImages] = await Promise.all([api.me(), api.listImages()]);

        if (!active) {
          return;
        }

        setUser(profile);
        setImages(existingImages);
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : "Could not load your account.");
      } finally {
        if (active) {
          setAccountLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const image = await api.generateImage(prompt);
      const profile = await api.me();
      setImages((current) => [image, ...current]);
      setUser(profile);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    setError("");
    try {
      const session = await api.checkout();
      window.location.href = session.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
    }
  }

  function logout() {
    supabase.auth.signOut().finally(() => {
      router.push("/");
    });
  }

  return (
    <main className="main dashboard">
      <div className="actions" style={{ justifyContent: "space-between", marginTop: 0 }}>
        <div>
          <h1>Create images</h1>
          <p className="muted">{user ? user.email : accountLoading ? "Loading account..." : "Signed in"}</p>
        </div>
        <button className="button secondary" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="stat-row">
            <div className="stat">
              <span className="muted">Credits</span>
              <strong>{user?.is_subscribed ? "All" : user?.credits ?? "-"}</strong>
            </div>
            <div className="stat">
              <span className="muted">Plan</span>
              <strong>{user?.is_subscribed ? "Pro" : "Free"}</strong>
            </div>
          </div>

          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Prompt</span>
              <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} required placeholder="A cinematic product photo of..." />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button className="button accent" disabled={loading || !user || accountLoading} type="submit">
              <ImagePlus size={18} />
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          {!user?.is_subscribed ? (
            <button className="button secondary" style={{ marginTop: 12, width: "100%" }} onClick={subscribe} type="button">
              <CreditCard size={18} />
              Subscribe
            </button>
          ) : null}
        </div>

        <div>
          <div className="actions" style={{ marginTop: 0 }}>
            <Sparkles size={20} />
            <h2 style={{ margin: 0 }}>Gallery</h2>
          </div>
          <div className="gallery">
            {images.map((image) => (
              <article className="image-card" key={image.id}>
                <img src={image.image_url} alt={image.prompt} />
                <p>{image.prompt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
