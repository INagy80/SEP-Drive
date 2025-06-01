// src/main/java/com/example/demo/model/SimulationState.java
package com.example.SEPDrive.model;

import com.example.SEPDrive.controller.LatLng;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

@Entity
@Table(name = "simulation_state")
public class SimulationState {


    @Id
    @Column(name = "ride_id")
    private Integer rideId;

    /**
     * The exact polyline that LRM/OSRM returned, point‐by‐point.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "simulation_path",
            joinColumns = @JoinColumn(name = "ride_id")
    )
    private List<LatLng> path = new ArrayList<>();

    /**
     * Distances (in meters) between path[i] → path[i+1], precomputed by the server
     * just so clients can interpolate smoothly. (Optional: can let client do it, but we include here.)
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "simulation_seg_lengths",
            joinColumns = @JoinColumn(name = "ride_id")
    )
    @Column(name = "seg_length")
    private List<Double> segLengths = new ArrayList<>();

    /** Sum of all segLengths. */
    @Column(name = "total_length", nullable = false)
    private double totalLength;

    /** The OSRM‐reported totalTime (seconds). */
    @Column(name = "real_duration", nullable = false)
    private double realDuration;

    /** How far along the ride is, normalized [0..1]. */
    @Column(name = "travel_frac", nullable = false)
    private double travelFrac;

    /** Playback multiplier (1.0× by default). */
    @Column(name = "speed_factor", nullable = false)
    private double speedFactor;

    /** Whether the simulation is currently paused. */
    @Column(name = "is_paused", nullable = false)
    private boolean isPaused;

    /** Timestamp (ms since epoch) when travelFrac was last updated. */
    @Column(name = "last_update", nullable = false)
    private long lastUpdate;

    /**
     * The ordered list of intermediate stops (Zwischenstopps).
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "simulation_stops",
            joinColumns = @JoinColumn(name = "ride_id")
    )
    private List<LatLng> stops = new ArrayList<>();

    // ─── Constructors ────────────────────────────────────────────────────

    /** JPA requires a no-arg constructor */
    public SimulationState() { }

    /**
     * Convenience constructor. We’ll call this once Angular POSTS /initialize.
     */
    public SimulationState(
            Integer rideId,
            List<LatLng> path,
            List<Double> segLengths,
            double realDuration,
            List<LatLng> stops
    ) {
        this.rideId = rideId;
        this.path = new ArrayList<>(path);
        this.segLengths = new ArrayList<>(segLengths);
        this.totalLength = segLengths.stream().mapToDouble(Double::doubleValue).sum();
        this.realDuration = realDuration;
        this.travelFrac = 0.0;
        this.speedFactor = 1.0;
        this.isPaused = true;
        this.lastUpdate = System.currentTimeMillis();
        this.stops = new ArrayList<>(stops);
    }

    // ─── Getters & Setters ──────────────────────────────────────────────────

    public Integer getRideId() { return rideId; }
    public void setRideId(Integer rideId) { this.rideId = rideId; }

    public List<LatLng> getPath() { return path; }
    public void setPath(List<LatLng> path) { this.path = path; }

    public List<Double> getSegLengths() { return segLengths; }
    public void setSegLengths(List<Double> segLengths) { this.segLengths = segLengths; }

    public double getTotalLength() { return totalLength; }
    public void setTotalLength(double totalLength) { this.totalLength = totalLength; }

    public double getRealDuration() { return realDuration; }
    public void setRealDuration(double realDuration) { this.realDuration = realDuration; }

    public double getTravelFrac() { return travelFrac; }
    public void setTravelFrac(double travelFrac) { this.travelFrac = travelFrac; }

    public double getSpeedFactor() { return speedFactor; }
    public void setSpeedFactor(double speedFactor) { this.speedFactor = speedFactor; }

    public boolean isPaused() { return isPaused; }
    public void setPaused(boolean paused) { isPaused = paused; }

    public long getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(long lastUpdate) { this.lastUpdate = lastUpdate; }

    public List<LatLng> getStops() { return stops; }
    public void setStops(List<LatLng> stops) { this.stops = stops; }
}
