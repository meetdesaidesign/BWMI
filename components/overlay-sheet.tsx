"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type OverlayDismissMethod = "close" | "backdrop" | "escape" | "back" | "swipe";

const DRAG_THRESHOLD = 8;
const INTERACTIVE = "button, [role='button'], a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])";
const FOCUSABLE = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function focusableIn(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export function OverlaySheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  closeLabel,
  titleClassName = "type-heading-md",
  className,
  footerClassName,
  showHandle = false,
  closeAppearance = "well",
}: {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: (method?: OverlayDismissMethod) => void;
  children: ReactNode;
  footer?: ReactNode;
  closeLabel: string;
  titleClassName?: string;
  className?: string;
  footerClassName?: string;
  showHandle?: boolean;
  closeAppearance?: "well" | "plain";
}) {
  const titleId = useId();
  const overlayId = useId();
  const sheetRef = useRef<HTMLElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dragStart = useRef<number | null>(null);
  const dragging = useRef(false);
  const [host, setHost] = useState<Element | null>(null);
  const [dragY, setDragY] = useState(0);
  onCloseRef.current = onClose;

  useEffect(() => {
    setHost(document.querySelector(".app-root") ?? document.body);
  }, []);

  useEffect(() => {
    if (!open || !host) return;
    restoreFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const app = document.querySelector(".app-root");
    const inertTargets: HTMLElement[] = [];
    if (app) {
      for (const child of app.children) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.dataset.overlayId === overlayId) continue;
        child.inert = true;
        inertTargets.push(child);
      }
    }

    const focusFirst = () => {
      sheetRef.current?.focus();
    };
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!cancelled) focusFirst();
      });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      const node = sheetRef.current;
      if (!node) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current("escape");
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableIn(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onPopState = () => onCloseRef.current("back");
    history.pushState({ overlay: overlayId }, "");
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("popstate", onPopState);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPopState);
      inertTargets.forEach((el) => { el.inert = false; });
      const state = history.state as { overlay?: string } | null;
      if (state?.overlay === overlayId) history.back();
      restoreFocus.current?.focus();
    };
  }, [open, overlayId, host]);

  const onHeaderPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    // Never start a drag from a control in the header: capturing the pointer
    // retargets pointerup, which would swallow the control's click.
    if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
    dragStart.current = event.clientY;
  };

  const onHeaderPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStart.current == null) return;
    const distance = Math.max(0, event.clientY - dragStart.current);
    // Claim the pointer only once this is unambiguously a drag, so a tap keeps
    // its click target.
    if (!dragging.current && distance > DRAG_THRESHOLD) {
      dragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (dragging.current) setDragY(distance);
  };

  const onHeaderPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragStart.current == null) return;
    const distance = dragY;
    const wasDragging = dragging.current;
    dragStart.current = null;
    dragging.current = false;
    setDragY(0);
    if (wasDragging && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (wasDragging && distance > 80) onClose("swipe");
  };

  if (!open || !host) return null;

  return createPortal(
    <div className="overlay-sheet-root" data-overlay-id={overlayId}>
      <button type="button" className="overlay-sheet-backdrop" aria-label={closeLabel} onClick={() => onClose("backdrop")} />
      <section
        ref={sheetRef}
        className={["overlay-sheet", className].filter(Boolean).join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <header
          className="overlay-sheet-header"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onPointerCancel={onHeaderPointerUp}
        >
          {showHandle ? <div className="overlay-sheet-handle" aria-hidden /> : null}
          <div className="overlay-sheet-title-row">
            <div className="overlay-sheet-heading">
              <h2 id={titleId} className={titleClassName}>{title}</h2>
              {subtitle ? <p className="overlay-sheet-subtitle">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className={closeAppearance === "plain" ? "icon-close is-plain" : "icon-close"}
              onClick={() => onClose("close")}
              aria-label={closeLabel}
            >
              <X size={closeAppearance === "plain" ? 20 : 22} />
            </button>
          </div>
        </header>
        <div className="overlay-sheet-body">{children}</div>
        {footer ? <div className={["overlay-sheet-footer", footerClassName].filter(Boolean).join(" ")}>{footer}</div> : null}
      </section>
    </div>,
    host,
  );
}
