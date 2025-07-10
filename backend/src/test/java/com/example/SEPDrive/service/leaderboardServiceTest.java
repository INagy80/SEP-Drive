package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.leaderboardDTO;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class leaderboardServiceTest {

    @Mock
    private userDAO userDAO;

    @Mock
    private rideRequestDAO rideRequestDAO;

    @InjectMocks
    private leaderboardService leaderboardService;

    @Test
    void testGetLeaderboard() {
        // Arrange
        Fahrer driver = new Fahrer();
        driver.setId(1);
        driver.setUserName("driver1");
        driver.setFirstName("Bashar");
        driver.setLastName("Bashar");
        driver.setRating(4.7);

        rideRequest ride1 = new rideRequest();
        ride1.setDistance(12.0);
        ride1.setDuration(600.0);
        ride1.setCost(22.0);
        ride1.setStatus(RequestStatus.Completed);

        rideRequest ride2 = new rideRequest();
        ride2.setDistance(18.0);
        ride2.setDuration(900.0);
        ride2.setCost(33.0);
        ride2.setStatus(RequestStatus.Completed);

        when(userDAO.findalldrivers()).thenReturn(List.of(driver));
        when(rideRequestDAO.findByDriver_Id(1)).thenReturn(List.of(ride1, ride2));

        // Act
        List<leaderboardDTO> leaderboard = leaderboardService.getLeaderboard();

        // Assert
        assertEquals(1, leaderboard.size());

        leaderboardDTO dto = leaderboard.get(0);
        assertEquals("driver1", dto.username());
        assertEquals("Bashar Bashar", dto.fullName());
        assertEquals(2, dto.totalRides());
        assertEquals(30.0, dto.totalDistanceKm());
        assertEquals(4.7, dto.averageRating());
        assertEquals(1500.0, dto.totalDriveTime());
        assertEquals(55.0, dto.totalEarnings());
    }
}
