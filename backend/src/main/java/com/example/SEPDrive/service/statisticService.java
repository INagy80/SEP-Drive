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



    public List<Double> calculateDailyDistance(List<LocalDate> dailyList, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyDistances = new ArrayList<>();

        for (LocalDate day : dailyList) {
            double totalDistance = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(day)) {
                    totalDistance += ride.getDistance();
                }
            }

            dailyDistances.add(Math.round(totalDistance * 100.0) / 100.0);
        }

        return dailyDistances;
    }

    public List<Integer> calculateDailyRideDuration(List<LocalDate> dailyList, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Integer> dailyDurations = new ArrayList<>();

        for (LocalDate day : dailyList) {
            int totalDuration = 0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(day)) {
                    totalDuration += ride.getDuration(); // in minutes
                }
            }

            dailyDurations.add(totalDuration);
        }

        return dailyDurations;
    }

    public List<Double> calculateDailyEinnahme(List<LocalDate> dailyList, String driverUsername) {
        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyEinnahme = new ArrayList<>();

        for (LocalDate day : dailyList) {
            double totalEinnahme = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(day)) {
                    totalEinnahme += ride.getCost();
                }
            }

            dailyEinnahme.add(Math.round(totalEinnahme * 100.0) / 100.0);
        }

        return dailyEinnahme;
    }
}
