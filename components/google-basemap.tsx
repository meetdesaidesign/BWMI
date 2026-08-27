"use client";

import L from "leaflet";
import { useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";
import { GOOGLE_MAPS_API_KEY, loadGoogleMaps } from "@/lib/google-maps";
import { FIXO_GOOGLE_MAP_STYLE } from "@/lib/map-style";

function GoogleMutantLayer() {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;
    let layer: L.GridLayer | null = null;

    async function add() {
      await loadGoogleMaps(GOOGLE_MAPS_API_KEY);
      if (cancelled) return;
      const globalLeaflet = globalThis as typeof globalThis & { L?: typeof L };
      globalLeaflet.L = L;
      // Leaflet 1 build; the package's ESM entry targets Leaflet 2.
      // @ts-expect-error -- dist build ships without types
      await import("leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant.js");
      if (cancelled) return;
      layer = L.gridLayer.googleMutant({
        type: "roadmap",
        styles: FIXO_GOOGLE_MAP_STYLE,
        maxZoom: 21,
        maxNativeZoom: 21,
      });
      layer.addTo(map);
      layer.bringToBack();
    }

    add().catch((error: unknown) => {
      if (!cancelled) console.warn("Fixo: Google basemap failed to load.", error);
    });

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

let missingKeyWarned = false;

export function GoogleBasemap() {
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY && !missingKeyWarned && process.env.NODE_ENV !== "production") {
      missingKeyWarned = true;
      console.warn("Fixo: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to load the Google basemap.");
    }
  }, []);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
        maxZoom={19}
      />
    );
  }

  return <GoogleMutantLayer />;
}
