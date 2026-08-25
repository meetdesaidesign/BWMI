import { PakkaApp } from "@/components/pakka-app";

export default function Home() {
  return (
    <main className="demo-stage">
      <aside className="demo-note" aria-label="Demo information">
        <div className="demo-mark">P</div>
        <p className="eyebrow">CIVIC PROTOTYPE · WARD 14</p>
        <h1>Report it.<br />Track it.<br /><em>Confirm the fix.</em></h1>
        <p>Pakka keeps a repair open until a resident says the work is actually done.</p>
        <div className="demo-hint"><span>↗</span> Best experienced on mobile</div>
      </aside>
      <section className="phone-shell" aria-label="Pakka mobile application">
        <PakkaApp />
      </section>
    </main>
  );
}
