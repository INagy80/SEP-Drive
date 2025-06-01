package com.example.SEPDrive.controller;

public class SimulationStatePayload {
    private double travelFrac;
    private double realDuration;
    private String pathJson;
    private String stopsJson;

    public SimulationStatePayload() { }

    public SimulationStatePayload(double travelFrac, double realDuration, String pathJson, String stopsJson) {
        this.travelFrac = travelFrac;
        this.realDuration = realDuration;
        this.pathJson = pathJson;
        this.stopsJson = stopsJson;
    }

    public double getTravelFrac() { return travelFrac; }
    public void setTravelFrac(double travelFrac) { this.travelFrac = travelFrac; }

    public double getRealDuration() { return realDuration; }
    public void setRealDuration(double realDuration) { this.realDuration = realDuration; }

    public String getPathJson() { return pathJson; }
    public void setPathJson(String pathJson) { this.pathJson = pathJson; }

    public String getStopsJson() { return stopsJson; }
    public void setStopsJson(String stopsJson) { this.stopsJson = stopsJson; }
}

