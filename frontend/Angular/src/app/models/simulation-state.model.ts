import { LatLng } from "leaflet";
import type * as Leaflet from 'leaflet';

export interface SimulationUpdate{
  rideId: number;
  path:         Leaflet.LatLng[];
  segLengths:   number[];
  totalLength:  number;
  realDuration: number;     // seconds, as returned by OSRM
  travelFrac:   number;     // from 0→1
  lastTimeMs:   number; // timestamp of the last frame
  stops: Leaflet.LatLng[];
  paused: boolean;
  simulationSpeedFactor: number
}
