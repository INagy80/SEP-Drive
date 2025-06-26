package com.example.SEPDrive.service;

import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.repository.rideRequestDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class statisticService {

    @Autowired
    private rideRequestDAO rideRequestDAO;

    public List<Double> calculateDailyDistance(LocalDate startDate, LocalDate endDate, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyDistances = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            double totalDistance = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalDistance += ride.getDistance();
                }
            }

            dailyDistances.add(Math.round(totalDistance * 100.0) / 100.0);
            currentDate = currentDate.plusDays(1);
        }

        return dailyDistances;
    }

    public List<Integer> calculateDailyRideDuration(LocalDate startDate, LocalDate endDate, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Integer> dailyDurations = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            int totalDuration = 0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalDuration += ride.getDuration();
                }
            }

            dailyDurations.add(totalDuration);
            currentDate = currentDate.plusDays(1);
        }

        return dailyDurations;
    }

    public List<Double> calculateDailyEinnahme(LocalDate startDate, LocalDate endDate, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyEinnahme = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            double totalEinnahme = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalEinnahme += ride.getCost();
                }
            }

            dailyEinnahme.add(Math.round(totalEinnahme * 100.0) / 100.0);
            currentDate = currentDate.plusDays(1);
        }

        return dailyEinnahme;
    }

    public List<Double> calculateDailyAverageRating(LocalDate startDate, LocalDate endDate, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyRatings = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            double totalRating = 0.0;
            int ratingCount = 0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate) &&
                        ride.getDrivererRating() != null) {

                    totalRating += ride.getDrivererRating();
                    ratingCount++;
                }
            }

            double avgRating = (ratingCount > 0) ? totalRating / ratingCount : 0.0;
            dailyRatings.add(Math.round(avgRating * 100.0) / 100.0);
            currentDate = currentDate.plusDays(1);
        }

        return dailyRatings;
    }
}
