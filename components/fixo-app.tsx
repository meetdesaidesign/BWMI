"use client";

/* eslint-disable @next/next/no-img-element -- user-captured data URLs and local evidence require native img previews */

import {
  ArrowRight, Building2, Check, CircleAlert, Globe2,
  ImagePlus, MapPin, ShieldCheck,
  Sparkles, Users, X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button, Toast } from "antd-mobile";
import { formatCopy, getCategoryLabel, getCopy, getStatusLabel, localizedField } from "@/lib/i18n";
import { LOCALE_META, resolveInitialLocale, writeStoredLocale } from "@/lib/locale";
import { seedIssues, WARD_CENTER } from "@/lib/seed";
import { areaContext, authorityForCategory, officerDisplayName, resolveIssueAuthority } from "@/lib/authority";
import { composeEscalationPost, escalationHandles, postIntentUrl } from "@/lib/share";
import { locateInWard, namedPlace } from "@/lib/geo";
import { assetPath } from "@/lib/assets";
import { LOCATION_ACCURACY_LIMIT_M, PHOTO_MIN_EDGE_PX } from "@/lib/config";
import { clearDraft, readDraft, writeDraft } from "@/lib/draft";
import type { AIExtraction, AnalysisStatus, Authority, Category, Issue, Locale, LocationFix, PhotoIssue } from "@/lib/types";
import { StoryCard } from "./story-card";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileSheet } from "./profile-sheet";
import { CategoryIcon } from "./category-icon";
import { NearbyScreen, type NearbyScreenHandle } from "./nearby-screen";
import { ProblemCard } from "./problem-card";
import { LanguageSheet } from "./language-sheet";
import { BottomNavigation } from "./bottom-navigation";
import { TopBar } from "./top-bar";
import { CaptureScreen, type LocationAction } from "./capture-screen";
import { PinSheet } from "./pin-sheet";
import { OverlaySheet } from "./overlay-sheet";
import { readStoredPhoneVerified, writeStoredPhoneVerified } from "@/lib/profile";

type Screen = "nearby" | "mine" | "issue" | "capture" | "analyzing" | "review" | "success" | "contest" | "confirmed" | "story";
type HomeScreen = "nearby" | "mine";

const reportFlow: Screen[] = ["capture", "analyzing", "review"];

function isReportHistory(state: unknown) {
  return Boolean(state && typeof state === "object" && "fixo" in state && (state as { fixo?: string }).fixo === "report");
}

const statusClass: Record<Issue["status"], string> = {
  reported: "slate", acknowledged: "slate", in_progress: "amber", awaiting_confirmation: "violet", confirmed: "green", contested: "red",
};

const idleLocation: LocationFix = { status: "prompt", point: null, accuracyM: null, blocked: false, manual: false };

/** Step 2 stays editable when classification produces nothing usable. */
const blankExtraction: AIExtraction = {
  category: "Other",
  title_en: "", title_hi: "", title_kn: "",
  description_en: "", description_hi: "", description_kn: "",
  severity: "medium", confidence: 0, needs_user_review: true,
};

const staticDemoExtraction: AIExtraction = {
  category: "Roads",
  title_en: "Deep pothole with broken road surface",
  title_hi: "टूटी सड़क पर गहरा गड्ढा",
  title_kn: "ಒಡೆದ ರಸ್ತೆಯಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ",
  description_en: "A large pothole and crumbling asphalt create a serious hazard for two-wheelers.",
  description_hi: "बड़ा गड्ढा और टूटी हुई सड़क दोपहिया वाहनों के लिए गंभीर खतरा है।",
  description_kn: "ದೊಡ್ಡ ಗುಂಡಿ ಮತ್ತು ಒಡೆದ ರಸ್ತೆ ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಗಂಭೀರ ಅಪಾಯ.",
  severity: "high",
  confidence: 0.94,
  needs_user_review: false,
  duplicate_id: "FX-14028",
};

function local(issue: Issue, locale: Locale, field: "title" | "description" | "reportedAgo" | "department" | "role" | "escalation" | "expected") {
  return localizedField(issue as unknown as Record<string, unknown>, locale, field);
}

function Header({ locale, t, phoneVerified, onLanguage, onOpenProfile }: { locale: Locale; t: ReturnType<typeof getCopy>; phoneVerified: boolean; onLanguage: () => void; onOpenProfile: () => void }) {
  return (
    <header className="page-header">
      <button
        type="button"
        className="map-profile page-profile"
        onClick={onOpenProfile}
        aria-label={phoneVerified ? t.profileAriaVerified : t.profileAria}
      >
        <ProfileAvatar size={38} verified={phoneVerified} alt="" />
      </button>
      <button className="language-button" onClick={onLanguage} aria-label={t.languageAria}>
        <Globe2 size={16} />{LOCALE_META[locale].shortLabel}
      </button>
    </header>
  );
}

function StatusPill({ issue, locale }: { issue: Issue; locale: Locale }) {
  return <span className={`status-pill ${statusClass[issue.status]}`}>{getStatusLabel(issue.status, locale)}</span>;
}

export function FixoApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [screen, setScreen] = useState<Screen>("nearby");
  const [issues, setIssues] = useState(seedIssues);
  const [selectedId, setSelectedId] = useState(seedIssues[0].id);
  const [backed, setBacked] = useState<string[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoIssue, setPhotoIssue] = useState<PhotoIssue>("none");
  const [analysis, setAnalysis] = useState<AnalysisStatus>("idle");
  const [location, setLocation] = useState<LocationFix>(idleLocation);
  const [pinOpen, setPinOpen] = useState(false);
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const [extraction, setExtraction] = useState<AIExtraction | null>(null);
  const [contact, setContact] = useState("");
  const [different, setDifferent] = useState(false);
  const [contestPhoto, setContestPhoto] = useState<string | null>(null);
  const [hintReport, setHintReport] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const contestRef = useRef<HTMLInputElement>(null);
  const analysisRun = useRef(0);
  const advancing = useRef(false);
  const nearbyRef = useRef<NearbyScreenHandle>(null);
  const mineScrollRef = useRef<HTMLDivElement>(null);
  const lastHome = useRef<HomeScreen>("nearby");
  const openingReport = useRef(false);
  const t = getCopy(locale);
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];

  useEffect(() => {
    setLocale(resolveInitialLocale());
    setPhoneVerified(readStoredPhoneVerified());
    const draft = readDraft();
    if (!draft) return;
    if (draft.photo) { setPhoto(draft.photo); setPhotoBase64(draft.photo); }
    if (draft.location) setLocation(draft.location);
  }, []);

  useEffect(() => {
    writeStoredLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(max-width: 599px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem("fixo-report-hint")) return;
      sessionStorage.setItem("fixo-report-hint", "1");
    } catch {
      return;
    }
    setHintReport(true);
    const timer = window.setTimeout(() => setHintReport(false), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const sync = () => setKeyboardOpen(window.innerHeight - viewport.height > 96);
    sync();
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);
    return () => {
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
    };
  }, []);

  useEffect(() => {
    const onPop = () => {
      /* A sheet closing above the report pops its own entry — stay in the flow. */
      if (isReportHistory(history.state)) return;
      setScreen((current) => (reportFlow.includes(current) ? lastHome.current : current));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* Keep step 1 recoverable across a reload, which is the point of an offline draft. */
  useEffect(() => {
    if (!photo && !location.manual) return;
    writeDraft({ photo, location });
  }, [photo, location]);

  /* The analysing screen is a waiting room: it hands off as soon as work settles. */
  useEffect(() => {
    if (screen !== "analyzing") return;
    if (analysis === "done" && extraction) { navigate("review"); return; }
    if (analysis === "failed") setScreen("capture");
  }, [screen, analysis, extraction]);

  const isHome = screen === "nearby" || screen === "mine";

  const goHome = (next: HomeScreen) => {
    lastHome.current = next;
    setScreen(next);
  };

  const navigate = (next: Screen) => {
    if (next === "nearby" || next === "mine") lastHome.current = next;
    setScreen(next);
    document.querySelector(".phone-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAroundYou = () => {
    if (screen === "nearby") {
      nearbyRef.current?.resetPeek();
      return;
    }
    goHome("nearby");
  };

  const onMyReports = () => {
    if (screen === "mine") {
      mineScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    goHome("mine");
  };

  const openReport = () => {
    if (reportFlow.includes(screen) || openingReport.current) return;
    openingReport.current = true;
    void primeLocation();
    if (!isReportHistory(history.state)) history.pushState({ fixo: "report" }, "");
    setScreen("capture");
    window.setTimeout(() => { openingReport.current = false; }, 400);
  };

  const leaveReport = () => {
    if (isReportHistory(history.state)) {
      history.back();
      return;
    }
    goHome(lastHome.current);
  };

  /** Ask before discarding only when there is something to lose (spec section 8). */
  const closeReport = () => {
    if (photo || location.manual) { setDiscardOpen(true); return; }
    leaveReport();
  };

  const discardReport = () => {
    setDiscardOpen(false);
    resetReport();
    leaveReport();
  };

  const resetReport = () => {
    analysisRun.current += 1;
    clearDraft();
    setPhoto(null); setPhotoBase64(null); setPhotoIssue("none");
    setAnalysis("idle"); setExtraction(null); setDifferent(false);
    setLocation(idleLocation);
  };

  const chooseIssue = (issue: Issue) => { setSelectedId(issue.id); navigate("issue"); };

  const readFile = (file?: File, contest = false) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { Toast.show({ content: t.photoUnclear, position: "bottom" }); return; }
    if (file.size > 8 * 1024 * 1024) { Toast.show({ content: t.photoTooLarge, position: "bottom" }); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      if (contest) { setContestPhoto(url); return; }
      /* Decode first: an image we cannot render is not usable evidence. */
      const probe = new Image();
      probe.onload = () => {
        setPhoto(url); setPhotoBase64(url);
        setPhotoIssue(Math.min(probe.naturalWidth, probe.naturalHeight) < PHOTO_MIN_EDGE_PX ? "unclear" : "none");
        void runAnalysis(url);
      };
      probe.onerror = () => Toast.show({ content: t.photoUnclear, position: "bottom" });
      probe.src = url;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    analysisRun.current += 1;
    setPhoto(null); setPhotoBase64(null); setPhotoIssue("none");
    setAnalysis("idle"); setExtraction(null);
    clearDraft();
    Toast.show({ content: t.photoRemoved, position: "bottom" });
  };

  const continueAsGuest = async () => {
    if (advancing.current) return;
    advancing.current = true;
    try {
      const response = await fetch(assetPath("/images/demo-pothole.jpg"));
      if (!response.ok) throw new Error("sample missing");
      const blob = await response.blob();
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(new File([blob], "demo-pothole.jpg", { type: "image/jpeg" }));
      });
      setPhoto(url);
      setPhotoBase64(url);
      setPhotoIssue("none");
      if (location.status !== "ready" && location.status !== "approximate") {
        setLocation({
          status: "ready",
          point: WARD_CENTER,
          accuracyM: 35,
          blocked: false,
          manual: false,
        });
      }
      void runAnalysis(url);
      navigate("analyzing");
    } catch {
      Toast.show({ content: t.guestPhotoFailed, position: "bottom" });
    } finally {
      window.setTimeout(() => { advancing.current = false; }, 500);
    }
  };

  const resolveLocation = () => {
    if (!navigator.geolocation) { setLocation((fix) => ({ ...fix, status: "unavailable", blocked: true })); return; }
    setLocation((fix) => ({ ...fix, status: "finding" }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracyM = position.coords.accuracy;
        setLocation({
          status: accuracyM > LOCATION_ACCURACY_LIMIT_M ? "approximate" : "ready",
          point: locateInWard(position.coords.latitude, position.coords.longitude),
          accuracyM,
          blocked: false,
          manual: false,
        });
      },
      (error) => setLocation((fix) => (
        fix.status === "ready" || fix.status === "approximate"
          ? fix
          : { ...fix, status: "unavailable", blocked: error.code === error.PERMISSION_DENIED }
      )),
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  /**
   * Resolve quietly when permission already exists; otherwise leave the row on
   * 'Add location' rather than firing an unexplained prompt (spec section 7).
   */
  const primeLocation = async () => {
    if (location.status !== "prompt") return;
    try {
      const permission = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
      if (permission?.state === "granted") { resolveLocation(); return; }
      if (permission?.state === "denied") setLocation((fix) => ({ ...fix, blocked: true }));
    } catch {
      /* Permissions API unavailable — wait for the resident to ask. */
    }
  };

  const onLocationAction = (action: LocationAction) => {
    if (action === "change" || action === "adjust") { setPinOpen(true); return; }
    if (action === "retry" && location.blocked) { setPinOpen(true); return; }
    if (action === "use" && location.blocked) { setPinOpen(true); return; }
    if (action === "use") { setRationaleOpen(true); return; }
    resolveLocation();
  };

  const confirmPin = (point: [number, number]) => {
    setPinOpen(false);
    setLocation((fix) => ({ ...fix, status: "ready", point, accuracyM: null, manual: true }));
  };

  /** Upload and classify in the background as soon as a photo exists (spec section 7). */
  const runAnalysis = async (image: string) => {
    const run = ++analysisRun.current;
    setAnalysis("running");
    setPhotoIssue((issue) => (issue === "uploadFailed" ? "none" : issue));

    if (process.env.NEXT_PUBLIC_STATIC_DEMO === "true") {
      window.setTimeout(() => {
        if (analysisRun.current !== run) return;
        setExtraction(staticDemoExtraction);
        setAnalysis("done");
      }, 900);
      return;
    }

    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
      if (!response.ok) throw new Error("analysis failed");
      const result = await response.json() as AIExtraction;
      if (analysisRun.current !== run) return;
      /* A reply we cannot use is not an upload failure — step 2 opens blank and editable. */
      setExtraction(result?.category ? result : blankExtraction);
      setAnalysis("done");
    } catch {
      if (analysisRun.current !== run) return;
      setAnalysis("failed");
      setPhotoIssue("uploadFailed");
    }
  };

  const retryAnalysis = () => {
    if (!photoBase64) return;
    void runAnalysis(photoBase64);
  };

  const openReview = () => {
    if (!photo || !photoBase64) return;
    if (location.status !== "ready" && location.status !== "approximate") return;
    if (advancing.current) return;
    advancing.current = true;
    window.setTimeout(() => { advancing.current = false; }, 500);
    if (analysis === "done" && extraction) { navigate("review"); return; }
    if (analysis !== "running") void runAnalysis(photoBase64);
    navigate("analyzing");
  };

  const backIssue = (id: string) => {
    if (backed.includes(id)) return;
    setBacked((b) => [...b, id]);
    setIssues((list) => list.map((i) => i.id === id ? { ...i, supporters: i.supporters + 1 } : i));
    Toast.show({ content: t.supportAdded, position: "bottom" });
  };

  const submitReport = () => {
    if (!extraction) return;
    const now = new Date().toISOString();
    const reportPoint = location.point ?? [WARD_CENTER[0] - 0.0004, WARD_CENTER[1] - 0.0007];
    const id = `FX-14${40 + issues.length}`;
    /* Category routing resolves immediately, so the resident leaves the flow
       knowing which desk and which officer now holds the report. */
    const owner = authorityForCategory(extraction.category, id);
    const assignedTo = (loc: Locale) => {
      const officer = officerDisplayName(owner, loc);
      return officer ? `${owner.roleName[loc]} · ${officer}` : owner.roleName[loc];
    };
    const newIssue: Issue = {
      id, category: extraction.category,       titleEn: extraction.title_en, titleHi: extraction.title_hi, titleKn: extraction.title_kn || extraction.title_en,
      descriptionEn: extraction.description_en, descriptionHi: extraction.description_hi, descriptionKn: extraction.description_kn || extraction.description_en, address: namedPlace(reportPoint[0], reportPoint[1], locale, t.locationArea), lat: reportPoint[0], lng: reportPoint[1],
      image: photo ?? assetPath("/images/pothole-ambedkar.jpg"), supporters: 1, aliases: ["You"], status: "reported", severity: extraction.severity,
      reportedAgoEn: "Just now", reportedAgoHi: "अभी", reportedAgoKn: "ಈಗಷ್ಟೇ", reportedAt: now, updatedAt: now,
      departmentEn: owner.departmentName.en, departmentHi: owner.departmentName.hi, departmentKn: owner.departmentName.kn, roleEn: assignedTo("en"), roleHi: assignedTo("hi"), roleKn: assignedTo("kn"),
      escalationEn: `${owner.wardOffice.en} · ${owner.officialContact}`, escalationHi: `${owner.wardOffice.hi} · ${owner.officialContact}`, escalationKn: `${owner.wardOffice.kn} · ${owner.officialContact}`, expectedEn: "Update within 3 working days", expectedHi: "3 कार्यदिवस में अपडेट", expectedKn: "3 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಅಪ್‌ಡೇಟ್", mine: true, routingPending: false, trust: [],
      timeline: [{ status: "reported", labelEn: "Submitted", labelHi: "जमा हुई", labelKn: "ಸಲ್ಲಿಸಲಾಗಿದೆ", date: "Just now", noteEn: "Photo and approximate location added", noteHi: "फोटो और अनुमानित जगह जोड़ी गई", noteKn: "ಫೋಟೋ ಮತ್ತು ಅಂದಾಜು ಸ್ಥಳ ಸೇರಿಸಲಾಗಿದೆ" }],
    };
    setIssues((list) => [newIssue, ...list]); setSelectedId(newIssue.id);
    clearDraft();
    navigate("success");
  };

  const confirmFix = () => {
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "confirmed", timeline: [...i.timeline, { status: "confirmed", labelEn: "Confirmed by you", labelHi: "आपने पुष्टि की", labelKn: "ನೀವು ದೃಢಪಡಿಸಿದ್ದೀರಿ", date: "Just now", noteEn: "You confirmed the repair", noteHi: "आपने मरम्मत की पुष्टि की", noteKn: "ನೀವು ದುರಸ್ತಿಯನ್ನು ದೃಢಪಡಿಸಿದ್ದೀರಿ" }] } : i));
    navigate("confirmed");
  };

  const contestFix = () => {
    if (!contestPhoto) return;
    setIssues((list) => list.map((i) => i.id === selected.id ? { ...i, status: "contested", timeline: [...i.timeline, { status: "contested", labelEn: "Reopened by you", labelHi: "आपने फिर खोला", labelKn: "ನೀವು ಮತ್ತೆ ತೆರೆದಿದ್ದೀರಿ", date: "Just now", noteEn: "New photo shows the issue is still there", noteHi: "नई फोटो में समस्या अभी भी है", noteKn: "ಹೊಸ ಫೋಟೋದಲ್ಲಿ ಸಮಸ್ಯೆ ಇನ್ನೂ ಇದೆ" }] } : i));
    navigate("issue");
  };

  const myIssues = issues.filter((issue) => issue.mine);
  const backedIssues = backed.map((id) => issues.find((issue) => issue.id === id)).filter((issue): issue is Issue => issue != null && !issue.mine);

  return (
    <div className="app-root">
      {offline && <div className="offline-banner"><CircleAlert size={15} />{t.offline}</div>}
      <div className={`home-stack${isHome ? "" : " is-covered"}${keyboardOpen ? " is-nav-hidden" : ""}`} {...(!isHome ? { inert: true, "aria-hidden": true } : {})}>
        <div className="home-body">
          <div className={`screen-pane${screen === "mine" ? " is-dormant" : ""}`} {...(screen === "mine" ? { inert: true, "aria-hidden": true } : {})}>
            <NearbyScreen
              ref={nearbyRef}
              issues={issues}
              locale={locale}
              t={t}
              offline={offline}
              onChangeLocale={setLocale}
              onOpenIssue={chooseIssue}
              onReport={openReport}
              onOpenProfile={() => setProfileOpen(true)}
              phoneVerified={phoneVerified}
            />
          </div>
          <div className={`screen-pane${screen === "mine" ? "" : " is-dormant"}`} {...(screen !== "mine" ? { inert: true, "aria-hidden": true } : {})}>
            <div className="screen-scroll" ref={mineScrollRef}>
              <Header locale={locale} t={t} phoneVerified={phoneVerified} onLanguage={() => setLanguageOpen(true)} onOpenProfile={() => setProfileOpen(true)} />
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
                  {myIssues.map((issue) => <ProblemCard key={issue.id} issue={issue} locale={locale} t={t} onClick={() => chooseIssue(issue)} />)}
                  {backedIssues.map((issue) => <ProblemCard key={`backed-${issue.id}`} issue={issue} locale={locale} t={t} onClick={() => chooseIssue(issue)} />)}
                </div>
              </section>
            </div>
          </div>
        </div>
        <BottomNavigation
          activeItem={screen === "mine" ? "reports" : "around"}
          onAroundYou={onAroundYou}
          onMyReports={onMyReports}
          onReport={openReport}
          hidden={keyboardOpen}
          hint={hintReport}
          t={t}
        />
      </div>

      {!isHome && (
        <div className="flow-layer">
          {screen === "issue" && <IssueDetail issue={selected} locale={locale} t={t} backed={backed.includes(selected.id)} onBack={() => goHome(lastHome.current)} onBackIssue={() => backIssue(selected.id)} onConfirm={confirmFix} onContest={() => navigate("contest")} />}
          {screen === "capture" && (
            <CaptureScreen
              t={t}
              locale={locale}
              photo={photo}
              photoIssue={photoIssue}
              analysis={analysis}
              location={location}
              routedTo={areaContext.authority.departmentName[locale]}
              offline={offline}
              onBack={closeReport}
              onFile={(file) => readFile(file)}
              onRemovePhoto={removePhoto}
              onContinueAsGuest={continueAsGuest}
              onLocationAction={onLocationAction}
              onRetryAnalysis={retryAnalysis}
              onContinue={openReview}
            />
          )}
          {screen === "analyzing" && <AnalyzingScreen t={t} photo={photo} />}
          {screen === "review" && extraction && <ReviewScreen locale={locale} t={t} extraction={extraction} setExtraction={setExtraction} photo={photo} location={location} contact={contact} setContact={setContact} duplicate={issues.find((i) => i.id === extraction.duplicate_id)} different={different} setDifferent={setDifferent} onBack={() => navigate("capture")} onBackExisting={(i) => { backIssue(i.id); setSelectedId(i.id); navigate("issue"); }} onSubmit={submitReport} />}
          {screen === "success" && <SubmittedScreen issue={selected} locale={locale} t={t} onViewReport={() => navigate("issue")} />}
          {screen === "contest" && <ContestScreen t={t} photo={contestPhoto} fileRef={contestRef} onFile={(f) => readFile(f, true)} onBack={() => navigate("issue")} onSubmit={contestFix} />}
          {screen === "confirmed" && <ResultScreen icon="confirmed" eyebrow={t.confirmedEyebrow} title={t.confirmedTitle} body={t.confirmedHelp} primary={t.makeCard} onPrimary={() => navigate("story")} secondary={t.viewReport} onSecondary={() => navigate("issue")} />}
          {screen === "story" && <div className="full-page"><TopBar title={t.shareCardTitle} onBack={() => navigate("confirmed")} /><div className="story-page"><h1 className="type-heading-lg">{t.shareCardTitle}</h1><p className="type-body-md">{t.shareCardHelp}</p><StoryCard locale={locale} t={t} /></div></div>}
        </div>
      )}
      <LanguageSheet open={languageOpen} locale={locale} t={t} onClose={() => setLanguageOpen(false)} onChange={setLocale} />
      <PinSheet open={pinOpen} t={t} center={location.point} onClose={() => setPinOpen(false)} onConfirm={confirmPin} />
      <OverlaySheet open={rationaleOpen} title={t.locationAllow} onClose={() => setRationaleOpen(false)} closeLabel={t.close} titleClassName="type-heading-sm">
        <p className="type-body-md">{t.locationWhy}</p>
        <div className="sheet-actions">
          <Button block color="primary" size="large" className="primary-button" onClick={() => { setRationaleOpen(false); resolveLocation(); }}>{t.locationAllow}</Button>
          <Button block fill="outline" size="large" className="secondary-button" onClick={() => { setRationaleOpen(false); setPinOpen(true); }}>{t.locationSetManually}</Button>
        </div>
      </OverlaySheet>
      <OverlaySheet open={discardOpen} title={t.discardTitle} onClose={() => setDiscardOpen(false)} closeLabel={t.close} titleClassName="type-heading-sm">
        <p className="type-body-md">{t.discardHelp}</p>
        <div className="sheet-actions">
          <Button block fill="outline" size="large" className="secondary-button danger" onClick={discardReport}>{t.discardConfirm}</Button>
          <Button block color="primary" size="large" className="primary-button" onClick={() => setDiscardOpen(false)}>{t.discardKeep}</Button>
        </div>
      </OverlaySheet>
      <ProfileSheet
        open={profileOpen}
        t={t}
        verified={phoneVerified}
        reportCount={myIssues.length}
        areaLabel={t.ward}
        onVerify={() => {
          setPhoneVerified(true);
          writeStoredPhoneVerified(true);
        }}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
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
        <div className="timeline">{issue.timeline.map((event, index) => <div className={`timeline-event ${index === issue.timeline.length - 1 ? "latest" : ""}`} key={`${event.status}-${event.date}`}><span className="timeline-node">{index < issue.timeline.length - 1 ? <Check size={12} /> : <span />}</span><div><strong className="type-label-md">{locale === "hi" ? event.labelHi : locale === "kn" ? event.labelKn : event.labelEn}</strong><time className="type-caption">{event.date}</time>{(locale === "hi" ? event.noteHi : locale === "kn" ? event.noteKn : event.noteEn) && <p className="type-caption">{locale === "hi" ? event.noteHi : locale === "kn" ? event.noteKn : event.noteEn}</p>}</div></div>)}</div>
      </section>
      <section className="owner-card"><p className="eyebrow">{t.responsibility}</p><h2 className="type-heading-sm">{local(issue, locale, "department")}</h2><dl><div><dt>{t.assigned}</dt><dd>{local(issue, locale, "role")}</dd></div><div><dt>{t.expected}</dt><dd>{local(issue, locale, "expected")}</dd></div><div><dt>{t.escalation}</dt><dd>{local(issue, locale, "escalation")}</dd></div></dl></section>
      {issue.status === "awaiting_confirmation" && <section className="confirm-card"><div className="confirmation-seal"><ShieldCheck size={24} /></div><p className="eyebrow">{t.statusCheckFix}</p><h2 className="type-heading-md">{t.awaiting}</h2><p className="type-body-md">{t.inspect}</p><Button block color="success" size="large" className="primary-button green" onClick={onConfirm}><Check size={18} />{t.fixed}</Button><Button block fill="outline" size="large" className="secondary-button danger" onClick={onContest}><X size={18} />{t.broken}</Button></section>}
      {issue.status === "confirmed" && <p className="type-body-md">{t.confirmedByResidents}</p>}
    </article>
  </div>;
}

/**
 * Duplicate match — deliberately small. Supporting an existing report is a
 * one-tap side road off step 2, not a decision that deserves half the screen,
 * so this stays a single strip: what matched, how many back it, two actions.
 */
function DuplicateNotice({ duplicate, locale, t, onBackExisting, onDismiss }: { duplicate: Issue; locale: Locale; t: ReturnType<typeof getCopy>; onBackExisting: (i: Issue) => void; onDismiss: () => void }) {
  return (
    <aside className="duplicate-notice" aria-label={t.duplicateAria}>
      <p className="duplicate-notice-label"><Users size={13} aria-hidden />{t.duplicate}</p>
      <div className="duplicate-notice-match">
        {duplicate.image
          ? <img className="duplicate-notice-thumb" src={duplicate.image} alt="" />
          : <span className="duplicate-notice-thumb is-icon"><CategoryIcon category={duplicate.category} size={18} /></span>}
        <span className="duplicate-notice-body">
          <strong className="type-label-md">{local(duplicate, locale, "title")}</strong>
          <span className="type-caption">{duplicate.supporters} {t.supporters} · {duplicate.address}</span>
        </span>
      </div>
      <div className="duplicate-notice-actions">
        <button type="button" className="duplicate-notice-support" onClick={() => onBackExisting(duplicate)}>{t.seeToo}</button>
        <button type="button" className="duplicate-notice-dismiss" onClick={onDismiss}>{t.different}</button>
      </div>
    </aside>
  );
}

function XLogo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("");
}

/** Who owns this report, named where the roster names someone. */
function AssigneeCard({ authority, locale, t }: { authority: Authority; locale: Locale; t: ReturnType<typeof getCopy> }) {
  const officer = officerDisplayName(authority, locale);
  return (
    <section className="assignee-card">
      <p className="eyebrow">{t.assignedEyebrow}</p>
      <div className="assignee-row">
        <span className={`assignee-avatar${officer ? "" : " is-office"}`} aria-hidden>
          {officer ? initialsOf(officer) : <Building2 size={19} />}
        </span>
        <span className="assignee-body">
          <strong className="type-label-md">
            {officer ?? authority.roleName[locale]}
            {officer && authority.officerVerified ? <ShieldCheck size={14} className="assignee-verified" aria-label={t.assignedVerified} /> : null}
          </strong>
          <span className="type-caption">{officer ? authority.roleName[locale] : t.assignedNoOfficer}</span>
          <span className="type-caption">{authority.departmentName[locale]} · {authority.wardOffice[locale]}</span>
        </span>
      </div>
    </section>
  );
}

/**
 * The escalation path residents already use — a public post tagging the office —
 * pre-written, so it costs one tap instead of an evening of drafting.
 */
function EscalateCard({ post, t }: { post: string; t: ReturnType<typeof getCopy> }) {
  return (
    <section className="escalate-card">
      <p className="eyebrow">{t.escalateEyebrow}</p>
      <p className="escalate-draft">{post}</p>
      <a
        className="escalate-post"
        href={postIntentUrl(post)}
        target="_blank"
        rel="noreferrer"
        aria-label={t.shareOnXAria}
      >
        <XLogo size={15} />{t.shareOnX}
      </a>
      <p className="escalate-note type-caption">{t.escalateDemoNote}</p>
    </section>
  );
}

function AnalyzingScreen({ t, photo }: { t: ReturnType<typeof getCopy>; photo: string | null }) {
  return <div className="analysis-screen">{photo && <img src={photo} alt="" />}<div className="scan-line" /><div className="analysis-card"><span className="ai-orbit"><Sparkles size={24} /></span><h1 className="type-heading-lg">{t.aiReading}</h1><p className="type-body-md">{t.aiHelp}</p><div className="analysis-steps"><span className="done"><Check size={13} />{t.analysisPhoto}</span><span className="active"><span className="spinner" />{t.analysisCategory}</span><span>{t.analysisWriting}</span></div></div></div>;
}

function ReviewScreen({ locale, t, extraction, setExtraction, photo, location, contact, setContact, duplicate, different, setDifferent, onBack, onBackExisting, onSubmit }: { locale: Locale; t: ReturnType<typeof getCopy>; extraction: AIExtraction; setExtraction: (e: AIExtraction) => void; photo: string | null; location: LocationFix; contact: string; setContact: (v: string) => void; duplicate?: Issue; different: boolean; setDifferent: (v: boolean) => void; onBack: () => void; onBackExisting: (i: Issue) => void; onSubmit: () => void }) {
  const categories: Category[] = ["Roads", "Waste", "Water", "Lighting", "Drainage", "Other"];
  const titleKey = locale === "hi" ? "title_hi" : locale === "kn" && extraction.title_kn ? "title_kn" : "title_en";
  const descKey = locale === "hi" ? "description_hi" : locale === "kn" && extraction.description_kn ? "description_kn" : "description_en";
  const place = location.point
    ? namedPlace(location.point[0], location.point[1], locale, t.locationArea)
    : t.locationArea;
  const accuracy = location.accuracyM;
  const metres = accuracy === null ? null : accuracy >= 100 ? Math.round(accuracy / 10) * 10 : Math.round(accuracy);
  const placeLine = location.status === "approximate"
    ? formatCopy(t.locationApprox, { place })
    : metres === null
      ? place
      : formatCopy(t.locationReady, { place, m: metres });
  return <div className="full-page review-page"><TopBar title={t.review} onBack={onBack} /><div className="review-evidence">{photo && <img src={photo} alt={t.photoAlt} />}<div><span><MapPin size={14} />{placeLine}</span></div></div>
    <div className="review-form">
      {duplicate && !different && <DuplicateNotice duplicate={duplicate} locale={locale} t={t} onBackExisting={onBackExisting} onDismiss={() => setDifferent(true)} />}
      <label><span>{t.category}</span><div className="category-chips">{categories.map((category) => <button type="button" key={category} className={extraction.category === category ? "selected" : ""} aria-pressed={extraction.category === category} onClick={() => setExtraction({ ...extraction, category })}><CategoryIcon category={category} size={16} /> {getCategoryLabel(category, locale)}</button>)}</div></label>
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

/**
 * Submitted — the moment a resident decides whether fixo is worth trusting. It
 * answers "who has it now?" by name, and hands over the escalation post they
 * would otherwise write themselves a fortnight later.
 */
function SubmittedScreen({ issue, locale, t, onViewReport }: { issue: Issue; locale: Locale; t: ReturnType<typeof getCopy>; onViewReport: () => void }) {
  const authority = resolveIssueAuthority(issue);
  const post = composeEscalationPost({
    template: t.postTemplate,
    hashtags: t.postHashtags,
    title: local(issue, locale, "title"),
    area: `${areaContext.ward[locale]} · ${areaContext.areaName[locale]}`,
    id: issue.id,
    handles: escalationHandles(authority, areaContext.representatives),
  });

  return (
    <ResultScreen
      icon="sent"
      eyebrow={t.submittedEyebrow}
      title={t.submitted}
      body={t.submittedHelp}
      meta={
        <div className="submitted-detail">
          <AssigneeCard authority={authority} locale={locale} t={t} />
          <EscalateCard post={post} t={t} />
        </div>
      }
      primary={t.viewReport}
      onPrimary={onViewReport}
    />
  );
}

function ResultScreen({ icon, eyebrow, title, body, meta, primary, onPrimary, secondary, onSecondary }: { icon: "sent" | "confirmed"; eyebrow: string; title: string; body: string; meta?: React.ReactNode; primary: string; onPrimary: () => void; secondary?: string; onSecondary?: () => void }) {
  return <div className={`result-screen ${icon}`}><div className="result-mark">{icon === "confirmed" ? <ShieldCheck size={52} /> : <><span className="pulse-ring" /><Check size={45} /></>}</div><p className="eyebrow">{eyebrow}</p><h1 className="type-display-lg">{title}</h1><p className="type-body-md">{body}</p>{meta}<div className="result-proof"><span /><span /><span /><span className="active" /></div><Button block color="primary" size="large" className="primary-button" onClick={onPrimary}>{primary}<ArrowRight size={18} /></Button>{secondary && <Button block fill="outline" size="large" className="secondary-button" onClick={onSecondary}>{secondary}</Button>}</div>;
}
