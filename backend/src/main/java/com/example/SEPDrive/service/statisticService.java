package com.example.SEPDrive.service;

import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.model.user;
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

    @Autowired
    private HttpInterpreter Interpreter;

    public List<Double> calculateDailyDistance(int year, int month) {
        user currentUser = Interpreter.Interpreter();
        String driverUsername = currentUser.getUserName();

        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyDistances = new ArrayList<>();

        int daysInMonth = LocalDate.of(year, month, 1).lengthOfMonth();

        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate currentDate = LocalDate.of(year, month, day);
            double totalDistance = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalDistance += ride.getDistance();
                }
            }

            dailyDistances.add(Math.round(totalDistance * 100.0) / 100.0);
        }

        return dailyDistances;
    }

    public List<Double> calculateDailyRideDuration(int year, int month) {
        user curentuser = Interpreter.Interpreter();
        String driverUsername = curentuser.getUserName();

        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyDurations = new ArrayList<>();
        int daysInMonth = LocalDate.of(year, month, 1).lengthOfMonth();
        for (int dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
            LocalDate currentDate = LocalDate.of(year, month, dayOfMonth);
            double totalDuration = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalDuration +=  ride.getDuration();
                }
            }

            dailyDurations.add(Math.round(totalDuration * 100.0) / 100.0);
        }

        return dailyDurations;
    }

    public List<Double> calculateDailyEinnahme(int  year, int month) {

        user curentuser = Interpreter.Interpreter();
        String driverUsername = curentuser.getUserName();


        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyEinnahme = new ArrayList<>();

        int daysInMonth = LocalDate.of(year, month, 1).lengthOfMonth();

        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate currentDate = LocalDate.of(year, month, day);
            double totalDailyEinname = 0.0;

            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalDailyEinname += ride.getCost();
                }
            }

            dailyEinnahme.add(Math.round(totalDailyEinname * 100.0) / 100.0);
        }
        return dailyEinnahme;
    }

    public List<Double> calculateDailyAverageRating(int year  , int month ) {
        user curentuser = Interpreter.Interpreter();
        String driverUsername = curentuser.getUserName();


        List<rideRequest> allRides = rideRequestDAO.findByDriver_UserName(driverUsername);
        List<Double> dailyRatings = new ArrayList<>();

        int daysInMonth = LocalDate.of(year, month, 1).lengthOfMonth();
        for (int day = 1; day <= daysInMonth; day++) {
            LocalDate currentDate = LocalDate.of(year, month, day);
            double totalRating = 0.0;
            int ratingCount = 0;
            for (rideRequest ride : allRides) {
                if (ride.getStatus() == RequestStatus.Completed &&
                        ride.getCreatedAt().toLocalDate().equals(currentDate)) {

                    totalRating += ride.getDrivererRating();
                    ratingCount++;

                    if (ratingCount > 0) {
                        double avgRating = totalRating / ratingCount;
                        avgRating = Math.round(avgRating * 100.0) / 100.0;
                        dailyRatings.add(avgRating);
                    } else {
                        dailyRatings.add(0.0); // No ratings that day
                    }


                }
            }
        }

        return dailyRatings;
    }

    public List<Double> calculateYearlyRideDuration(int year) {
        List<Double> monthlyDurations = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            List<Double> dailyDurations = calculateDailyRideDuration(year, month);
            double  totalMonthlyDuration = 0;

            for (double duration : dailyDurations) {
                totalMonthlyDuration += duration;
            }

            monthlyDurations.add(totalMonthlyDuration);
        }

        return monthlyDurations;
    }

    public List<Double> calculateYearlyDistance(int year) {
        List<Double> monthlyDistances = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            List<Double> dailyDistances = calculateDailyDistance(year, month);
            double totalMonthlyDistance = 0.0;

            for (double distance : dailyDistances) {
                totalMonthlyDistance += distance;
            }

            monthlyDistances.add(Math.round(totalMonthlyDistance * 100.0) / 100.0);
        }

        return monthlyDistances;
    }

    public List<Double> calculateYearlyEinnahme(int year) {
        List<Double> monthlyEinnahme = new ArrayList<>();

            for (int month = 1; month <= 12; month++) {
                List<Double>  dailyEinnahme = calculateDailyEinnahme(year,month);
                double totalMonthlyEinnahme = 0.0;

                for(double einnahme : dailyEinnahme) {
                    totalMonthlyEinnahme += einnahme;
                }

                monthlyEinnahme.add(Math.round(totalMonthlyEinnahme * 100.0) / 100.0);
            }
            return monthlyEinnahme;
    }

    public List<Double> calculateYearlyAverageRating(int year) {
        List<Double> monthlyRatings = new ArrayList<>();

        for (int month = 1; month <= 12; month++) {
            List<Double> dailyRatings = calculateDailyAverageRating(year, month);
            double totalMonthlyRating = 0.0;
            int count = 0;

            for (double rating : dailyRatings) {
                if (rating > 0) {
                    totalMonthlyRating += rating;
                    count++;
                }
            }

            if (count > 0) {
                double monthlyAvg = totalMonthlyRating/ count;
                monthlyAvg = Math.round(monthlyAvg * 100.0) / 100.0;
                monthlyRatings.add(monthlyAvg);
            } else {
                monthlyRatings.add(0.0);
            }

        }

        return monthlyRatings;
    }


}

