"use client";

import { TileLayer } from "react-leaflet";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "";
const CARTO_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ESRI_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

export function CartoBasemap() {
  if (CARTO_KEY) {
    return (
      <TileLayer
        url={`${CARTO_URL}?key=${encodeURIComponent(CARTO_KEY)}`}
        subdomains="abcd"
        maxZoom={20}
        attribution="© OpenStreetMap contributors © CARTO"
      />
    );
  }

  return (
    <TileLayer
      url={ESRI_URL}
      maxZoom={19}
      attribution="Tiles © Esri"
    />
  );
}
