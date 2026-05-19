export interface GeoPoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface City extends GeoPoint {
  id: string;
  country: string;
  population?: number;
}

export enum TransportType {
  FLIGHT = "FLIGHT",
  SHIP = "SHIP",
}

export interface Entity {
  id: string;
  type: TransportType;
  name: string;
  from: City;
  to: City;
  currentLat: number;
  currentLng: number;
  speed: number;
  altitude?: number; // meters
  status: "en-route" | "delayed" | "arrived";
  progress: number; // 0 to 1
  path: [number, number][]; // Array of [lat, lng]
}

export interface Route {
  from: City;
  to: City;
  distance: number; // km
  duration: number; // minutes
  type: TransportType;
}
