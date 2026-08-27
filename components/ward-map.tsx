"use client";

import L from "leaflet";
import { createPortal } from "react-dom";
import { Circle, Marker, MapContainer, useMap, useMapEvents } from "react-leaflet";
import { CartoBasemap } from "./carto-basemap";
import { tokens } from "@/design-system/generated/tokens";
import { WARD_CENTER, type MapViewport } from "@/lib/geo";
import type { Issue, Locale } from "@/lib/types";
import { categoryMarkerSvg } from "./category-icon";
import { useEffect, useMemo, useRef, useState } from "react";

const px = (value: string) => Number.parseInt(value, 10);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markerIcon(issue: Issue, selected: boolean, label: string) {
  const media = selected ? px(tokens.markerSizeSelected) : px(tokens.markerSize);
  const stroke = selected ? px(tokens.markerBorderSelected) : px(tokens.markerBorder);
  const visual = media + stroke * 2;
  const hit = Math.max(visual, px(tokens.touchMin));
  const inner = issue.image
    ? `<img src="${escapeHtml(issue.image)}" alt="">`
    : categoryMarkerSvg(issue.category, tokens.iconSecondary);
  return L.divIcon({
    className: "map-marker-root",
    iconSize: [hit, hit],
    iconAnchor: [hit / 2, hit / 2],
    html: `<span class="civic-marker${selected ? " is-selected" : ""}" role="img" aria-label="${escapeHtml(label)}" style="width:${media}px;height:${media}px">${inner}</span>`,
  });
}

function HereMarker({
  position,
  cta,
  aria,
  onReport,
}: {
  position: [number, number];
  cta: string;
  aria: string;
  onReport: () => void;
}) {
  const map = useMap();
  const rootRef = useRef<HTMLButtonElement>(null);
  const [xy, setXy] = useState({ x: 0, y: 0, ready: false });

  useEffect(() => {
    const container = map.getContainer();
    const host = container.parentElement ?? container;
    const sync = () => {
      const point = map.latLngToContainerPoint(position);
      const crect = container.getBoundingClientRect();
      const hrect = host.getBoundingClientRect();
      setXy({
        x: point.x + crect.left - hrect.left,
        y: point.y + crect.top - hrect.top,
        ready: true,
      });
    };
    sync();
    map.on("move zoom viewreset zoomanim", sync);
    return () => {
      map.off("move zoom viewreset zoomanim", sync);
    };
  }, [map, position]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
  }, [xy.ready]);

  if (!xy.ready) return null;

  const host = map.getContainer().parentElement ?? map.getContainer();

  return createPortal(
    <div className="here-anchor" style={{ left: xy.x, top: xy.y }}>
      <button
        ref={rootRef}
        type="button"
        className="here-marker"
        aria-label={aria}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onReport();
        }}
      >
        <span className="here-pin">
          <span className="here-pulse" aria-hidden="true" />
          <span className="here-pulse is-delay" aria-hidden="true" />
          <svg className="here-pin-frame" viewBox="0 0 44 44" aria-hidden="true">
            <rect x="2" y="2" width="40" height="40" rx="12" fill="none" stroke="currentColor" strokeWidth="2.25" strokeDasharray="5 4" strokeLinecap="round" />
          </svg>
          <svg className="here-plus" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="here-cta">{cta}</span>
      </button>
    </div>,
    host,
  );
}

function clusterIcon(count: number, label: string) {
  const size = Math.min(px(tokens.markerClusterMax), px(tokens.markerClusterMin) + Math.round(Math.log2(count) * 4));
  return L.divIcon({
    className: "map-marker-root",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="civic-cluster" role="img" aria-label="${escapeHtml(label)}" style="width:${size}px;height:${size}px">${count}</span>`,
  });
}

function viewportOf(map: L.Map): MapViewport {
  const bounds = map.getBounds();
  const center = map.getCenter();
  return {
    bounds: { north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() },
    center: [center.lat, center.lng],
  };
}

function clusterIssues(issues: Issue[], map: L.Map, selectedId?: string | null) {
  const rest = issues.filter((issue) => issue.id !== selectedId);
  const groups: { x: number; y: number; lat: number; lng: number; issues: Issue[] }[] = [];
  const threshold = 56;
  for (const issue of rest) {
    const point = map.latLngToLayerPoint([issue.lat, issue.lng]);
    const hit = groups.find((group) => Math.hypot(group.x - point.x, group.y - point.y) < threshold);
    if (hit) {
      hit.issues.push(issue);
      const n = hit.issues.length;
      hit.lat = hit.issues.reduce((sum, item) => sum + item.lat, 0) / n;
      hit.lng = hit.issues.reduce((sum, item) => sum + item.lng, 0) / n;
      const center = map.latLngToLayerPoint([hit.lat, hit.lng]);
      hit.x = center.x;
      hit.y = center.y;
    } else {
      groups.push({ x: point.x, y: point.y, lat: issue.lat, lng: issue.lng, issues: [issue] });
    }
  }
  const selected = issues.find((issue) => issue.id === selectedId) ?? null;
  return {
    singles: [
      ...groups.filter((group) => group.issues.length === 1).map((group) => group.issues[0]),
      ...(selected ? [selected] : []),
    ],
    clusters: groups.filter((group) => group.issues.length > 1),
  };
}

function MapLayers({
  issues,
  selected,
  locale,
  sheetPeek,
  recenterNonce,
  here,
  reportLabel,
  reportAria,
  getMarkerLabel,
  getClusterLabel,
  onSelect,
  onDeselect,
  onViewportChange,
  onReport,
}: {
  issues: Issue[];
  selected?: Issue;
  locale: Locale;
  sheetPeek: number;
  recenterNonce: number;
  here: [number, number];
  reportLabel: string;
  reportAria: string;
  getMarkerLabel: (issue: Issue) => string;
  getClusterLabel: (count: number) => string;
  onSelect: (issue: Issue) => void;
  onDeselect: () => void;
  onViewportChange: (viewport: MapViewport) => void;
  onReport: () => void;
}) {
  const map = useMap();
  const hereRef = useRef(here);
  const skipMove = useRef(false);
  const [zoom, setZoom] = useState(map.getZoom());
  const skipSelect = useRef(true);
  hereRef.current = here;

  useMapEvents({
    zoomend() {
      setZoom(map.getZoom());
    },
    click() {
      onDeselect();
    },
    moveend() {
      if (skipMove.current) skipMove.current = false;
      onViewportChange(viewportOf(map));
    },
  });

  useEffect(() => {
    onViewportChange(viewportOf(map));
  }, [map, onViewportChange]);

  useEffect(() => {
    if (skipSelect.current) {
      skipSelect.current = false;
      return;
    }
    if (!selected) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nextZoom = Math.max(map.getZoom(), 16);
    const point = map.project([selected.lat, selected.lng], nextZoom);
    point.y += Math.min(sheetPeek, 220) * 0.45;
    skipMove.current = true;
    map.flyTo(map.unproject(point, nextZoom), nextZoom, { duration: reduce ? 0 : 0.35 });
    // Recenter on selection id only; sheet peek is sampled at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, map]);

  useEffect(() => {
    if (recenterNonce === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = hereRef.current;
    skipMove.current = true;
    map.flyTo(target, 16, { duration: reduce ? 0 : 0.35 });
  }, [recenterNonce, map]);

  const grouped = useMemo(
    () => clusterIssues(issues, map, selected?.id),
    // zoom changes marker projection even though the map instance is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [issues, map, selected?.id, zoom],
  );

  return (
    <>
      <Circle
        center={here}
        radius={28}
        pathOptions={{ color: tokens.actionPrimary, weight: 0, fillColor: tokens.actionPrimary, fillOpacity: 0.1 }}
        interactive={false}
      />
      <HereMarker position={here} cta={reportLabel} aria={reportAria} onReport={onReport} />
      {grouped.singles.map((issue) => (
        <Marker
          key={`${issue.id}-${selected?.id === issue.id ? "on" : "off"}-${locale}`}
          position={[issue.lat, issue.lng]}
          icon={markerIcon(issue, selected?.id === issue.id, getMarkerLabel(issue))}
          zIndexOffset={selected?.id === issue.id ? 1000 : 0}
          eventHandlers={{ click: (event) => { L.DomEvent.stopPropagation(event.originalEvent); onSelect(issue); } }}
        />
      ))}
      {grouped.clusters.map((group) => (
        <Marker
          key={`cluster-${group.issues.map((issue) => issue.id).join("-")}-${zoom}`}
          position={[group.lat, group.lng]}
          icon={clusterIcon(group.issues.length, getClusterLabel(group.issues.length))}
          zIndexOffset={400}
          eventHandlers={{
            click: (event) => {
              L.DomEvent.stopPropagation(event.originalEvent);
              const bounds = L.latLngBounds(group.issues.map((issue) => [issue.lat, issue.lng]));
              const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              skipMove.current = true;
              map.fitBounds(bounds.pad(0.35), { animate: !reduce, maxZoom: 18 });
            },
          }}
        />
      ))}
    </>
  );
}

export function WardMap({
  issues,
  selected,
  onSelect,
  onDeselect,
  onViewportChange,
  onReport,
  here = WARD_CENTER,
  recenterNonce = 0,
  locale = "en",
  sheetPeek = 84,
  reportLabel,
  reportAria,
  getMarkerLabel,
  getClusterLabel,
}: {
  issues: Issue[];
  selected?: Issue;
  onSelect: (issue: Issue) => void;
  onDeselect: () => void;
  onViewportChange: (viewport: MapViewport) => void;
  onReport: () => void;
  here?: [number, number];
  recenterNonce?: number;
  locale?: Locale;
  sheetPeek?: number;
  reportLabel: string;
  reportAria: string;
  getMarkerLabel: (issue: Issue) => string;
  getClusterLabel: (count: number) => string;
}) {
  return (
    <MapContainer center={WARD_CENTER} zoom={15} maxZoom={20} zoomControl={false} attributionControl={false} className="ward-map">
      <CartoBasemap />
      <MapLayers
        issues={issues}
        selected={selected}
        locale={locale}
        sheetPeek={sheetPeek}
        recenterNonce={recenterNonce}
        here={here}
        reportLabel={reportLabel}
        reportAria={reportAria}
        getMarkerLabel={getMarkerLabel}
        getClusterLabel={getClusterLabel}
        onSelect={onSelect}
        onDeselect={onDeselect}
        onViewportChange={onViewportChange}
        onReport={onReport}
      />
    </MapContainer>
  );
}
