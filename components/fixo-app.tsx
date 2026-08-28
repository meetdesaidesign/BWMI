"use client";

/* eslint-disable @next/next/no-img-element -- user-captured data URLs and local evidence require native img previews */

import {
  ArrowRight, CircleAlert,
  ImagePlus, ShieldCheck,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Toast } from "antd-mobile";
import { getCopy } from "@/lib/i18n";
import { resolveInitialLocale, writeStoredLocale } from "@/lib/locale";
import { seedIssues, WARD_CENTER } from "@/lib/seed";
import { areaContext, authorityForCategory, officerDisplayName } from "@/lib/authority";
import { locateInWard, namedPlace } from "@/lib/geo";
import { assetPath } from "@/lib/assets";
import { LOCATION_ACCURACY_LIMIT_M, PHOTO_MIN_EDGE_PX } from "@/lib/config";
import { clearDraft, readDraft, writeDraft } from "@/lib/draft";
import type { AIExtraction, AnalysisStatus, Issue, Locale, LocationFix, PhotoIssue } from "@/lib/types";
import { StoryCard } from "./story-card";
import { ProfileSheet } from "./profile-sheet";
import { NearbyScreen, type NearbyScreenHandle } from "./nearby-screen";
import { MineScreen } from "./mine-screen";
import { LanguageSheet } from "./language-sheet";
import { BottomNavigation } from "./bottom-navigation";
import { TopBar } from "./top-bar";
import { CaptureScreen, type LocationAction } from "./capture-screen";
import { ReviewScreen } from "./review-screen";
import { PinSheet } from "./pin-sheet";
import { OverlaySheet } from "./overlay-sheet";
import { IssueDetail } from "./issue-detail";
import { SubmittedScreen } from "./submitted-screen";
import { ConfirmedScreen } from "./confirmed-screen";
import { readStoredIdentityVerified, writeStoredIdentityVerified } from "@/lib/profile";

type Screen = "nearby" | "mine" | "issue" | "capture" | "review" | "success" | "contest" | "confirmed" | "story";
type HomeScreen = "nearby" | "mine";
type HandoffPhase = "idle" | "analyzing" | "flight";
type PhotoBox = { top: number; left: number; width: number; height: number; radius: string };
type PhotoFlight = {
  src: string;
  from: PhotoBox;
  tx: number;
  ty: number;
  clipFrom: string;
  clipTo: string;
  moving: boolean;
};

const reportFlow: Screen[] = ["capture", "review"];
const ANALYSIS_MIN_MS = 600;
const ANALYSIS_SLOW_MS = 4000;
const ANALYSIS_SETTLE_MS = 180;
const OVERLAY_FADE_MS = 120;
const PHOTO_FLIGHT_MS = 400;

function clipInset(top: number, right: number, bottom: number, left: number, radius: string) {
  return `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius || "16px"})`;
}

function relativeBox(el: HTMLElement, root: HTMLElement): PhotoBox {
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return {
    top: a.top - b.top,
    left: a.left - b.left,
    width: a.width,
    height: a.height,
    radius: getComputedStyle(el).borderTopLeftRadius,
  };
}

function extractionUsable(extraction: AIExtraction | null) {
  if (!extraction) return false;
  if (!extraction.title_en.trim()) return false;
  if (extraction.needs_user_review && extraction.confidence < 0.4) return false;
  return true;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isReportHistory(state: unknown) {
  return Boolean(state && typeof state === "object" && "fixo" in state && (state as { fixo?: string }).fixo === "report");
}

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
  title_en: "Deep pothole with damaged road surface",
  title_hi: "टूटी सड़क पर गहरा गड्ढा",
  title_kn: "ಒಡೆದ ರಸ್ತೆಯಲ್ಲಿ ಆಳವಾದ ಗುಂಡಿ",
  description_en: "Large pothole and crumbling asphalt may be dangerous for two-wheelers.",
  description_hi: "बड़ा गड्ढा और टूटी हुई सड़क दोपहिया वाहनों के लिए गंभीर खतरा है।",
  description_kn: "ದೊಡ್ಡ ಗುಂಡಿ ಮತ್ತು ಒಡೆದ ರಸ್ತೆ ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಗಂಭೀರ ಅಪಾಯ.",
  severity: "high",
  confidence: 0.94,
  needs_user_review: false,
  duplicate_id: "FX-14028",
};

export function FixoApp() {
  const [locale, setLocale] = useState<Locale>("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [identityVerified, setIdentityVerified] = useState(false);
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
  const openingIssue = useRef(false);
  const [homeLeaving, setHomeLeaving] = useState(false);
  const appRootRef = useRef<HTMLDivElement>(null);
  const photoFromRef = useRef<HTMLDivElement>(null);
  const photoToRef = useRef<HTMLDivElement>(null);
  const handoffGen = useRef(0);
  const handoffStarted = useRef(0);
  const skipExtraction = useRef(false);
  const flightDone = useRef(false);
  const [handoff, setHandoff] = useState<HandoffPhase>("idle");
  const [handoffSlow, setHandoffSlow] = useState(false);
  const [handoffFailed, setHandoffFailed] = useState(false);
  const [handoffExiting, setHandoffExiting] = useState(false);
  const [flight, setFlight] = useState<PhotoFlight | null>(null);
  const [playFill, setPlayFill] = useState(false);
  const [fillMode, setFillMode] = useState<"stagger" | "instant">("stagger");
  const t = getCopy(locale);
  const selected = issues.find((i) => i.id === selectedId) ?? issues[0];

  useEffect(() => {
    setLocale(resolveInitialLocale());
    setIdentityVerified(readStoredIdentityVerified());
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

  useEffect(() => {
    if (handoff !== "analyzing" || handoffFailed) return;
    const gen = handoffGen.current;
    if (analysis !== "done" && analysis !== "failed") return;
    const timers: number[] = [];
    const wait = Math.max(0, ANALYSIS_MIN_MS - (Date.now() - handoffStarted.current));
    timers.push(window.setTimeout(() => {
      if (handoffGen.current !== gen) return;
      if (analysis === "failed" || !extractionUsable(extraction)) {
        setHandoffFailed(true);
        return;
      }
      timers.push(window.setTimeout(() => {
        if (handoffGen.current !== gen) return;
        const fromEl = photoFromRef.current;
        const root = appRootRef.current;
        const reduced = prefersReducedMotion();
        if (!photo || !fromEl || !root || reduced) {
          setFillMode(reduced ? "instant" : "stagger");
          setPlayFill(!reduced);
          setHandoffExiting(false);
          setHandoff("idle");
          setScreen("review");
          return;
        }
        const from = relativeBox(fromEl, root);
        const clipFrom = clipInset(0, 0, 0, 0, from.radius);
        setHandoffExiting(true);
        timers.push(window.setTimeout(() => {
          if (handoffGen.current !== gen) return;
          flightDone.current = false;
          setFillMode("stagger");
          setPlayFill(false);
          setFlight({
            src: photo,
            from,
            tx: 0,
            ty: 0,
            clipFrom,
            clipTo: clipFrom,
            moving: false,
          });
          setHandoffExiting(false);
          setHandoff("flight");
          setScreen("review");
        }, OVERLAY_FADE_MS));
      }, ANALYSIS_SETTLE_MS));
    }, wait));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [handoff, handoffFailed, analysis, extraction, photo]);

  useEffect(() => {
    if (handoff !== "analyzing" || handoffFailed) return;
    const timer = window.setTimeout(() => setHandoffSlow(true), ANALYSIS_SLOW_MS);
    return () => window.clearTimeout(timer);
  }, [handoff, handoffFailed]);

  useLayoutEffect(() => {
    if (handoff !== "flight" || !flight || flight.moving) return;
    const toEl = photoToRef.current;
    const root = appRootRef.current;
    if (!toEl || !root) return;
    const to = relativeBox(toEl, root);
    const from = flight.from;
    const clipX = Math.max(0, (from.width - to.width) / 2);
    const clipY = Math.max(0, (from.height - to.height) / 2);
    const tx = to.left - from.left - clipX;
    const ty = to.top - from.top - clipY;
    const clipTo = clipInset(clipY, clipX, clipY, clipX, to.radius);
    const frame = window.requestAnimationFrame(() => {
      setFlight((current) => (current ? { ...current, tx, ty, clipTo, moving: true } : current));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [handoff, flight]);

  useEffect(() => {
    if (handoff !== "flight" || !flight?.moving) return;
    const timer = window.setTimeout(finishFlight, PHOTO_FLIGHT_MS + 80);
    return () => window.clearTimeout(timer);
  }, [handoff, flight?.moving]);

  const isHome = screen === "nearby" || screen === "mine";

  const goHome = (next: HomeScreen) => {
    lastHome.current = next;
    setScreen(next);
  };

  const navigate = (next: Screen) => {
    if (next === "nearby" || next === "mine") lastHome.current = next;
    setScreen(next);
    document.querySelector(".phone-shell")?.scrollTo({ top: 0, behavior: "auto" });
  };

  const cancelHandoff = () => {
    handoffGen.current += 1;
    setHandoff("idle");
    setHandoffSlow(false);
    setHandoffFailed(false);
    setHandoffExiting(false);
    setFlight(null);
  };

  const beginHandoff = () => {
    handoffGen.current += 1;
    skipExtraction.current = false;
    flightDone.current = false;
    handoffStarted.current = Date.now();
    setHandoffSlow(false);
    setHandoffFailed(false);
    setHandoffExiting(false);
    setPlayFill(false);
    setFillMode("stagger");
    setHandoff("analyzing");
  };

  const openReviewNow = (mode: "stagger" | "instant") => {
    setFillMode(mode);
    setPlayFill(mode === "stagger");
    setHandoff("idle");
    setFlight(null);
    setHandoffSlow(false);
    setHandoffFailed(false);
    setHandoffExiting(false);
    navigate("review");
  };

  const finishFlight = () => {
    if (flightDone.current) return;
    flightDone.current = true;
    setFlight(null);
    setHandoff("idle");
    setPlayFill(true);
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
    skipExtraction.current = false;
    cancelHandoff();
    clearDraft();
    setPhoto(null); setPhotoBase64(null); setPhotoIssue("none");
    setAnalysis("idle"); setExtraction(null); setDifferent(false);
    setLocation(idleLocation);
    setPlayFill(false);
    setFillMode("stagger");
  };

  const chooseIssue = (issue: Issue) => {
    if (openingIssue.current) return;
    openingIssue.current = true;
    setSelectedId(issue.id);
    setHomeLeaving(true);
    window.setTimeout(() => {
      navigate("issue");
      setHomeLeaving(false);
      window.setTimeout(() => { openingIssue.current = false; }, 140);
    }, prefersReducedMotion() ? 0 : 80);
  };

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
        cancelHandoff();
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
    cancelHandoff();
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
      beginHandoff();
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
        if (skipExtraction.current) {
          setAnalysis("done");
          return;
        }
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
      if (skipExtraction.current) {
        setAnalysis("done");
        return;
      }
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
    if (advancing.current || handoff !== "idle") return;
    advancing.current = true;
    window.setTimeout(() => { advancing.current = false; }, 500);
    if (analysis !== "running" && analysis !== "done") void runAnalysis(photoBase64);
    beginHandoff();
  };

  const fillManually = () => {
    skipExtraction.current = true;
    handoffGen.current += 1;
    setExtraction((current) => current ?? blankExtraction);
    openReviewNow("instant");
  };

  const backIssue = (id: string, showToast = true) => {
    if (backed.includes(id)) return;
    setBacked((b) => [...b, id]);
    setIssues((list) => list.map((i) => i.id === id ? { ...i, supporters: i.supporters + 1 } : i));
    if (showToast) Toast.show({ content: t.supportAdded, position: "bottom" });
  };

  const unBackIssue = (id: string) => {
    if (!backed.includes(id)) return;
    setBacked((b) => b.filter((item) => item !== id));
    setIssues((list) => list.map((i) => i.id === id ? { ...i, supporters: Math.max(0, i.supporters - 1) } : i));
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
      escalationEn: `${owner.wardOffice.en} · ${owner.officialContact}`, escalationHi: `${owner.wardOffice.hi} · ${owner.officialContact}`, escalationKn: `${owner.wardOffice.kn} · ${owner.officialContact}`, expectedEn: "Update within 2 working days", expectedHi: "2 कार्यदिवस में अपडेट", expectedKn: "2 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಅಪ್‌ಡೇಟ್", mine: true, routingPending: false, trust: [],
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
    <div className="app-root" ref={appRootRef}>
      {offline && <div className="offline-banner"><CircleAlert size={15} />{t.offline}</div>}
      <div className={`home-stack${isHome ? "" : " is-covered"}${keyboardOpen ? " is-nav-hidden" : ""}${homeLeaving ? " is-leaving" : ""}`} {...(!isHome ? { inert: true, "aria-hidden": true } : {})}>
        <div className="home-body">
          <div className={`screen-pane${screen === "mine" ? " is-dormant" : ""}`} {...(screen === "mine" ? { inert: true, "aria-hidden": true } : {})}>
            <NearbyScreen
              ref={nearbyRef}
              issues={issues}
              locale={locale}
              t={t}
              offline={offline}
              onOpenIssue={chooseIssue}
              onOpenProfile={() => setProfileOpen(true)}
              identityVerified={identityVerified}
            />
          </div>
          <div className={`screen-pane${screen === "mine" ? "" : " is-dormant"}`} {...(screen !== "mine" ? { inert: true, "aria-hidden": true } : {})}>
            <MineScreen
              visible={screen === "mine"}
              raised={myIssues}
              supported={backedIssues}
              locale={locale}
              t={t}
              identityVerified={identityVerified}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenIssue={chooseIssue}
              onReport={openReport}
              onExploreNearby={onAroundYou}
              scrollRef={mineScrollRef}
            />
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
          {screen === "issue" && (
            <IssueDetail
              issue={selected}
              locale={locale}
              t={t}
              backed={backed.includes(selected.id)}
              offline={offline}
              onBack={() => goHome(lastHome.current)}
              onBackIssue={() => backIssue(selected.id)}
              onUndoConfirm={() => unBackIssue(selected.id)}
              onConfirm={confirmFix}
              onContest={() => navigate("contest")}
              onViewMap={() => {
                goHome("nearby");
                nearbyRef.current?.focusIssue(selected.id);
              }}
            />
          )}
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
              analyzing={handoff === "analyzing"}
              analysisSlow={handoffSlow}
              analysisFailed={handoffFailed}
              analysisComplete={analysis === "done" && extractionUsable(extraction)}
              analysisExiting={handoffExiting}
              photoCardRef={photoFromRef}
              onBack={handoff === "analyzing" ? cancelHandoff : closeReport}
              onFile={(file) => readFile(file)}
              onRemovePhoto={removePhoto}
              onContinueAsGuest={continueAsGuest}
              onLocationAction={onLocationAction}
              onRetryAnalysis={retryAnalysis}
              onContinue={openReview}
              onFillManually={fillManually}
              onEnterDetails={fillManually}
            />
          )}
          {screen === "review" && extraction && (
            <ReviewScreen
              locale={locale}
              t={t}
              extraction={extraction}
              setExtraction={setExtraction}
              photo={photo}
              photoRef={photoToRef}
              photoReady={handoff !== "flight"}
              location={location}
              duplicate={issues.find((issue) => issue.id === extraction.duplicate_id)}
              different={different}
              setDifferent={setDifferent}
              fillMode={fillMode}
              playFill={playFill}
              onBack={() => { cancelHandoff(); setPlayFill(false); navigate("capture"); }}
              onEditLocation={() => setPinOpen(true)}
              onBackExisting={(issue) => {
                backIssue(issue.id, false);
                setSelectedId(issue.id);
                navigate("issue");
                Toast.show({
                  content: <span><strong>Your support was added</strong><br />This report now has support from {issue.supporters + (backed.includes(issue.id) ? 0 : 1)} neighbours.</span>,
                  duration: 3500,
                  position: "bottom",
                });
              }}
              onSubmit={submitReport}
            />
          )}
          {screen === "success" && <SubmittedScreen issue={selected} locale={locale} t={t} onTrackReport={() => navigate("issue")} />}
          {screen === "contest" && <ContestScreen t={t} photo={contestPhoto} fileRef={contestRef} onFile={(f) => readFile(f, true)} onBack={() => navigate("issue")} onSubmit={contestFix} />}
          {screen === "confirmed" && (
            <ConfirmedScreen
              issue={selected}
              locale={locale}
              t={t}
              onClose={() => goHome(lastHome.current)}
              onViewReport={() => navigate("issue")}
              onShare={() => navigate("story")}
            />
          )}
          {screen === "story" && (
            <div className="full-page story-screen">
              <TopBar title={t.shareCardTitle} onBack={() => navigate("confirmed")} />
              <StoryCard issue={selected} locale={locale} t={t} />
            </div>
          )}
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
        locale={locale}
        identityVerified={identityVerified}
        reportCount={myIssues.length}
        areaLabel={t.ward}
        onVerify={() => {
          setIdentityVerified(true);
          writeStoredIdentityVerified(true);
        }}
        onOpenLanguage={() => {
          setProfileOpen(false);
          setLanguageOpen(true);
        }}
        onClose={() => setProfileOpen(false)}
      />
      {flight && (
        <div
          className={`photo-handoff${flight.moving ? " is-moving" : ""}`}
          style={{
            top: flight.from.top,
            left: flight.from.left,
            width: flight.from.width,
            height: flight.from.height,
            transform: `translate3d(${flight.moving ? flight.tx : 0}px, ${flight.moving ? flight.ty : 0}px, 0)`,
            clipPath: flight.moving ? flight.clipTo : flight.clipFrom,
          }}
          onTransitionEnd={(event) => {
            if (event.propertyName !== "transform") return;
            finishFlight();
          }}
        >
          <img src={flight.src} alt="" />
        </div>
      )}
    </div>
  );
}

function ContestScreen({ t, photo, fileRef, onFile, onBack, onSubmit }: { t: ReturnType<typeof getCopy>; photo: string | null; fileRef: React.RefObject<HTMLInputElement | null>; onFile: (f?: File) => void; onBack: () => void; onSubmit: () => void }) {
  return <div className="full-page contest-page"><TopBar title={t.reopen} onBack={onBack} /><div className="capture-copy"><p className="eyebrow">{t.contestStep}</p><h1 className="type-heading-lg">{t.contestTitle}</h1><p className="type-body-md">{t.contestHelp}</p></div><input ref={fileRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} /><button className={`contest-upload ${photo ? "has-photo" : ""}`} onClick={() => fileRef.current?.click()}>{photo ? <img src={photo} alt={t.photoAlt} /> : <><ImagePlus size={30} /><strong className="type-label-md">{t.camera}</strong><span className="type-caption">{t.upload}</span></>}</button><div className="contest-note"><ShieldCheck size={18} /><p className="type-caption">{t.contestNote}</p></div><div className="sticky-action"><Button block color="danger" size="large" className="primary-button danger-fill" disabled={!photo} onClick={onSubmit}>{t.reopen}<ArrowRight size={18} /></Button></div></div>;
}
