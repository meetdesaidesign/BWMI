"use client";

/* eslint-disable @next/next/no-img-element -- user-captured data URLs and local evidence require native img previews */

import {
  ArrowLeft, ArrowRight, Camera, Check, CircleAlert, Globe2,
  Home, ImagePlus, LocateFixed, MapPin, Navigation, Plus, RotateCcw, ShieldCheck,
  Sparkles, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, NavBar, TabBar, Toast } from "antd-mobile";
import { formatCopy, getCopy, getStatusLabel } from "@/lib/i18n";
import { seedIssues, WARD_CENTER } from "@/lib/seed";
import { assetPath } from "@/lib/assets";
import type { AIExtraction, Category, Issue, Locale } from "@/lib/types";
import { MapLoader } from "./map-loader";
import { StoryCard } from "./story-card";
import { CategoryIcon } from "./category-icon";
import { IssueCarousel } from "./issue-carousel";

type Screen = "nearby" | "mine" | "issue" | "capture" | "analyzing" | "review" | "success" | "contest" | "confirmed" | "story";

const statusClass: Record<Issue["status"], string> = {
  reported: "slate", acknowledged: "slate", in_progress: "amber", awaiting_confirmation: "violet", confirmed: "green", contested: "red",
};

const staticDemoExtraction: AIExtraction = {
  category: "Roads",
  title_en: "Deep pothole with broken road surface",
  title_hi: "टूटी सड़क पर गहरा गड्ढा",
  description_en: "A large pothole and crumbling asphalt create a serious hazard for two-wheelers.",
  description_hi: "बड़ा गड्ढा और टूटी हुई सड़क दोपहिया वाहनों के लिए गंभीर खतरा है।",
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
    <header className="page-header">
      <div className="brand-lockup"><span className="brand-dot" />pakka</div>
      <button className="language-button" onClick={() => setLocale(locale === "en" ? "hi" : "en")} aria-label={t.languageAria}>
        <Globe2 size={16} />{t.language}
      </button>
    </header>
  );
}

function BottomNav({ screen, onNavigate, t }: { screen: Screen; onNavigate: (s: Screen) => void; t: ReturnType<typeof getCopy> }) {
  const activeKey = screen === "mine" ? "mine" : screen === "capture" ? "report" : "nearby";
  return (
    <nav className="bottom-nav" aria-label={t.navAria}>
      <TabBar activeKey={activeKey} onChange={(key) => onNavigate(key === "mine" ? "mine" : key === "report" ? "capture" : "nearby")}>
        <TabBar.Item key="nearby" icon={<Home size={21} />} title={t.nearby} />
        <TabBar.Item key="report" icon={<span className="report-tab-icon"><Plus size={23} /></span>} title={t.report} />
        <TabBar.Item key="mine" icon={<Navigation size={21} />} title={t.reports} />
      </TabBar>
    </nav>
  );
}

function StatusPill({ issue, locale }: { issue: Issue; locale: Locale }) {
  return <span className={`status-pill ${statusClass[issue.status]}`}>{getStatusLabel(issue.status, locale)}</span>;
}

export function PakkaApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [screen, setScreen] = useState<Screen>("nearby");
  const [issues, setIssues] = useState(seedIssues);
  const [selectedId, setSelectedId] = useState(seedIssues[0].id);
  const [highlightedId, setHighlightedId] = useState(seedIssues[0].id);
  const [recenterNonce, setRecenterNonce] = useState(0);
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
  const highlighted = issues.find((i) => i.id === highlightedId);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  const highlightIssue = (issue: Issue) => {
    setHighlightedId(issue.id);
  };

  const navigate = (next: Screen) => {
    setScreen(next);
    document.querySelector(".phone-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseIssue = (issue: Issue) => { setSelectedId(issue.id); setHighlightedId(issue.id); navigate("issue"); };

  const readFile = (file?: File, contest = false) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { Toast.show({ content: t.photoTooLarge, position: "bottom" }); return; }
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
      setExtraction({ category: "Roads", title_en: "Road surface damage", title_hi: "सड़क की सतह क्षतिग्रस्त", description_en: "A damaged patch of road needs a check.", description_hi: "सड़क के क्षतिग्रस्त हिस्से की जाँच आवश्यक है।", severity: "medium", confidence: 0.42, needs_user_review: true, duplicate_id: "PK-14028" });
    }
    window.setTimeout(() => navigate("review"), 500);
  };

  const backIssue = (id: string) => {
    if (backed.includes(id)) return;
    setBacked((b) => [...b, id]);
    setIssues((list) => list.map((i) => i.id === id ? { ...i, supporters: i.supporters + 1 } : i));
    Toast.show({ content: t.supportAdded, position: "bottom" });
  };

  const submitReport = () => {
    if (!extraction) return;
    const newIssue: Issue = {
      id: `PK-14${40 + issues.length}`, category: extraction.category, titleEn: extraction.title_en, titleHi: extraction.title_hi,
      descriptionEn: extraction.description_en, descriptionHi: extraction.description_hi, address: "Near your current location · Jayanagar", lat: WARD_CENTER[0] - 0.0004, lng: WARD_CENTER[1] - 0.0007,
      image: photo ?? assetPath("/images/pothole-ambedkar.jpg"), supporters: 1, aliases: ["You"], status: "reported", severity: extraction.severity,
      reportedAgoEn: "Just now", reportedAgoHi: "अभी", departmentEn: "Finding the right team", departmentHi: "सही टीम ढूँढ रहे हैं", roleEn: "Ward control room", roleHi: "वार्ड नियंत्रण कक्ष",
      escalationEn: "Ward officer · 1800-14-0014", escalationHi: "वार्ड अधिकारी · 1800-14-0014", expectedEn: "Update within 24 hours", expectedHi: "24 घंटे में अपडेट", mine: true,
      timeline: [{ status: "reported", labelEn: "Submitted", labelHi: "जमा हुई", date: "Just now", noteEn: "Photo and approximate location added", noteHi: "फोटो और अनुमानित जगह जोड़ी गई" }],
    };
    setIssues((list) => [newIssue, ...list]); setSelectedId(newIssue.id); navigate("success");
  };

  const confirmFix = () => {
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "confirmed", timeline: [...i.timeline, { status: "confirmed", labelEn: "Confirmed by you", labelHi: "आपने पुष्टि की", date: "Just now", noteEn: "You confirmed the repair", noteHi: "आपने मरम्मत की पुष्टि की" }] } : i));
    navigate("confirmed");
  };

  const contestFix = () => {
    if (!contestPhoto) return;
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "contested", timeline: [...i.timeline, { status: "contested", labelEn: "Reopened by you", labelHi: "आपने फिर खोला", date: "Just now", noteEn: "New photo shows the issue is still there", noteHi: "नई फोटो में समस्या अभी भी है" }] } : i));
    navigate("issue");
  };

  const nearby = useMemo(() => [...issues].sort((a, b) => b.supporters - a.supporters), [issues]);
  const myIssues = issues.filter((issue) => issue.mine);
  const backedIssues = backed.map((id) => issues.find((issue) => issue.id === id)).filter((issue): issue is Issue => issue != null && !issue.mine);
  const carouselPeek = "calc(var(--carousel-height) + var(--space-10))";

  return (
    <div className="app-root">
      {offline && <div className="offline-banner"><CircleAlert size={15} />{t.offline}</div>}
      {screen === "nearby" && <>
        <div className="nearby-stage" style={{ ["--sheet-peek" as string]: carouselPeek }}>
          <MapLoader issues={nearby} selected={highlighted} onSelect={highlightIssue} recenterNonce={recenterNonce} locale={locale} />
          <div className="map-chrome">
            <div className="map-brand"><span className="brand-dot" />pakka<small>{t.ward}</small></div>
            <button className="language-button" onClick={() => setLocale(locale === "en" ? "hi" : "en")} aria-label={t.languageAria}>
              <Globe2 size={16} />{t.language}
            </button>
          </div>
          <button className="map-recenter" onClick={() => setRecenterNonce((n) => n + 1)} aria-label={t.recenter}>
            <LocateFixed size={18} />
          </button>
          <IssueCarousel
            issues={nearby}
            selectedId={highlightedId}
            locale={locale}
            t={t}
            onSelect={highlightIssue}
            onOpen={chooseIssue}
          />
        </div>
        <BottomNav screen={screen} onNavigate={navigate} t={t} />
      </>}

      {screen === "mine" && <>
        <div className="screen-scroll">
          <Header locale={locale} setLocale={setLocale} t={t} />
          <section className="page-title">
            <h1 className="type-heading-lg">{t.reports}</h1>
            <p className="type-body-md">{t.mineIntro}</p>
          </section>
          <section className="mine-feed">
            {myIssues.length === 0 && backedIssues.length === 0 && (
              <div className="empty-state">
                <span className="asset-empty-state" data-asset-id="empty.nearby" aria-hidden><MapPin size={48} /></span>
                <h2 className="type-heading-sm">{t.empty}</h2>
                <p className="type-body-md">{t.emptyHelp}</p>
              </div>
            )}
            <div className="issue-list">
              {myIssues.map((issue) => <IssueCard key={issue.id} issue={issue} locale={locale} t={t} selected={false} onClick={() => chooseIssue(issue)} />)}
              {backedIssues.map((issue) => <IssueCard key={`backed-${issue.id}`} issue={issue} locale={locale} t={t} selected={false} onClick={() => chooseIssue(issue)} />)}
            </div>
          </section>
        </div>
        <BottomNav screen={screen} onNavigate={navigate} t={t} />
      </>}

      {screen === "issue" && <IssueDetail issue={selected} locale={locale} t={t} backed={backed.includes(selected.id)} onBack={() => navigate("nearby")} onBackIssue={() => backIssue(selected.id)} onConfirm={confirmFix} onContest={() => navigate("contest")} />}
      {screen === "capture" && <CaptureScreen locale={locale} t={t} photo={photo} locationState={locationState} fileRef={fileRef} onBack={() => navigate("nearby")} onFile={(f) => readFile(f)} onDemoPhoto={loadDemoPhoto} onLocation={requestLocation} onContinue={analyze} />}
      {screen === "analyzing" && <AnalyzingScreen t={t} photo={photo} />}
      {screen === "review" && extraction && <ReviewScreen locale={locale} t={t} extraction={extraction} setExtraction={setExtraction} photo={photo} locationState={locationState} contact={contact} setContact={setContact} duplicate={issues.find((i) => i.id === extraction.duplicate_id)} different={different} setDifferent={setDifferent} onBack={() => navigate("capture")} onBackExisting={(i) => { backIssue(i.id); setSelectedId(i.id); navigate("issue"); }} onSubmit={submitReport} />}
      {screen === "success" && <ResultScreen icon="sent" eyebrow={t.submittedEyebrow} title={t.submitted} body={t.submittedHelp} primary={t.viewReport} onPrimary={() => navigate("issue")} />}
      {screen === "contest" && <ContestScreen t={t} photo={contestPhoto} fileRef={contestRef} onFile={(f) => readFile(f, true)} onBack={() => navigate("issue")} onSubmit={contestFix} />}
      {screen === "confirmed" && <ResultScreen icon="confirmed" eyebrow={t.confirmedEyebrow} title={t.confirmedTitle} body={t.confirmedHelp} primary={t.makeCard} onPrimary={() => navigate("story")} secondary={t.viewReport} onSecondary={() => navigate("issue")} />}
      {screen === "story" && <div className="full-page"><TopBar title={t.shareCardTitle} onBack={() => navigate("confirmed")} /><div className="story-page"><h1 className="type-heading-lg">{t.shareCardTitle}</h1><p className="type-body-md">{t.shareCardHelp}</p><StoryCard locale={locale} t={t} /></div></div>}
    </div>
  );
}

function IssueCard({ issue, locale, t, selected, onClick }: { issue: Issue; locale: Locale; t: ReturnType<typeof getCopy>; selected: boolean; onClick: () => void }) {
  return (
    <button className={`issue-card ${selected ? "is-selected" : ""}`} data-issue-id={issue.id} onClick={onClick} aria-pressed={selected}>
      <span className="issue-card-media">
        {issue.image ? <img src={issue.image} alt="" /> : <CategoryIcon category={issue.category} size={28} />}
      </span>
      <span className="issue-card-body">
        <span className="issue-card-meta">
          <CategoryIcon category={issue.category} size={14} />
          <span>{issue.category}</span>
          <StatusPill issue={issue} locale={locale} />
        </span>
        <strong className="issue-card-title type-heading-sm">{local(issue, locale, "title")}</strong>
        <span className="issue-card-support type-caption">{issue.supporters} {t.supporters}</span>
      </span>
    </button>
  );
}

function TopBar({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return <header className="top-bar"><NavBar backArrow={<ArrowLeft size={21} />} onBack={onBack} right={action}>{title}</NavBar></header>;
}

function IssueDetail({ issue, locale, t, backed, onBack, onBackIssue, onConfirm, onContest }: { issue: Issue; locale: Locale; t: ReturnType<typeof getCopy>; backed: boolean; onBack: () => void; onBackIssue: () => void; onConfirm: () => void; onContest: () => void }) {
  return <div className="full-page issue-detail">
    <TopBar title={issue.id} onBack={onBack} action={<StatusPill issue={issue} locale={locale} />} />
    <div className="issue-hero"><img src={issue.image} alt={t.photoAlt} /><div className="evidence-stamp"><ShieldCheck size={15} />{t.photoStamp}</div></div>
    <article className="detail-copy">
      <div className="detail-meta"><span>{issue.category}</span><span>·</span><span>{local(issue, locale, "reportedAgo")}</span></div>
      <h1 className="type-heading-lg">{local(issue, locale, "title")}</h1>
      <p className="type-body-md">{local(issue, locale, "description")}</p>
      <div className="location-line"><MapPin size={17} /><div><strong className="type-label-md">{issue.address}</strong><span className="type-caption">{t.locationPublicApprox}</span></div></div>
      <button className={`backing-button ${backed ? "done" : ""}`} onClick={onBackIssue} disabled={backed}><Users size={18} /><strong>{backed ? t.backed : t.seeToo}</strong><span>{issue.supporters} {t.supporters}</span></button>
      <section className="proof-section">
        <div className="sheet-header" style={{ padding: 0 }}>
          <h2 className="type-heading-sm">{t.timeline}</h2>
          <span className="type-caption">{formatCopy(t.updatesCount, { count: issue.timeline.length })}</span>
        </div>
        <div className="timeline">{issue.timeline.map((event, index) => <div className={`timeline-event ${index === issue.timeline.length - 1 ? "latest" : ""}`} key={`${event.status}-${event.date}`}><span className="timeline-node">{index < issue.timeline.length - 1 ? <Check size={12} /> : <span />}</span><div><strong className="type-label-md">{locale === "hi" ? event.labelHi : event.labelEn}</strong><time className="type-caption">{event.date}</time>{(locale === "hi" ? event.noteHi : event.noteEn) && <p className="type-caption">{locale === "hi" ? event.noteHi : event.noteEn}</p>}</div></div>)}</div>
      </section>
      <section className="owner-card"><p className="eyebrow">{t.responsibility}</p><h2 className="type-heading-sm">{local(issue, locale, "department")}</h2><dl><div><dt>{t.assigned}</dt><dd>{local(issue, locale, "role")}</dd></div><div><dt>{t.expected}</dt><dd>{local(issue, locale, "expected")}</dd></div><div><dt>{t.escalation}</dt><dd>{local(issue, locale, "escalation")}</dd></div></dl></section>
      {issue.status === "awaiting_confirmation" && <section className="confirm-card"><div className="confirmation-seal"><ShieldCheck size={24} /></div><p className="eyebrow">{t.statusCheckFix}</p><h2 className="type-heading-md">{t.awaiting}</h2><p className="type-body-md">{t.inspect}</p><Button block color="success" size="large" className="primary-button green" onClick={onConfirm}><Check size={18} />{t.fixed}</Button><Button block fill="outline" size="large" className="secondary-button danger" onClick={onContest}><X size={18} />{t.broken}</Button></section>}
      {issue.status === "confirmed" && <p className="type-body-md">{t.confirmedByResidents}</p>}
    </article>
  </div>;
}

function CaptureScreen({ t, photo, locationState, fileRef, onBack, onFile, onDemoPhoto, onLocation, onContinue }: { locale: Locale; t: ReturnType<typeof getCopy>; photo: string | null; locationState: string; fileRef: React.RefObject<HTMLInputElement | null>; onBack: () => void; onFile: (f?: File) => void; onDemoPhoto: () => void; onLocation: () => void; onContinue: () => void }) {
  return <div className="full-page capture-page"><TopBar title={t.reportProblem} onBack={onBack} /><div className="capture-copy"><p className="eyebrow">{t.captureStep}</p><h1 className="type-heading-lg">{t.capture}</h1><p className="type-body-md">{t.captureHelp}</p></div>
    <input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} />
    <button className={`camera-stage ${photo ? "has-photo" : ""}`} onClick={onDemoPhoto}>{photo ? <><img src={photo} alt={t.photoAlt} /><span><RotateCcw size={16} />{t.retakePhoto}</span></> : <><div className="camera-lens"><Camera size={34} /></div><strong className="type-label-md">{t.camera}</strong><span className="type-caption">{t.demoPhotoHint}</span></>}</button>
    <button className="gallery-button" onClick={() => fileRef.current?.click()}><ImagePlus size={17} />{t.upload}</button>
    <div className="capture-location"><button onClick={onLocation}><LocateFixed size={18} />{locationState === "loading" ? t.locating : t.location}</button>{locationState === "ready" && <span className="location-ok"><Check size={14} />{t.locationReady}</span>}{locationState === "denied" && <span className="location-warn"><CircleAlert size={14} />{t.permission}</span>}</div>
    <div className="sticky-action"><Button block color="primary" size="large" className="primary-button" disabled={!photo} onClick={onContinue}>{t.continue}<ArrowRight size={18} /></Button></div>
  </div>;
}

function AnalyzingScreen({ t, photo }: { t: ReturnType<typeof getCopy>; photo: string | null }) {
  return <div className="analysis-screen">{photo && <img src={photo} alt="" />}<div className="scan-line" /><div className="analysis-card"><span className="ai-orbit"><Sparkles size={24} /></span><h1 className="type-heading-lg">{t.aiReading}</h1><p className="type-body-md">{t.aiHelp}</p><div className="analysis-steps"><span className="done"><Check size={13} />{t.analysisPhoto}</span><span className="active"><span className="spinner" />{t.analysisCategory}</span><span>{t.analysisWriting}</span></div></div></div>;
}

function ReviewScreen({ locale, t, extraction, setExtraction, photo, locationState, contact, setContact, duplicate, different, setDifferent, onBack, onBackExisting, onSubmit }: { locale: Locale; t: ReturnType<typeof getCopy>; extraction: AIExtraction; setExtraction: (e: AIExtraction) => void; photo: string | null; locationState: string; contact: string; setContact: (v: string) => void; duplicate?: Issue; different: boolean; setDifferent: (v: boolean) => void; onBack: () => void; onBackExisting: (i: Issue) => void; onSubmit: () => void }) {
  const categories: Category[] = ["Roads", "Waste", "Water", "Lighting", "Drainage"];
  const titleKey = locale === "hi" ? "title_hi" : "title_en";
  const descKey = locale === "hi" ? "description_hi" : "description_en";
  return <div className="full-page review-page"><TopBar title={t.review} onBack={onBack} /><div className="review-evidence">{photo && <img src={photo} alt={t.photoAlt} />}<div><span><MapPin size={14} />{locationState === "ready" ? t.locationReady : t.locationApprox}</span><small><Sparkles size={12} />{t.aiSuggestion}</small></div></div>
    <div className="review-form">
      {duplicate && !different && <div className="duplicate-card"><p className="eyebrow">{t.duplicate}</p><h3 className="type-heading-sm">{local(duplicate, locale, "title")}</h3><p className="type-caption">{t.duplicateHelp}</p><p className="type-caption">{duplicate.supporters} {t.supporters} · {duplicate.address}</p><button type="button" onClick={() => onBackExisting(duplicate)}><Users size={17} />{t.seeToo}</button><button type="button" className="text-button" onClick={() => setDifferent(true)}>{t.different}</button></div>}
      <label><span>{t.category}</span><div className="category-chips">{categories.map((category) => <button type="button" key={category} className={extraction.category === category ? "selected" : ""} aria-pressed={extraction.category === category} onClick={() => setExtraction({ ...extraction, category })}><CategoryIcon category={category} size={16} /> {category}</button>)}</div></label>
      <label><span>{t.title}</span><input value={extraction[titleKey]} onChange={(e) => setExtraction({ ...extraction, [titleKey]: e.target.value })} /></label>
      <label><span>{t.description}</span><textarea rows={3} value={extraction[descKey]} onChange={(e) => setExtraction({ ...extraction, [descKey]: e.target.value })} /></label>
      <label><span>{t.contact}</span><input type="text" inputMode="email" autoComplete="email" placeholder={t.contactPlaceholder} value={contact} onChange={(e) => setContact(e.target.value)} /><small><ShieldCheck size={13} />{t.contactHelp} {t.anonymous}</small></label>
      <Button block color="primary" size="large" className="primary-button" onClick={onSubmit}>{t.submit}<ArrowRight size={18} /></Button>
    </div>
  </div>;
}

function ContestScreen({ t, photo, fileRef, onFile, onBack, onSubmit }: { t: ReturnType<typeof getCopy>; photo: string | null; fileRef: React.RefObject<HTMLInputElement | null>; onFile: (f?: File) => void; onBack: () => void; onSubmit: () => void }) {
  return <div className="full-page contest-page"><TopBar title={t.reopen} onBack={onBack} /><div className="capture-copy"><p className="eyebrow">{t.contestStep}</p><h1 className="type-heading-lg">{t.contestTitle}</h1><p className="type-body-md">{t.contestHelp}</p></div><input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} /><button className={`contest-upload ${photo ? "has-photo" : ""}`} onClick={() => fileRef.current?.click()}>{photo ? <img src={photo} alt={t.photoAlt} /> : <><ImagePlus size={30} /><strong className="type-label-md">{t.camera}</strong><span className="type-caption">{t.upload}</span></>}</button><div className="contest-note"><ShieldCheck size={18} /><p className="type-caption">{t.contestNote}</p></div><div className="sticky-action"><Button block color="danger" size="large" className="primary-button danger-fill" disabled={!photo} onClick={onSubmit}>{t.reopen}<ArrowRight size={18} /></Button></div></div>;
}

function ResultScreen({ icon, eyebrow, title, body, primary, onPrimary, secondary, onSecondary }: { icon: "sent" | "confirmed"; eyebrow: string; title: string; body: string; primary: string; onPrimary: () => void; secondary?: string; onSecondary?: () => void }) {
  return <div className={`result-screen ${icon}`}><div className="result-mark">{icon === "confirmed" ? <ShieldCheck size={52} /> : <><span className="pulse-ring" /><Check size={45} /></>}</div><p className="eyebrow">{eyebrow}</p><h1 className="type-display-lg">{title}</h1><p className="type-body-md">{body}</p><div className="result-proof"><span /><span /><span /><span className="active" /></div><Button block color="primary" size="large" className="primary-button" onClick={onPrimary}>{primary}<ArrowRight size={18} /></Button>{secondary && <Button block fill="outline" size="large" className="secondary-button" onClick={onSecondary}>{secondary}</Button>}</div>;
}
