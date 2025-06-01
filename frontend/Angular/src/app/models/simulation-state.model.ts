export interface SimulationStatePayload {
  travelFrac:   number;
  realDuration: number;
  pathJson:     string;
  stopsJson:    string;
}
export interface SimulationStateToClient {
  rideId:       number;
  travelFrac:   number;
  realDuration: number;
  pathJson:     string;
  stopsJson:    string;
  lastUpdated:  string;
}
