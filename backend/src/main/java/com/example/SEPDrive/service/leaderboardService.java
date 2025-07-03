package com.example.SEPDrive.service;

import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class leaderboardService {

    @Autowired
    private userDAO userDAO;
    @Autowired
    private rideRequestDAO rideRequestDAO;



    public List<Map<String, Object>> getLeaderboard() {
        List<Fahrer> allDrivers = userDAO.findalldrivers();
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        for (Fahrer driver : allDrivers) {
            Map<String, Object> row = new HashMap<>();
            String username = driver.getUserName();

            row.put("username", username);
            row.put("fullName", driver.getFirstName() + " " + driver.getLastName());

            List<rideRequest> rides = rideRequestDAO.findByDriver_UserName(username);

            // totalRides
            row.put("totalRides", rides.size());

            // totalDistance
            double totalDistance = 0.0;
            for (rideRequest ride : rides) {
                totalDistance += ride.getDistance();
            }
            row.put("totalDistanceKm", totalDistance);

            // averageRating (driver rating)
            double ratingSum = 0.0;
            int ratingCount = 0;
            for (rideRequest ride : rides) {
                Double rating = ride.getDrivererRating();
                if (rating != null) {
                    ratingSum += rating;
                    ratingCount++;
                }
            }
            double averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0.0;
            row.put("averageRating", averageRating);

            // totalDriveTime
            long totalDriveTime = 0;
            for (rideRequest ride : rides) {
                Double duration = ride.getDuration();

                if (duration != null) {
                    totalDriveTime += duration;
                }
            }
            row.put("totalDriveTimeSeconds", totalDriveTime);

            // totalEarnings
            double totalEarnings = 0.0;
            for (rideRequest ride : rides) {
                Double cost = ride.getCost();
                if (cost != null) {
                    totalEarnings += cost;
                }
            }
            row.put("totalEarnings", totalEarnings);

            leaderboard.add(row);
        }

        return leaderboard;
    }



}