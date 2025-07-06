package com.example.SEPDrive.service;

import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class leaderboardServiceTest {

    @Mock
    private userDAO userDAO;

    @Mock
    private rideRequestDAO rideRequestDAO;

    @InjectMocks
    private leaderboardService leaderboardService;

    @Test
    void testGetLeaderboard_withSingleDriverAndRides() {
        // Arrange
        Fahrer driver = new Fahrer();
        driver.setUserName("driver1");
        driver.setFirstName("John");
        driver.setLastName("Doe");

        rideRequest ride1 = new rideRequest();
        ride1.setDistance(10.0);
        ride1.setDrivererRating(4.0);
        ride1.setDuration(600.0);
        ride1.setCost(20.0);

        rideRequest ride2 = new rideRequest();
        ride2.setDistance(15.0);
        ride2.setDrivererRating(5.0);
        ride2.setDuration(900.0);
        ride2.setCost(30.0);

        when(userDAO.findalldrivers()).thenReturn(List.of(driver));
        when(rideRequestDAO.findByDriver_UserName("driver1")).thenReturn(List.of(ride1, ride2));

        // Act
        List<Map<String, Object>> leaderboard = leaderboardService.getLeaderboard();

        // Assert
        assertEquals(1, leaderboard.size());
        Map<String, Object> row = leaderboard.get(0);
        assertEquals("driver1", row.get("username"));
        assertEquals("John Doe", row.get("fullName"));
        assertEquals(2, row.get("totalRides"));
        assertEquals(25.0, (Double) row.get("totalDistanceKm"), 0.001);
        assertEquals(4.5, (Double) row.get("averageRating"), 0.001);
        assertEquals(1500L, row.get("totalDriveTimeSeconds"));
        assertEquals(50.0, (Double) row.get("totalEarnings"), 0.001);
    }
}
