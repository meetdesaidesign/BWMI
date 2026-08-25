"use client";

import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { Issue } from "@/lib/types";
import { useEffect } from "react";

function Recenter({ issue }: { issue?: Issue }) {
  const map = useMap();
  useEffect(() => {
    if (issue) map.flyTo([issue.lat, issue.lng], 16, { duration: 0.5 });
  }, [issue, map]);
  return null;
}

export function WardMap({ issues, selected, onSelect }: { issues: Issue[]; selected?: Issue; onSelect: (issue: Issue) => void }) {
  return (
    <MapContainer center={[28.7041, 77.1025]} zoom={15} zoomControl={false} attributionControl={false} className="ward-map">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {issues.map((issue) => (
        <CircleMarker
          key={issue.id}
          center={[issue.lat, issue.lng]}
          radius={Math.min(22, 8 + Math.sqrt(issue.supporters) * 2)}
          pathOptions={{
            color: selected?.id === issue.id ? "#fff8eb" : "#272621",
            fillColor: issue.status === "confirmed" ? "#26735b" : issue.status === "contested" ? "#e6532f" : "#272621",
            fillOpacity: 1,
            weight: selected?.id === issue.id ? 4 : 2,
          }}
          eventHandlers={{ click: () => onSelect(issue) }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={1}>{issue.supporters}</Tooltip>
        </CircleMarker>
      ))}
      <Recenter issue={selected} />
    </MapContainer>
  );
}
