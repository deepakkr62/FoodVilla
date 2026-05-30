/**
 * The 10 cities we have seeded restaurants in. Used to resolve the user's
 * browser-detected lat/lng into the closest city we actually serve.
 */
export interface SupportedCity {
  name: string;
  lat: number;
  lng: number;
}

export const SUPPORTED_CITIES: SupportedCity[] = [
  { name: "Pune",       lat: 18.5204, lng: 73.8567 },
  { name: "Mumbai",     lat: 19.0760, lng: 72.8777 },
  { name: "Bengaluru",  lat: 12.9716, lng: 77.5946 },
  { name: "Delhi",      lat: 28.7041, lng: 77.1025 },
  { name: "Chennai",    lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad",  lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata",    lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad",  lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur",     lat: 26.9124, lng: 75.7873 },
  { name: "Goa",        lat: 15.4989, lng: 73.8278 },
];

/** Haversine great-circle distance in kilometres between two lat/lng points. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Pick whichever supported city is closest to the user's actual location. */
export function nearestCity(coords: { lat: number; lng: number }): {
  city: SupportedCity;
  distanceKm: number;
} {
  let best: SupportedCity = SUPPORTED_CITIES[0];
  let bestDist = Infinity;
  for (const c of SUPPORTED_CITIES) {
    const d = distanceKm(coords, c);
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return { city: best, distanceKm: bestDist };
}
