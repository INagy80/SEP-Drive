package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.SimulationState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface simulationDAO extends JpaRepository<SimulationState, Integer> {

        Optional<SimulationState> findByRideId(Long rideId);

}


