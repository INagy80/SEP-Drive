package com.example.SEPDrive.controller;

public record notificationpersonDTO(
        Integer id,
        String userName,
        String email,
        String firstName,
        String lastName,
        Double Rating,
        Integer totalRides
)
{ }
