package com.example.SEPDrive.controller;

import java.util.List;

/** DTO for initializeSimulation */
class RouteInitRequest {
    private List<LatLng> path;
    private List<LatLng> stops;
    private double totalTimeSec;

    public RouteInitRequest() { }

    public List<LatLng> getPath() { return path; }
    public void setPath(List<LatLng> path) { this.path = path; }

    public List<LatLng> getStops() { return stops; }
    public void setStops(List<LatLng> stops) { this.stops = stops; }

    public double getTotalTimeSec() { return totalTimeSec; }
    public void setTotalTimeSec(double totalTimeSec) { this.totalTimeSec = totalTimeSec; }
}
