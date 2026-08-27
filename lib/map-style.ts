/** Soft-pastel Google basemap. Stays quieter than Fixo markers and the ward outline. */
export const MAP_LAND = "#F4F5F7";
export const MAP_MANMADE = "#F2F3F6";
export const MAP_PARK = "#D7E5D6";
export const MAP_WATER = "#D3E4F0";
export const MAP_ROAD = "#FFFFFF";
export const MAP_ROAD_EDGE = "#E6E8EE";
export const MAP_HIGHWAY_EDGE = "#E2E5EC";
export const MAP_LABEL = "#8B95A8";
export const MAP_LABEL_SOFT = "#A3ABB8";
export const MAP_WATER_LABEL = "#9BB3C4";

export const FIXO_GOOGLE_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: MAP_LAND }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: MAP_LABEL_SOFT }] },
  { elementType: "labels.text.stroke", stylers: [{ color: MAP_LAND }, { weight: 3 }] },

  { featureType: "administrative", elementType: "geometry", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.province", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_LAND }, { weight: 4 }],
  },

  { featureType: "landscape", elementType: "geometry", stylers: [{ color: MAP_LAND }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: MAP_MANMADE }] },
  { featureType: "landscape.man_made", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: MAP_LAND }] },

  { featureType: "poi", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ visibility: "on" }, { color: MAP_PARK }],
  },
  { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.government", elementType: "geometry", stylers: [{ visibility: "on" }, { color: MAP_MANMADE }] },
  {
    featureType: "poi.government",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL }],
  },
  {
    featureType: "poi.government",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_LAND }, { weight: 3 }],
  },
  { featureType: "poi.medical", elementType: "geometry", stylers: [{ visibility: "on" }, { color: MAP_MANMADE }] },
  {
    featureType: "poi.medical",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL }],
  },
  {
    featureType: "poi.medical",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_LAND }, { weight: 3 }],
  },
  { featureType: "poi.school", elementType: "geometry", stylers: [{ visibility: "on" }, { color: MAP_MANMADE }] },
  {
    featureType: "poi.school",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL }],
  },
  {
    featureType: "poi.school",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_LAND }, { weight: 3 }],
  },

  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: MAP_ROAD }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: MAP_ROAD_EDGE }, { weight: 0.4 }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: MAP_ROAD }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: MAP_HIGHWAY_EDGE }, { weight: 0.7 }] },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_ROAD }, { weight: 3 }],
  },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: MAP_ROAD }] },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ visibility: "on" }, { color: MAP_LABEL_SOFT }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: MAP_ROAD }, { weight: 3 }],
  },
  { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: MAP_ROAD }] },
  { featureType: "road.local", elementType: "labels", stylers: [{ visibility: "off" }] },

  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "transit.station", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: MAP_WATER }] },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: MAP_WATER_LABEL }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: MAP_WATER }, { weight: 3 }],
  },
];
