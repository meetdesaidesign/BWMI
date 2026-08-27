"use client";

import { useRef } from "react";
import { MousePointer2 } from "lucide-react";
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
        <div className="demo-mark">
          <BrandMark variant="app" size={56} alt="" />
        </div>
        <h1 className="demo-name">{t.landingProductName}</h1>
        <p className="demo-tagline">
          <span className="demo-tagline-lead">{t.landingTaglineLead}</span>
          {" "}
          <span className="demo-tagline-emphasis">{t.landingTaglineEmphasis}</span>
        </p>
        <p className="demo-description">{t.landingDescription}</p>
        <button type="button" className="demo-prompt" onClick={focusDemo}>
          <span className="demo-prompt-icon" aria-hidden>
            <MousePointer2 size={14} strokeWidth={2.25} />
          </span>
          <span className="demo-prompt-copy">
            <strong>{t.landingDemoPrompt}</strong>
            <span>{t.landingDemoHint}</span>
          </span>
        </button>
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
