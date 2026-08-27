import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MAP_LAND } from "./map-style";

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

let mapsReady: Promise<void> | null = null;

export function loadGoogleMaps(key: string) {
  if (!mapsReady) {
    setOptions({
      key,
      v: "weekly",
      language: "en",
      region: "IN",
    });
    mapsReady = importLibrary("maps").then(() => {
      useRasterRenderer();
    });
  }
  return mapsReady;
}

function useRasterRenderer() {
  const maps = google.maps;
  const original = maps.Map;
  if (!maps.RenderingType || "__fixoRaster" in original) return;

  const RasterMap = function (this: google.maps.Map, element: HTMLElement, options?: google.maps.MapOptions) {
    return new original(element, {
      ...options,
      renderingType: maps.RenderingType.RASTER,
      clickableIcons: false,
      backgroundColor: MAP_LAND,
    });
  } as unknown as typeof google.maps.Map & { __fixoRaster: boolean };

  RasterMap.prototype = original.prototype;
  Object.setPrototypeOf(RasterMap, original);
  RasterMap.__fixoRaster = true;
  maps.Map = RasterMap;
}
