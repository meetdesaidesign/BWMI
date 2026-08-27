"use client";

import L from "leaflet";
import { Marker, MapContainer, TileLayer, useMap } from "react-leaflet";
import { tokens } from "@/design-system/generated/tokens";
import type { Issue, Locale } from "@/lib/types";
import { WARD_CENTER } from "@/lib/seed";
import { useEffect, useRef } from "react";

const px = (value: string) => Number.parseInt(value, 10);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function markerIcon(issue: Issue, selected: boolean, locale: Locale) {
  const title = locale === "hi" ? issue.titleHi : issue.titleEn;
  const size = selected ? px(tokens.markerSizeSelected) : px(tokens.markerSize);
  const width = Math.max(size + px(tokens.space4), px(tokens.markerLabelWidth));
  const height = size + px(tokens.space2) + px(tokens.typeCaptionLineHeight) * 2;
  return L.divIcon({
    className: "map-marker-root",
    iconSize: [width, height],
    iconAnchor: [width / 2, size],
    html: `<div class="map-pin${selected ? " is-selected" : ""} ${issue.status}">
      <span class="map-pin-media">
        <img src="${escapeHtml(issue.image)}" alt="" draggable="false" />
        <span class="map-pin-count">${issue.supporters}</span>
      </span>
      <span class="map-pin-label">${escapeHtml(title)}</span>
    </div>`,
  });
}

function Recenter({ issue, nonce }: { issue?: Issue; nonce: number }) {
  const map = useMap();
  const skipSelect = useRef(true);

  useEffect(() => {
    if (skipSelect.current) {
      skipSelect.current = false;
      return;
    }
    if (issue) {
      const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const zoom = Math.max(map.getZoom(), 16);
      const point = map.project([issue.lat, issue.lng], zoom);
      point.y += px(tokens.carouselHeight) * 0.55;
      map.flyTo(map.unproject(point, zoom), zoom, { duration: reduce ? 0 : 0.45 });
    }
  }, [issue, map]);

  useEffect(() => {
    if (nonce === 0) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.flyTo(WARD_CENTER, 15, { duration: reduce ? 0 : 0.45 });
  }, [nonce, map]);

  return null;
}

export function WardMap({
  issues,
  selected,
  onSelect,
  recenterNonce = 0,
  locale = "en",
}: {
  issues: Issue[];
  selected?: Issue;
  onSelect: (issue: Issue) => void;
  recenterNonce?: number;
  locale?: Locale;
}) {
  return (
    <MapContainer center={WARD_CENTER} zoom={15} zoomControl={false} attributionControl={false} className="ward-map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {issues.map((issue) => (
        <Marker
          key={`${issue.id}-${selected?.id === issue.id ? "on" : "off"}-${locale}`}
          position={[issue.lat, issue.lng]}
          icon={markerIcon(issue, selected?.id === issue.id, locale)}
          zIndexOffset={selected?.id === issue.id ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(issue) }}
        />
      ))}
      <Recenter issue={selected} nonce={recenterNonce} />
    </MapContainer>
  );
}
