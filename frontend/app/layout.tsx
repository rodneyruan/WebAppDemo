import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CanvasForge",
  description: "AI image generation with credits and subscriptions"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">CanvasForge</Link>
            <nav className="nav">
              <Link href="/pricing">Pricing</Link>
              <Link className="button secondary" href="/login">Login</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

