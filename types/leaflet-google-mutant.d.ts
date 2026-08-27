import "leaflet";

declare module "leaflet" {
  interface GoogleMutantOptions extends GridLayerOptions {
    type?: "roadmap" | "satellite" | "terrain" | "hybrid";
    styles?: google.maps.MapTypeStyle[];
    mapId?: string;
    maxNativeZoom?: number;
  }

  namespace gridLayer {
    function googleMutant(options?: GoogleMutantOptions): GridLayer;
  }
}
