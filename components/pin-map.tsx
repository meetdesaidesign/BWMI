"use client";

import { MapContainer, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { CartoBasemap } from "./carto-basemap";
import { WARD_CENTER } from "@/lib/geo";

function CenterWatcher({ onMove }: { onMove: (center: [number, number]) => void }) {
  useMapEvents({
    moveend: (event) => {
      const { lat, lng } = event.target.getCenter();
      onMove([lat, lng]);
    },
  });
  return null;
}

/**
 * Minimal picker: the pin is fixed at the centre of the viewport and the user
 * moves the map underneath it. Keeps the interaction to one gesture and avoids
 * a draggable marker fighting the map pan.
 */
export function PinMap({
  center = WARD_CENTER,
  onChange,
  label,
}: {
  center?: [number, number];
  onChange: (center: [number, number]) => void;
  label: string;
}) {
  const [start] = useState(center);

  return (
    <div className="pin-map-frame">
      <MapContainer center={start} zoom={17} maxZoom={20} zoomControl={false} attributionControl={false} className="pin-map">
        <CartoBasemap />
        <CenterWatcher onMove={onChange} />
      </MapContainer>
      <span className="pin-map-pin" role="img" aria-label={label} />
    </div>
  );
}
