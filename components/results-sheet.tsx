"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

export type SheetSnap = "collapsed" | "selected" | "half" | "expanded";

function snapOffsets(height: number) {
  return {
    collapsed: Math.max(height - 84, 0),
    selected: Math.max(height - 188, 0),
    half: height * 0.55,
    expanded: height * 0.28,
  };
}

export function ResultsSheet({
  snap,
  onSnap,
  selected,
  header,
  selectedCard,
  children,
  ariaLabel = "Nearby issues",
  handleLabel = "Resize results",
  onPeek,
}: {
  snap: SheetSnap;
  onSnap: (snap: SheetSnap) => void;
  selected: boolean;
  header: ReactNode;
  selectedCard?: ReactNode;
  children: ReactNode;
  ariaLabel?: string;
  handleLabel?: string;
  onPeek?: (px: number) => void;
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
  const allowed: SheetSnap[] = selected ? ["selected", "half", "expanded"] : ["collapsed", "half", "expanded"];

  useEffect(() => {
    onPeek?.(Math.max(0, (height || 640) - translateY));
  }, [height, translateY, onPeek]);

  const nearest = (value: number): SheetSnap => {
    return allowed.reduce((best, key) => (Math.abs(points[key] - value) < Math.abs(points[best] - value) ? key : best));
  };

  const setPeek = (ty: number) => {
    const host = rootRef.current;
    if (!host) return;
    host.style.setProperty("--sheet-peek", `${Math.max(0, (height || 640) - ty)}px`);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startY: event.clientY, startTy: points[snap] };
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current || !sheetRef.current) return;
    const min = points.expanded;
    const max = selected ? points.selected : points.collapsed;
    const next = Math.min(max, Math.max(min, drag.current.startTy + (event.clientY - drag.current.startY)));
    sheetRef.current.style.transform = `translateY(${next}px)`;
    setPeek(next);
  };

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) return;
    const min = points.expanded;
    const max = selected ? points.selected : points.collapsed;
    const next = Math.min(max, Math.max(min, drag.current.startTy + (event.clientY - drag.current.startY)));
    const moved = Math.abs(event.clientY - drag.current.startY);
    drag.current = null;
    setDragging(false);
    if (sheetRef.current) sheetRef.current.style.transform = "";
    if (moved < 8) {
      const order: SheetSnap[] = selected ? ["selected", "half", "expanded"] : ["collapsed", "half", "expanded"];
      const index = order.indexOf(snap);
      onSnap(order[Math.min(order.length - 1, index + 1)] ?? snap);
      return;
    }
    onSnap(nearest(next));
  };

  return (
    <div ref={rootRef} className="results-sheet-host" style={{ ["--sheet-peek" as string]: `${Math.max(0, (height || 640) - translateY)}px` }}>
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
        {selected && snap === "selected" && selectedCard ? selectedCard : <div className="sheet-body">{children}</div>}
      </section>
    </div>
  );
}
