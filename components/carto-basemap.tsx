"use client";

import { TileLayer } from "react-leaflet";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "";
const VOYAGER_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

export function CartoBasemap() {
  const url = CARTO_KEY
    ? `${VOYAGER_URL}?key=${encodeURIComponent(CARTO_KEY)}`
    : VOYAGER_URL;

  return (
    <TileLayer
      url={url}
      subdomains="abcd"
      maxZoom={20}
      attribution="© OpenStreetMap contributors © CARTO"
    />
  );
}
