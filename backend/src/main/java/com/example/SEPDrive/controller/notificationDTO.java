package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.notificationStatus;

import java.time.LocalDateTime;

public record notificationDTO(
        Integer id,
        notificationpersonDTO sender,
        notificationpersonDTO receiver,
        notificationStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String message,
        String title,
        rideResponseDTO rideResponseDTO,
        Integer OfferId,
        Integer rideRequestId,
        Double totalDistance

)
{}
