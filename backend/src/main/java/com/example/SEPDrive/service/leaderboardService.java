package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.leaderboardDTO;
import com.example.SEPDrive.model.Fahrer;
import com.example.SEPDrive.model.RequestStatus;
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



    public List<leaderboardDTO> getLeaderboard() {
        List<Fahrer> allDrivers = userDAO.findalldrivers();
        List<leaderboardDTO> leaderboard = new ArrayList<>();

        for (Fahrer driver : allDrivers) {
            String username = driver.getUserName();
            String Fullname = driver.getFirstName()+" "+driver.getLastName();
            Double totalDistance = 0.0;
            Double averageRating = 0.0;
            if(driver.getRating() != null){
                averageRating = driver.getRating();
            }
            Double totalTime = 0.0;
            Double totalEarnings = 0.0;

            List<rideRequest> rides = rideRequestDAO.findByDriver_Id(driver.getId()).stream().filter(
                    r -> r.getStatus().equals(RequestStatus.Completed)
            ).toList();

            for (rideRequest r : rides) {
                totalDistance += r.getDistance();
                totalTime += r.getDuration();
                totalEarnings += r.getCost();
            }

            leaderboard.add(
                    new leaderboardDTO(
                            username,
                            Fullname,
                            rides.size(),
                            totalDistance,
                            averageRating,
                            totalTime,
                            totalEarnings
                    )
            );

        }
        return leaderboard;
    }



}