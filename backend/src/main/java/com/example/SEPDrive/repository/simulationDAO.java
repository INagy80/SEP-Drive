package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.SimulationState;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface simulationDAO extends JpaRepository<SimulationState, Integer> {

        Optional<SimulationState> findByRideId(Long rideId);

}


