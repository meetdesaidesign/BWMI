import { PakkaApp } from "@/components/pakka-app";

export default function Home() {
  return (
    <main className="demo-stage">
      <aside className="demo-note" aria-label="Demo information">
        <div className="demo-mark">P</div>
        <p className="eyebrow">Civic prototype · Ward 14</p>
        <h1>Report an issue.<br />Track it.<br /><em>Confirm the fix.</em></h1>
        <p>A repair stays open until a resident says the work is done.</p>
        <div className="demo-hint"><span>↗</span> Best experienced on mobile</div>
      </aside>
      <section className="phone-shell" aria-label="Pakka mobile application">
        <PakkaApp />
      </section>
    </main>
  );
}
