package com.example.SEPDrive.controller;

public record leaderboardDTO(
        String username,
        String fullName,
        Integer totalRides,
        Double totalDistanceKm,
        Double averageRating,
        Double totalDriveTime,
        Double totalEarnings
) { }