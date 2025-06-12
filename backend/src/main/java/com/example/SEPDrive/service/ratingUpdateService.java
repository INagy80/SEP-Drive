package com.example.SEPDrive.service;

import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.model.user;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class ratingUpdateService {

    @Autowired
    private userDAO userDAO;

    @Autowired
    private rideRequestDAO repo;

//    @Transactional                        // Ensures the updates happen inside a transaction
//    @Scheduled(fixedRate = 1000)       // Run every 10 minutes (600,000ms = 10 mins)
//    public void updateUserAttributes() {
//
//        List<rideRequest> list = repo.findAll().stream().filter(request -> request.getStatus().equals(RequestStatus.Completed)).toList();;
//
//        List<user> users = userDAO.findAll();
//        for (user user : users) {
//            user.restettotalrates();
//            user.restetRating();
//            user.resetTotalRides();
//            userDAO.save(user);
//        }
//
//        for (rideRequest r : list) {
//            user driver = r.getDriver();
//            user Customer = r.getCustomer();
//
//            driver.setTotalRides();
//            driver.setRating(r.getDrivererRating());
//            userDAO.save(driver);
//
//
//            Customer.setTotalRides();
//            Customer.setRating(r.getCustomerRating());
//            userDAO.save(Customer);
//
//        }
//    }
}
