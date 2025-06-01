package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    private final SimulationService simulationService;

    @Autowired
    public SimulationController(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * Called once from Angular as soon as LRM has the full route.
     * Expects JSON:
     * {
     *   "path": [ { "lat": 51.1, "lng": 6.8 }, … ],
     *   "stops": [ { "lat": 51.2, "lng": 6.85 }, … ],
     *   "totalTimeSec": 1234
     * }
     */
    @PostMapping("/{rideId}/initialize")
    public ResponseEntity<Void> initializeSimulation(
            @PathVariable Integer rideId,
            @RequestBody RouteInitRequest body
    ) {
        simulationService.initializeRideRoute(
                rideId,
                body.getPath(),
                body.getStops(),
                body.getTotalTimeSec()
        );
        return ResponseEntity.ok().build();
    }

    /** Called when the driver or customer clicks “Start/Resume” */
    @PostMapping("/{rideId}/start")
    public ResponseEntity<Void> startRide(@PathVariable Integer rideId) {
        simulationService.resumeRide(rideId);
        return ResponseEntity.ok().build();
    }

    /** Called when either user clicks “Pause” (manual or triggered by arriving at a stop) */
    @PostMapping("/{rideId}/pause")
    public ResponseEntity<Void> pauseRide(@PathVariable Integer rideId) {
        simulationService.pauseRide(rideId);
        return ResponseEntity.ok().build();
    }

    /**
     * Called when either user changes speed (e.g. “×2” or “×0.5”).
     * Example: POST /api/simulation/42/speed?factor=2.0
     */
    @PostMapping("/{rideId}/speed")
    public ResponseEntity<Void> changeSpeed(
            @PathVariable Integer rideId,
            @RequestParam double factor
    ) {
        simulationService.changeSpeed(rideId, factor);
        return ResponseEntity.ok().build();
    }
}


