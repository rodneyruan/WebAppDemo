import Link from "next/link";
import { ImagePlus, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="main hero">
      <section>
        <h1>CanvasForge</h1>
        <p>
          Generate production-ready visual concepts with five free credits, then unlock ongoing creation with a Stripe subscription.
        </p>
        <div className="actions">
          <Link className="button accent" href="/login">
            <Sparkles size={18} />
            Start creating
          </Link>
          <Link className="button secondary" href="/pricing">
            <ImagePlus size={18} />
            View plan
          </Link>
        </div>
      </section>
      <div className="preview" aria-label="AI generated artwork preview" />
    </main>
  );
}

