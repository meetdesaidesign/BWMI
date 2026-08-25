"use client";

import dynamic from "next/dynamic";

export const MapLoader = dynamic(() => import("./ward-map").then((m) => m.WardMap), {
  ssr: false,
  loading: () => <div className="map-loading"><span className="spinner" />Loading local map…</div>,
});
