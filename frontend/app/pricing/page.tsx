"use client";

import Link from "next/link";
import { CreditCard, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="main pricing">
      <section className="panel pricing-card">
        <Sparkles size={28} />
        <h1>Pro subscription</h1>
        <p className="muted">Start with 5 free generations. Subscribe when you are ready for unlimited image creation.</p>
        <div className="stat-row">
          <div className="stat">
            <span className="muted">Free</span>
            <strong>5</strong>
          </div>
          <div className="stat">
            <span className="muted">Pro</span>
            <strong>All</strong>
          </div>
        </div>
        <Link className="button accent" href="/dashboard">
          <CreditCard size={18} />
          Go to checkout
        </Link>
      </section>
    </main>
  );
}
