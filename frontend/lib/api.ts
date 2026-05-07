import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  email: string;
  credits: number;
  is_subscribed: boolean;
};

export type GeneratedImage = {
  id: number;
  prompt: string;
  image_url: string;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }
  return data as T;
}

export const api = {
  me: () => request<User>("/users/me"),
  listImages: () => request<GeneratedImage[]>("/images"),
  generateImage: (prompt: string) =>
    request<GeneratedImage>("/images/generate", {
      method: "POST",
      body: JSON.stringify({ prompt })
    }),
  checkout: () => request<{ checkout_url: string }>("/billing/checkout", { method: "POST" })
};
