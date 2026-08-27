"use client";

import dynamic from "next/dynamic";

export const PinLoader = dynamic(() => import("./pin-map").then((m) => m.PinMap), {
  ssr: false,
  loading: () => <div className="map-loading" aria-hidden><span className="spinner" /><span className="map-skeleton" /></div>,
});
