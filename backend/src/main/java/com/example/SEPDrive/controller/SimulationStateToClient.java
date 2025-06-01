package com.example.SEPDrive.controller;

public class SimulationStateToClient {
    private Long rideId;
    private double travelFrac;
    private double realDuration;
    private String pathJson;
    private String stopsJson;
    private String lastUpdated;

    public SimulationStateToClient() { }

    public SimulationStateToClient(Long rideId, double travelFrac, double realDuration,
                                   String pathJson, String stopsJson, String lastUpdated) {
        this.rideId = rideId;
        this.travelFrac = travelFrac;
        this.realDuration = realDuration;
        this.pathJson = pathJson;
        this.stopsJson = stopsJson;
        this.lastUpdated = lastUpdated;
    }

    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }

    public double getTravelFrac() { return travelFrac; }
    public void setTravelFrac(double travelFrac) { this.travelFrac = travelFrac; }

    public double getRealDuration() { return realDuration; }
    public void setRealDuration(double realDuration) { this.realDuration = realDuration; }

    public String getPathJson() { return pathJson; }
    public void setPathJson(String pathJson) { this.pathJson = pathJson; }

    public String getStopsJson() { return stopsJson; }
    public void setStopsJson(String stopsJson) { this.stopsJson = stopsJson; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}

