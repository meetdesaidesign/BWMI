"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

export type SheetSnap = "collapsed" | "medium" | "expanded";

const EXPANDED_PEEK = 80;

function snapOffsets(height: number) {
  const collapsedVisible = Math.min(208, Math.max(148, height * 0.42));
  return {
    expanded: EXPANDED_PEEK,
    medium: Math.max(height * 0.48, collapsedVisible + 24),
    collapsed: Math.max(height - collapsedVisible, EXPANDED_PEEK + 48),
  };
}

export function ResultsSheet({
  snap,
  onSnap,
  header,
  children,
  ariaLabel = "Nearby issues",
  handleLabel = "Resize results",
}: {
  snap: SheetSnap;
  onSnap: (snap: SheetSnap) => void;
  header: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  handleLabel?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const drag = useRef<{ startY: number; startTy: number } | null>(null);
  const [height, setHeight] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const sync = () => setHeight(el.clientHeight);
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    sync();
    return () => observer.disconnect();
  }, []);

  const points = snapOffsets(height || 640);
  const translateY = points[snap];

  const nearest = (value: number): SheetSnap => {
    const keys: SheetSnap[] = ["expanded", "medium", "collapsed"];
    return keys.reduce((best, key) => (Math.abs(points[key] - value) < Math.abs(points[best] - value) ? key : best));
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startTy: points[snap] };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || !sheetRef.current) return;
    const next = Math.min(points.collapsed, Math.max(points.expanded, drag.current.startTy + (event.clientY - drag.current.startY)));
    sheetRef.current.style.transform = `translateY(${next}px)`;
  };

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const next = Math.min(points.collapsed, Math.max(points.expanded, drag.current.startTy + (event.clientY - drag.current.startY)));
    const moved = Math.abs(event.clientY - drag.current.startY);
    drag.current = null;
    setDragging(false);
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (moved < 8) {
      onSnap(snap === "collapsed" ? "medium" : snap === "medium" ? "expanded" : "medium");
      return;
    }
    onSnap(nearest(next));
  };

  return (
    <div ref={rootRef} className="results-sheet-host">
      <section
        ref={sheetRef}
        className={`results-sheet ${dragging ? "" : "is-animated"}`}
        role="region"
        aria-label={ariaLabel}
        style={{ transform: `translateY(${translateY}px)` }}
      >
        <button
          type="button"
          className="sheet-handle"
          aria-label={handleLabel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
        >
          <span />
        </button>
        {header}
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  );
}
