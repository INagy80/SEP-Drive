package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.LatLng;
import com.example.SEPDrive.model.SimulationState;
import com.example.SEPDrive.repository.simulationDAO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.*;
import org.springframework.stereotype.Service;


import java.util.*;

@Service
@EnableScheduling  // so @Scheduled works
public class SimulationService {

    private final simulationDAO repo;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SimulationService(
            simulationDAO repo,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.repo = repo;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Called once when Angular POSTS /initialize.
     * We compute segLengths & totalLength, save everything, and broadcast INITIAL_STATE.
     */
    @Transactional
    public void initializeRideRoute(
            Integer rideId,
            List<LatLng> path,
            List<LatLng> stops,
            double totalTimeSec
    ) {
        // 1) Compute segLengths & totalLength from the EXACT path Angular sent
        List<Double> segLens = new ArrayList<>();
        double totalMeters = 0;
        for (int i = 0; i < path.size() - 1; i++) {
            double d = haversineMeters(
                    path.get(i).getLat().doubleValue(),
                    path.get(i).getLng().doubleValue(),
                    path.get(i + 1).getLat().doubleValue(),
                    path.get(i + 1).getLng().doubleValue()
            );
            segLens.add(d);
            totalMeters += d;
        }

        // 2) Persist a new SimulationStateEntity
        SimulationState entity = new SimulationState();
        entity.setRideId(rideId);
        entity.setPath(path);
        entity.setSegLengths(segLens);
        entity.setTotalLength(totalMeters);
        entity.setRealDuration(totalTimeSec);
        entity.setTravelFrac(0.0);
        entity.setSpeedFactor(1.0);
        entity.setPaused(true);
        entity.setLastUpdate(System.currentTimeMillis());
        entity.setStops(stops);

        repo.save(entity);

        // 3) Broadcast INITIAL_STATE to /topic/ride.{rideId}
        broadcastInitialState(entity);
    }

    private void broadcastInitialState(SimulationState entity) {
        Map<String,Object> payload = new HashMap<>();
        payload.put("path",         entity.getPath());
        payload.put("segLengths",   entity.getSegLengths());
        payload.put("totalLength",  entity.getTotalLength());
        payload.put("realDuration", entity.getRealDuration());
        payload.put("travelFrac",   entity.getTravelFrac());
        payload.put("speedFactor",  entity.getSpeedFactor());
        payload.put("isPaused",     entity.isPaused());
        payload.put("stops",        entity.getStops());

        messagingTemplate.convertAndSend(
                "/topic/ride." + entity.getRideId(),
                Map.of("type", "INITIAL_STATE", "payload", payload)
        );
    }

    /** Called when driver/customer clicks “Start/Resume” */
    @Transactional
    public void resumeRide(Integer rideId) {
        Optional<SimulationState> opt = repo.findById(rideId);
        if (opt.isEmpty()) return;
        SimulationState state = opt.get();
        if (state.isPaused()) {
            state.setPaused(false);
            state.setLastUpdate(System.currentTimeMillis());
            repo.save(state);

            Map<String,Object> payload = Map.of(
                    "travelFrac", state.getTravelFrac(),
                    "isPaused",   state.isPaused(),
                    "lastUpdate", state.getLastUpdate()
            );
            messagingTemplate.convertAndSend(
                    "/topic/ride." + rideId,
                    Map.of("type", "STATE_UPDATE", "payload", payload)
            );
        }
    }

    /** Called when driver/customer clicks “Pause” */
    @Transactional
    public void pauseRide(Integer rideId) {
        Optional<SimulationState> opt = repo.findById(rideId);
        if (opt.isEmpty()) return;
        SimulationState state = opt.get();
        if (!state.isPaused()) {
            // 1) Advance travelFrac to “now” before pausing
            advanceFrac(state);

            state.setPaused(true);
            state.setLastUpdate(System.currentTimeMillis());
            repo.save(state);

            Map<String,Object> payload = Map.of(
                    "travelFrac", state.getTravelFrac(),
                    "isPaused",   state.isPaused(),
                    "lastUpdate", state.getLastUpdate()
            );
            messagingTemplate.convertAndSend(
                    "/topic/ride." + rideId,
                    Map.of("type", "STATE_UPDATE", "payload", payload)
            );
        }
    }

    /** Called when driver/customer changes speed (e.g. ×2) */
    @Transactional
    public void changeSpeed(Integer rideId, double newSpeed) {
        Optional<SimulationState> opt = repo.findById(rideId);
        if (opt.isEmpty()) return;
        SimulationState state = opt.get();

        // 1) “Catch up” travelFrac with old speed
        advanceFrac(state);

        // 2) Set new speedFactor & update lastUpdate
        state.setSpeedFactor(newSpeed);
        state.setLastUpdate(System.currentTimeMillis());
        repo.save(state);

        Map<String,Object> payload = Map.of(
                "speedFactor", state.getSpeedFactor(),
                "travelFrac",  state.getTravelFrac(),
                "lastUpdate",  state.getLastUpdate()
        );
        messagingTemplate.convertAndSend(
                "/topic/ride." + rideId,
                Map.of("type", "STATE_UPDATE", "payload", payload)
        );
    }

    /** Scheduled every 200 ms to advance travelFrac (if not paused) and broadcast updates */
    @Scheduled(fixedRate = 200)
    @Transactional
    public void tickAllSimulations() {
        List<SimulationState> allStates = repo.findAll();
        long now = System.currentTimeMillis();

        for (SimulationState state : allStates) {
            if (!state.isPaused() && state.getTravelFrac() < 1.0) {
                // 1) advance travelFrac to “now”
                advanceFrac(state);

                // 2) persist updated travelFrac & lastUpdate
                state.setLastUpdate(now);
                repo.save(state);

                // 3) broadcast just the changed fields
                Map<String,Object> payload = new HashMap<>();
                payload.put("travelFrac", state.getTravelFrac());
                payload.put("isPaused",   state.isPaused());
                payload.put("lastUpdate", state.getLastUpdate());

                messagingTemplate.convertAndSend(
                        "/topic/ride." + state.getRideId(),
                        Map.of("type", "STATE_UPDATE", "payload", payload)
                );
            }
        }
    }

    /** Helper: advance travelFrac based on (now – lastUpdate) × speedFactor / realDuration */
    private void advanceFrac(SimulationState state) {
        long now = System.currentTimeMillis();
        double elapsedSec = (now - state.getLastUpdate()) / 1000.0;
        double increment = (elapsedSec * state.getSpeedFactor()) / state.getRealDuration();
        state.setTravelFrac(Math.min(1.0, state.getTravelFrac() + increment));
    }

    /** Haversine formula (meters) */
    private double haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        double R = 6_371_000; // Earth radius in meters
        double φ1 = Math.toRadians(lat1);
        double φ2 = Math.toRadians(lat2);
        double Δφ = Math.toRadians(lat2 - lat1);
        double Δλ = Math.toRadians(lon2 - lon1);
        double a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
                + Math.cos(φ1) * Math.cos(φ2)
                * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
