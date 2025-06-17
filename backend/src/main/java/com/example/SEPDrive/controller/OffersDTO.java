package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.OfferStatus;
import com.example.SEPDrive.model.carClass;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record OffersDTO (
        Integer id,
        OfferStatus status,
        fahrerDTO driver,
        Integer rideId,
        Integer totalRides,
        Double totalDistance,
        Double Rating,
        double distance,
        double duration,
        double price,
        carClass ridecarClass,
        LocalDateTime createdAt
)
{ }
