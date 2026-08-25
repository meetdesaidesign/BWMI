"use client";

/* eslint-disable @next/next/no-img-element -- user-captured data URLs and local evidence require native img previews */

import {
  ArrowLeft, ArrowRight, Camera, Check, ChevronRight, CircleAlert, Globe2,
  Home, ImagePlus, LocateFixed, MapPin, Navigation, Plus, RotateCcw, ShieldCheck,
  Sparkles, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, NavBar, TabBar, Toast } from "antd-mobile";
import { getCopy } from "@/lib/i18n";
import { seedIssues } from "@/lib/seed";
import { assetPath } from "@/lib/assets";
import type { AIExtraction, Category, Issue, Locale } from "@/lib/types";
import { MapLoader } from "./map-loader";
import { StoryCard } from "./story-card";

type Screen = "nearby" | "mine" | "issue" | "capture" | "analyzing" | "review" | "success" | "contest" | "confirmed" | "story";

const statusClass: Record<Issue["status"], string> = {
  reported: "slate", acknowledged: "slate", in_progress: "amber", awaiting_confirmation: "violet", confirmed: "green", contested: "red",
};

const categoryEmoji: Record<Category, string> = { Roads: "⌁", Waste: "↻", Water: "≈", Lighting: "✦", Drainage: "≋" };

const staticDemoExtraction: AIExtraction = {
  category: "Roads",
  title_en: "Deep water-filled pothole",
  title_hi: "पानी से भरा गहरा गड्ढा",
  description_en: "A large water-filled pothole and cracked road surface create a serious hazard for two-wheelers.",
  description_hi: "पानी से भरा बड़ा गड्ढा और टूटी सड़क दोपहिया वाहनों के लिए गंभीर खतरा है।",
  severity: "high",
  confidence: 0.94,
  needs_user_review: false,
  duplicate_id: "PK-14028",
};

function local(issue: Issue, locale: Locale, field: "title" | "description" | "reportedAgo" | "department" | "role" | "escalation" | "expected") {
  const suffix = locale === "hi" ? "Hi" : "En";
  return issue[`${field}${suffix}` as keyof Issue] as string;
}

function Header({ locale, setLocale, t }: { locale: Locale; setLocale: (l: Locale) => void; t: ReturnType<typeof getCopy> }) {
  return (
    <header className="app-header">
      <div>
        <div className="brand-lockup"><span className="brand-dot" />pakka</div>
        <p><MapPin size={13} /> {t.ward}</p>
      </div>
      <button className="language-button" onClick={() => setLocale(locale === "en" ? "hi" : "en")} aria-label="Change language">
        <Globe2 size={15} />{t.language}
      </button>
    </header>
  );
}

function BottomNav({ screen, onNavigate, t }: { screen: Screen; onNavigate: (s: Screen) => void; t: ReturnType<typeof getCopy> }) {
  const activeKey = screen === "mine" ? "mine" : screen === "capture" ? "report" : "nearby";
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <TabBar activeKey={activeKey} onChange={(key) => onNavigate(key === "mine" ? "mine" : key === "report" ? "capture" : "nearby")}>
        <TabBar.Item key="nearby" icon={<Home size={21} />} title={t.nearby} />
        <TabBar.Item key="report" icon={<span className="report-tab-icon"><Plus size={23} /></span>} title={t.report} />
        <TabBar.Item key="mine" icon={<Navigation size={21} />} title={t.reports} />
      </TabBar>
    </nav>
  );
}

function StatusPill({ issue, locale }: { issue: Issue; locale: Locale }) {
  const label: Record<Issue["status"], [string, string]> = {
    reported: ["Reported", "रिपोर्ट"], acknowledged: ["Acknowledged", "स्वीकार"], in_progress: ["In progress", "काम जारी"], awaiting_confirmation: ["Check the fix", "मरम्मत जाँचें"], confirmed: ["Confirmed fixed", "ठीक होने की पुष्टि"], contested: ["Reopened", "फिर खुला"],
  };
  return <span className={`status-pill ${statusClass[issue.status]}`}>{label[issue.status][locale === "hi" ? 1 : 0]}</span>;
}

export function PakkaApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [screen, setScreen] = useState<Screen>("nearby");
  const [issues, setIssues] = useState(seedIssues);
  const [selectedId, setSelectedId] = useState(seedIssues[0].id);
  const [backed, setBacked] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied">("idle");
  const [offline, setOffline] = useState(false);
  const [extraction, setExtraction] = useState<AIExtraction | null>(null);
  const [contact, setContact] = useState("");
  const [different, setDifferent] = useState(false);
  const [contestPhoto, setContestPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const contestRef = useRef<HTMLInputElement>(null);
  const t = getCopy(locale);
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const navigate = (next: Screen) => {
    setScreen(next);
    document.querySelector(".phone-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseIssue = (issue: Issue) => { setSelectedId(issue.id); navigate("issue"); };

  const readFile = (file?: File, contest = false) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { alert("Please choose an image smaller than 8 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (contest) { setContestPhoto(url); return; }
      setPhoto(url); setPhotoBase64(url);
      requestLocation();
    };
    reader.readAsDataURL(file);
  };

  const loadDemoPhoto = async () => {
    const response = await fetch(assetPath("/images/demo-pothole.jpg"));
    const blob = await response.blob();
    readFile(new File([blob], "demo-pothole.jpg", { type: "image/jpeg" }));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationState("denied"); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(() => setLocationState("ready"), () => setLocationState("denied"), { timeout: 5000, enableHighAccuracy: true });
  };

  const analyze = async () => {
    if (!photoBase64) return;
    navigate("analyzing");
    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
      setExtraction(staticDemoExtraction);
      window.setTimeout(() => navigate("review"), 900);
      return;
    }
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: photoBase64 }) });
      if (!response.ok) throw new Error("analysis failed");
      const result = await response.json() as AIExtraction;
      setExtraction(result);
    } catch {
      setExtraction({ category: "Roads", title_en: "Road surface damage", title_hi: "सड़क की सतह क्षतिग्रस्त", description_en: "A damaged patch of road needs inspection.", description_hi: "सड़क के क्षतिग्रस्त हिस्से की जाँच आवश्यक है।", severity: "medium", confidence: 0.42, needs_user_review: true, duplicate_id: "PK-14028" });
    }
    window.setTimeout(() => navigate("review"), 500);
  };

  const backIssue = (id: string) => {
    if (backed.includes(id)) return;
    setBacked((b) => [...b, id]);
    setIssues((list) => list.map((i) => i.id === id ? { ...i, supporters: i.supporters + 1 } : i));
    Toast.show({ content: locale === "hi" ? "आपका समर्थन जुड़ गया" : "Your support was added", position: "bottom" });
  };

  const submitReport = () => {
    if (!extraction) return;
    const newIssue: Issue = {
      id: `PK-14${40 + issues.length}`, category: extraction.category, titleEn: extraction.title_en, titleHi: extraction.title_hi,
      descriptionEn: extraction.description_en, descriptionHi: extraction.description_hi, address: "Near your current location · Model Town", lat: 28.7035, lng: 77.1018,
      image: photo ?? assetPath("/images/pothole.svg"), supporters: 1, aliases: ["You"], status: "reported", severity: extraction.severity,
      reportedAgoEn: "Just now", reportedAgoHi: "अभी", departmentEn: "Auto-routing in progress", departmentHi: "सही विभाग चुना जा रहा है", roleEn: "Ward control room", roleHi: "वार्ड नियंत्रण कक्ष",
      escalationEn: "Ward Grievance Officer · 1800-14-0014", escalationHi: "वार्ड शिकायत अधिकारी · 1800-14-0014", expectedEn: "Acknowledgement within 24 hours", expectedHi: "24 घंटे में स्वीकार", mine: true,
      timeline: [{ status: "reported", labelEn: "Reported", labelHi: "रिपोर्ट किया", date: "Just now", noteEn: "Photo and approximate location attached", noteHi: "फोटो और अनुमानित जगह जोड़ी गई" }],
    };
    setIssues((list) => [newIssue, ...list]); setSelectedId(newIssue.id); navigate("success");
  };

  const confirmFix = () => {
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "confirmed", timeline: [...i.timeline, { status: "confirmed", labelEn: "Confirmed by you", labelHi: "आपने पुष्टि की", date: "Just now", noteEn: "The public proof trail is complete", noteHi: "सार्वजनिक सबूत की कड़ी पूरी" }] } : i));
    navigate("confirmed");
  };

  const contestFix = () => {
    if (!contestPhoto) return;
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "contested", timeline: [...i.timeline, { status: "contested", labelEn: "Reopened by resident", labelHi: "निवासी ने फिर खोला", date: "Just now", noteEn: "Fresh evidence shows the issue remains", noteHi: "नए सबूत में समस्या मौजूद" }] } : i));
    navigate("issue");
  };

  const nearby = useMemo(() => [...issues].sort((a, b) => b.supporters - a.supporters), [issues]);
  const myIssues = issues.filter((issue) => issue.mine);

  return (
    <div className="app-root">
      {offline && <div className="offline-banner"><CircleAlert size={15} />{t.offline}</div>}
      {screen === "nearby" && <>
        <div className="screen-scroll">
          <Header locale={locale} setLocale={setLocale} t={t} />
          <section className="ward-summary"><div><strong>{issues.filter((i) => i.status !== "confirmed").length}</strong><span>{t.openNearby}</span></div><div><strong>16</strong><span>{t.confirmed}</span></div></section>
          <section className="map-panel">
            <MapLoader issues={nearby} selected={undefined} onSelect={chooseIssue} />
            <div className="map-key"><span>{t.bigger}</span><i>4</i><i className="mid">12</i><i className="big">31</i></div>
          </section>
          <section className="issue-feed">
            <div className="section-heading"><h2>{t.nearby}</h2><span>{issues.length} {t.all.toLowerCase()}</span></div>
            {nearby.map((issue) => <IssueRow key={issue.id} issue={issue} locale={locale} onClick={() => chooseIssue(issue)} />)}
          </section>
        </div>
        <BottomNav screen={screen} onNavigate={navigate} t={t} />
      </>}

      {screen === "mine" && <>
        <div className="screen-scroll">
          <Header locale={locale} setLocale={setLocale} t={t} />
          <section className="page-title"><p className="eyebrow">YOUR CIVIC RECORD</p><h1>{t.reports}</h1><p>{locale === "hi" ? "आपकी रिपोर्ट और समर्थन—एक जगह।" : "Your reports and the issues you backed, in one place."}</p></section>
          <section className="issue-feed mine-feed">
            {myIssues.map((issue) => <IssueRow key={issue.id} issue={issue} locale={locale} onClick={() => chooseIssue(issue)} />)}
            {backed.map((id) => issues.find((i) => i.id === id)).filter(Boolean).map((issue) => <IssueRow key={`backed-${issue!.id}`} issue={issue!} locale={locale} onClick={() => chooseIssue(issue!)} />)}
          </section>
        </div>
        <BottomNav screen={screen} onNavigate={navigate} t={t} />
      </>}

      {screen === "issue" && <IssueDetail issue={selected} locale={locale} t={t} backed={backed.includes(selected.id)} onBack={() => navigate("nearby")} onBackIssue={() => backIssue(selected.id)} onConfirm={confirmFix} onContest={() => navigate("contest")} />}
      {screen === "capture" && <CaptureScreen locale={locale} t={t} photo={photo} locationState={locationState} fileRef={fileRef} onBack={() => navigate("nearby")} onFile={(f) => readFile(f)} onDemoPhoto={loadDemoPhoto} onLocation={requestLocation} onContinue={analyze} />}
      {screen === "analyzing" && <AnalyzingScreen t={t} photo={photo} />}
      {screen === "review" && extraction && <ReviewScreen locale={locale} t={t} extraction={extraction} setExtraction={setExtraction} photo={photo} locationState={locationState} contact={contact} setContact={setContact} duplicate={issues.find((i) => i.id === extraction.duplicate_id)} different={different} setDifferent={setDifferent} onBack={() => navigate("capture")} onBackExisting={(i) => { backIssue(i.id); setSelectedId(i.id); navigate("issue"); }} onSubmit={submitReport} />}
      {screen === "success" && <ResultScreen icon="sent" title={t.submitted} body={t.submittedHelp} primary={t.viewReport} onPrimary={() => navigate("issue")} />}
      {screen === "contest" && <ContestScreen t={t} photo={contestPhoto} fileRef={contestRef} onFile={(f) => readFile(f, true)} onBack={() => navigate("issue")} onSubmit={contestFix} />}
      {screen === "confirmed" && <ResultScreen icon="confirmed" title={t.confirmedTitle} body={t.confirmedHelp} primary={t.makeCard} onPrimary={() => navigate("story")} secondary={t.viewReport} onSecondary={() => navigate("issue")} />}
      {screen === "story" && <div className="full-page"><TopBar title="Proof Keeper" onBack={() => navigate("confirmed")} /><div className="story-page"><p className="eyebrow">READY TO TRAVEL</p><h1>{locale === "hi" ? "काम पूरा होने की कहानी साझा करें।" : "Share the win, not an app screenshot."}</h1><p>{locale === "hi" ? "कोई निजी जानकारी शामिल नहीं है।" : "No names, contact details, or precise locations are included."}</p><StoryCard locale={locale} t={t} /></div></div>}
    </div>
  );
}

function IssueRow({ issue, locale, onClick }: { issue: Issue; locale: Locale; onClick: () => void }) {
  return <button className="issue-row" onClick={onClick}>
    <div className="support-count"><strong>{issue.supporters}</strong><span>↑</span></div>
    <div className="issue-row-copy"><div><span className="category-mark">{categoryEmoji[issue.category]}</span><span>{issue.category}</span><StatusPill issue={issue} locale={locale} /></div><h3>{local(issue, locale, "title")}</h3><p>{issue.address} · {local(issue, locale, "reportedAgo")}</p></div>
    <ChevronRight size={18} />
  </button>;
}

function TopBar({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return <header className="top-bar"><NavBar backArrow={<ArrowLeft size={21} />} onBack={onBack} right={action}>{title}</NavBar></header>;
}

function IssueDetail({ issue, locale, t, backed, onBack, onBackIssue, onConfirm, onContest }: { issue: Issue; locale: Locale; t: ReturnType<typeof getCopy>; backed: boolean; onBack: () => void; onBackIssue: () => void; onConfirm: () => void; onContest: () => void }) {
  return <div className="full-page issue-detail">
    <TopBar title={issue.id} onBack={onBack} action={<StatusPill issue={issue} locale={locale} />} />
    <div className="issue-hero"><img src={issue.image} alt="Evidence submitted for this issue" /><div className="evidence-stamp"><ShieldCheck size={15} />PHOTO EVIDENCE</div></div>
    <article className="detail-copy">
      <div className="detail-meta"><span>{issue.category}</span><span>·</span><span>{local(issue, locale, "reportedAgo")}</span></div>
      <h1>{local(issue, locale, "title")}</h1><p>{local(issue, locale, "description")}</p>
      <div className="location-line"><MapPin size={17} /><div><strong>{issue.address}</strong><span>{locale === "hi" ? "सार्वजनिक जगह अनुमानित है" : "Public location is approximate"}</span></div></div>
      <button className={`backing-button ${backed ? "done" : ""}`} onClick={onBackIssue} disabled={backed}><Users size={18} /><strong>{backed ? t.backed : t.seeToo}</strong><span>{issue.supporters} {t.supporters}</span></button>
      <section className="proof-section"><div className="section-heading"><h2>{t.timeline}</h2><span>{issue.timeline.length} updates</span></div><div className="timeline">{issue.timeline.map((event, index) => <div className={`timeline-event ${index === issue.timeline.length - 1 ? "latest" : ""}`} key={`${event.status}-${event.date}`}><span className="timeline-node">{index < issue.timeline.length - 1 ? <Check size={12} /> : <span />}</span><div><strong>{locale === "hi" ? event.labelHi : event.labelEn}</strong><time>{event.date}</time>{(locale === "hi" ? event.noteHi : event.noteEn) && <p>{locale === "hi" ? event.noteHi : event.noteEn}</p>}</div></div>)}</div></section>
      <section className="owner-card"><p className="eyebrow">{t.responsibility}</p><h2>{local(issue, locale, "department")}</h2><dl><div><dt>{t.assigned}</dt><dd>{local(issue, locale, "role")}</dd></div><div><dt>{t.expected}</dt><dd>{local(issue, locale, "expected")}</dd></div><div><dt>{t.escalation}</dt><dd>{local(issue, locale, "escalation")}</dd></div></dl></section>
      {issue.status === "awaiting_confirmation" && <section className="confirm-card"><div className="confirmation-seal"><ShieldCheck size={24} /></div><p className="eyebrow">RESIDENT CHECK</p><h2>{t.awaiting}</h2><p>{t.inspect}</p><Button block color="success" size="large" className="primary-button green" onClick={onConfirm}><Check size={18} />{t.fixed}</Button><Button block fill="outline" size="large" className="secondary-button danger" onClick={onContest}><X size={18} />{t.broken}</Button></section>}
      {issue.status === "confirmed" && <button className="primary-button" onClick={() => alert("Open a report awaiting confirmation to create an award.")}><ShieldCheck size={18} />{locale === "hi" ? "निवासियों ने पुष्टि की" : "Confirmed by residents"}</button>}
    </article>
  </div>;
}

function CaptureScreen({ t, photo, locationState, fileRef, onBack, onFile, onDemoPhoto, onLocation, onContinue }: { locale: Locale; t: ReturnType<typeof getCopy>; photo: string | null; locationState: string; fileRef: React.RefObject<HTMLInputElement | null>; onBack: () => void; onFile: (f?: File) => void; onDemoPhoto: () => void; onLocation: () => void; onContinue: () => void }) {
  return <div className="full-page capture-page"><TopBar title={t.reportProblem} onBack={onBack} /><div className="capture-copy"><p className="eyebrow">1 OF 2 · PHOTO</p><h1>{t.capture}</h1><p>{t.captureHelp}</p></div>
    <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} />
    <button className={`camera-stage ${photo ? "has-photo" : ""}`} onClick={onDemoPhoto}>{photo ? <><img src={photo} alt="Selected report evidence" /><span><RotateCcw size={16} />Retake demo photo</span></> : <><div className="camera-lens"><Camera size={34} /></div><strong>{t.camera}</strong><span>Use the prepared hackathon photo</span></>}</button>
    <button className="gallery-button" onClick={() => fileRef.current?.click()}><ImagePlus size={17} />{t.upload}</button>
    <div className="capture-location"><button onClick={onLocation}><LocateFixed size={18} />{locationState === "loading" ? t.locating : t.location}</button>{locationState === "ready" && <span className="location-ok"><Check size={14} />Model Town · ±18 m</span>}{locationState === "denied" && <span className="location-warn"><CircleAlert size={14} />{t.permission}</span>}</div>
    <div className="sticky-action"><Button block color="primary" size="large" className="primary-button" disabled={!photo} onClick={onContinue}><Sparkles size={18} />{photo ? t.photoReady : t.camera}<ArrowRight size={18} /></Button></div>
  </div>;
}

function AnalyzingScreen({ t, photo }: { t: ReturnType<typeof getCopy>; photo: string | null }) {
  return <div className="analysis-screen">{photo && <img src={photo} alt="" />}<div className="scan-line" /><div className="analysis-card"><span className="ai-orbit"><Sparkles size={24} /></span><h1>{t.aiReading}</h1><p>{t.aiHelp}</p><div className="analysis-steps"><span className="done"><Check size={13} />Photo quality</span><span className="active"><span className="spinner" />Finding category</span><span>Writing report</span></div></div></div>;
}

function ReviewScreen({ locale, t, extraction, setExtraction, photo, locationState, contact, setContact, duplicate, different, setDifferent, onBack, onBackExisting, onSubmit }: { locale: Locale; t: ReturnType<typeof getCopy>; extraction: AIExtraction; setExtraction: (e: AIExtraction) => void; photo: string | null; locationState: string; contact: string; setContact: (v: string) => void; duplicate?: Issue; different: boolean; setDifferent: (v: boolean) => void; onBack: () => void; onBackExisting: (i: Issue) => void; onSubmit: () => void }) {
  const categories: Category[] = ["Roads", "Waste", "Water", "Lighting", "Drainage"];
  const titleKey = locale === "hi" ? "title_hi" : "title_en";
  const descKey = locale === "hi" ? "description_hi" : "description_en";
  return <div className="full-page review-page"><TopBar title={t.review} onBack={onBack} /><div className="review-evidence">{photo && <img src={photo} alt="Report evidence" />}<div><span><MapPin size={14} />{locationState === "ready" ? "Model Town · ±18 m" : "Model Town · approximate"}</span><small><Sparkles size={12} />{t.aiSuggestion}</small></div></div>
    <div className="review-form">
      {duplicate && !different && <div className="duplicate-card"><p className="eyebrow">{t.duplicate}</p><h3>{local(duplicate, locale, "title")}</h3><p>{duplicate.supporters} {t.supporters} · {duplicate.address}</p><button onClick={() => onBackExisting(duplicate)}><Users size={17} />{t.seeToo}</button><button className="text-button" onClick={() => setDifferent(true)}>{t.different}</button></div>}
      <label><span>{t.category}</span><div className="category-chips">{categories.map((category) => <button type="button" key={category} className={extraction.category === category ? "selected" : ""} onClick={() => setExtraction({ ...extraction, category })}>{categoryEmoji[category]} {category}</button>)}</div></label>
      <label><span>{t.title}</span><input value={extraction[titleKey]} onChange={(e) => setExtraction({ ...extraction, [titleKey]: e.target.value })} /></label>
      <label><span>{t.description}</span><textarea rows={3} value={extraction[descKey]} onChange={(e) => setExtraction({ ...extraction, [descKey]: e.target.value })} /></label>
      <label><span>{t.contact}</span><input type="text" inputMode="email" autoComplete="email" placeholder={t.contactPlaceholder} value={contact} onChange={(e) => setContact(e.target.value)} /><small><ShieldCheck size={13} />{t.anonymous}</small></label>
      <Button block color="primary" size="large" className="primary-button" onClick={onSubmit}>{t.submit}<ArrowRight size={18} /></Button>
    </div>
  </div>;
}

function ContestScreen({ t, photo, fileRef, onFile, onBack, onSubmit }: { t: ReturnType<typeof getCopy>; photo: string | null; fileRef: React.RefObject<HTMLInputElement | null>; onFile: (f?: File) => void; onBack: () => void; onSubmit: () => void }) {
  return <div className="full-page contest-page"><TopBar title={t.broken} onBack={onBack} /><div className="capture-copy"><p className="eyebrow">FRESH EVIDENCE</p><h1>{t.contestTitle}</h1><p>{t.contestHelp}</p></div><input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} /><button className={`contest-upload ${photo ? "has-photo" : ""}`} onClick={() => fileRef.current?.click()}>{photo ? <img src={photo} alt="New evidence" /> : <><ImagePlus size={30} /><strong>{t.camera}</strong><span>{t.upload}</span></>}</button><div className="contest-note"><ShieldCheck size={18} /><p>This adds a new event to the public proof trail. It does not erase the department’s earlier update.</p></div><div className="sticky-action"><Button block color="danger" size="large" className="primary-button danger-fill" disabled={!photo} onClick={onSubmit}>{t.reopen}<ArrowRight size={18} /></Button></div></div>;
}

function ResultScreen({ icon, title, body, primary, onPrimary, secondary, onSecondary }: { icon: "sent" | "confirmed"; title: string; body: string; primary: string; onPrimary: () => void; secondary?: string; onSecondary?: () => void }) {
  return <div className={`result-screen ${icon}`}><div className="result-mark">{icon === "confirmed" ? <ShieldCheck size={52} /> : <><span className="pulse-ring" /><Check size={45} /></>}</div><p className="eyebrow">{icon === "confirmed" ? "THE LOOP IS CLOSED" : "PK-14046 · JUST NOW"}</p><h1>{title}</h1><p>{body}</p><div className="result-proof"><span /><span /><span /><span className="active" /></div><Button block color="primary" size="large" className="primary-button" onClick={onPrimary}>{primary}<ArrowRight size={18} /></Button>{secondary && <Button block fill="outline" size="large" className="secondary-button" onClick={onSecondary}>{secondary}</Button>}</div>;
}
