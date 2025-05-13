package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.rideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface rideRequestDAO extends JpaRepository<rideRequest, Integer> {

    List<rideRequest> findByCustomerId(Integer customerId);
    List<rideRequest> findAll();

}


