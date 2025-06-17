package com.example.SEPDrive.repository;

import com.example.SEPDrive.model.DriverOffer;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface driverOfferDAO extends JpaRepository<DriverOffer, Integer> {
    List<DriverOffer> findByRideRequestId(Integer rideRequestId);
    Optional<DriverOffer> findByRideRequestIdAndDriverIdAndStatus(
            Integer rideRequestId, Integer driverId, OfferStatus status);
    List<DriverOffer> findByDriverIdAndStatus(Integer driverId, OfferStatus status);

    List<DriverOffer> findByDriver(Fahrer driver);
}
