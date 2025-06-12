package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.rideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface rideRequestDAO extends JpaRepository<rideRequest, Integer> {

    List<rideRequest> findByCustomerId(Integer customerId);

    List<rideRequest> findAll();

    @Query(value = "SELECT * from ride_requests where driver_id = :driverId",nativeQuery = true)
    List<rideRequest> findByDriver_Id(@Param("driverId") Integer driverId);

    @Query(value = "SELECT * from ride_requests where id = :Id",nativeQuery = true)
    rideRequest findbyid(@Param("Id")Integer requestId);
}


