"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { FixoApp } from "@/components/fixo-app";
import { getCopy } from "@/lib/i18n";

const DEMO_FOCUS_ID = "fixo-demo";

export function DemoStage() {
  const t = getCopy("en");
  const demoRef = useRef<HTMLElement>(null);

  const focusDemo = () => {
    const demo = demoRef.current;
    if (!demo) return;
    demo.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    demo.focus({ preventScroll: true });
  };

  return (
    <main className="demo-stage">
      <aside className="demo-note" aria-label={t.landingPanelAria}>
        {/* Mark and wordmark read as one lockup, so the promise below it — not
            the product name — is the largest thing on the page. */}
        <h1 className="demo-lockup">
          <BrandMark variant="app" size={44} alt="" />
          <span className="demo-name">{t.landingProductName}</span>
        </h1>
        <p className="demo-tagline">
          <span className="demo-tagline-lead">{t.landingTaglineLead}</span>
          {" "}
          <span className="demo-tagline-emphasis">{t.landingTaglineEmphasis}</span>
        </p>
        <p className="demo-description">{t.landingDescription}</p>
        <button type="button" className="demo-prompt" onClick={focusDemo}>
          <span>{t.landingCta}</span>
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
        </button>
        <p className="demo-prompt-hint">{t.landingDemoHint}</p>
      </aside>
      <section
        ref={demoRef}
        id={DEMO_FOCUS_ID}
        className="phone-shell"
        tabIndex={-1}
        aria-label={t.landingDemoAria}
      >
        <FixoApp />
      </section>
    </main>
  );
}
