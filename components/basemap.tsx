"use client";

import { useEffect } from "react";
import L from "leaflet";
import { TileLayer, useMap } from "react-leaflet";
import { tokens } from "@/design-system/generated/tokens";
import { GOOGLE_MAPS_API_KEY, loadGoogleMaps } from "@/lib/google-maps";
import { FIXO_GOOGLE_MAP_STYLE } from "@/lib/map-style";

const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY ?? "";

/**
 * The basemap is deliberately quiet: warm off-white land, white roads and grey
 * labels, so the only saturated colour on screen belongs to the issue markers.
 *
 * Land and labels are separate tile layers on purpose — that is what lets us
 * warm the land without staining the type, and fade street names down without
 * fading the roads with them. Labels ride in `overlayPane` (z 400), so they sit
 * over the land and always under the markers in `markerPane` (z 600).
 */
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const ESRI_LAND = `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`;
const ESRI_LABELS = `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`;

const CARTO = "https://basemaps.cartocdn.com";
const CARTO_LAND = `${CARTO}/light_nolabels/{z}/{x}/{y}{r}.png`;
const CARTO_LABELS = `${CARTO}/light_only_labels/{z}/{x}/{y}{r}.png`;

/**
 * Esri's Light Gray canvas stops carrying Indian detail past z16 — beyond that
 * the service returns a "map data not yet available" placeholder. Capping the
 * native zoom makes Leaflet upscale the last real tile instead, which on flat
 * canvas artwork stays legible where the placeholder would have blanked the map.
 */
const ESRI_MAX_NATIVE = 16;

/** Street names only earn their space once you are close enough to walk it… */
const LABEL_MIN_ZOOM = Number(tokens.mapLabelMinZoom);
/** …and are dropped again once upscaling would blow them up to headlines. */
const LABEL_MAX_ZOOM = Number(tokens.mapLabelMaxZoom);
const LABEL_OPACITY = Number(tokens.mapLabelOpacity);

/**
 * Google localizes geopolitical boundaries from the loader's `region: "IN"`
 * setting. Using the raster road map through Leaflet also avoids Esri's
 * high-zoom "map data not available" tile, whose dotted placeholder resembles
 * an inaccurate national boundary.
 */
function IndiaLocalizedBasemap() {
  const map = useMap();

  useEffect(() => {
    let disposed = false;
    let layer: L.GridLayer | undefined;

    void loadGoogleMaps(GOOGLE_MAPS_API_KEY).then(async () => {
      await import("leaflet.gridlayer.googlemutant");
      if (disposed) return;

      layer = L.gridLayer.googleMutant({
        type: "roadmap",
        styles: FIXO_GOOGLE_MAP_STYLE,
        maxZoom: 20,
      });
      layer.addTo(map);
    });

    return () => {
      disposed = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

export function Basemap() {
  // Prefer Google's India-localized cartography whenever its browser key is
  // configured. The loader sets region=IN before this layer is constructed.
  if (GOOGLE_MAPS_API_KEY) return <IndiaLocalizedBasemap />;

  // CARTO's unkeyed tiles carry an "API KEY REQUIRED" watermark, so Esri is the
  // default; CARTO Positron — sharper, and English-only labels — is used when a
  // key is configured.
  if (CARTO_KEY) {
    const key = `?key=${encodeURIComponent(CARTO_KEY)}`;
    return (
      <>
        <TileLayer
          url={`${CARTO_LAND}${key}`}
          subdomains="abcd"
          maxZoom={20}
          className="basemap-land"
          attribution="© OpenStreetMap contributors © CARTO"
        />
        <TileLayer
          url={`${CARTO_LABELS}${key}`}
          subdomains="abcd"
          maxZoom={20}
          minZoom={LABEL_MIN_ZOOM}
          opacity={LABEL_OPACITY}
          pane="overlayPane"
          className="basemap-labels"
        />
      </>
    );
  }

  return (
    <>
      <TileLayer
        url={ESRI_LAND}
        maxZoom={20}
        maxNativeZoom={ESRI_MAX_NATIVE}
        className="basemap-land"
        attribution="Tiles © Esri"
      />
      <TileLayer
        url={ESRI_LABELS}
        maxZoom={LABEL_MAX_ZOOM}
        maxNativeZoom={ESRI_MAX_NATIVE}
        minZoom={LABEL_MIN_ZOOM}
        opacity={LABEL_OPACITY}
        pane="overlayPane"
        className="basemap-labels"
      />
    </>
  );
}
