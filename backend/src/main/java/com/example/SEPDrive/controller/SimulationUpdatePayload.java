package com.example.SEPDrive.controller;

import java.util.List;

public class SimulationUpdatePayload {

    private Integer rideId;
    private List<LatLng> path;
    private List<Double> segLengths;
    private double totalLength;
    private double realDuration;
    private double travelFrac;
    private long lastTimeMs;
    private List<LatLng> stops;

    private boolean paused;
    private double simulationSpeedFactor;



    public Integer getRideId() {
        return rideId;
    }

    public void setRideId(Integer rideId) {
        this.rideId = rideId;
    }

    public boolean ispaused() {
        return paused;
    }

    public void setPaused(boolean paused) {
        this.paused = paused;
    }

    public List<LatLng> getPath() {
        return path;
    }

    public void setPath(List<LatLng> path) {
        this.path = path;
    }

    public List<Double> getSegLengths() {
        return segLengths;
    }

    public void setSegLengths(List<Double> segLengths) {
        this.segLengths = segLengths;
    }

    public double getTotalLength() {
        return totalLength;
    }

    public void setTotalLength(double totalLength) {
        this.totalLength = totalLength;
    }

    public double getRealDuration() {
        return realDuration;
    }

    public void setRealDuration(double realDuration) {
        this.realDuration = realDuration;
    }

    public double getTravelFrac() {
        return travelFrac;
    }

    public void setTravelFrac(double travelFrac) {
        this.travelFrac = travelFrac;
    }

    public long getLastTimeMs() {
        return lastTimeMs;
    }

    public void setLastTimeMs(long lastTimeMs) {
        this.lastTimeMs = lastTimeMs;
    }

    public List<LatLng> getStops() {
        return stops;
    }

    public void setStops(List<LatLng> stops) {
        this.stops = stops;
    }

    public double getSimulationSpeedFactor() {
        return simulationSpeedFactor;
    }

    public void setSimulationSpeedFactor(double simulationSpeedFactor) {
        this.simulationSpeedFactor = simulationSpeedFactor;
    }
}
