"use client";

import { BrandMark } from "@/components/brand-mark";
import { FixoApp } from "@/components/fixo-app";
import { getCopy } from "@/lib/i18n";

export function DemoStage() {
  const t = getCopy("en");

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
      </aside>
      <section
        className="phone-shell"
        aria-label={t.landingDemoAria}
      >
        <FixoApp />
      </section>
    </main>
  );
}
