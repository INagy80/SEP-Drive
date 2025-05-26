package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.model.carClass;

public record rideResponseDTO(
        String driverUserName ,
        carClass carClass ,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime updatedAt,
        String startAddress,
        String destinationAddress,
        double  customerRating,
        double driverRating,
        RequestStatus status,
        int id,
        String driverFullName,
        String customerFullName,
        String customerUserName,
        double distance,
        double duration,
        double price

) {
}
