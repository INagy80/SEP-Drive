package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.OffersDTO;
import com.example.SEPDrive.controller.fahrerDTO;
import com.example.SEPDrive.controller.rideResponseDTO;
import com.example.SEPDrive.exceptions.duplicatResourceException;
import com.example.SEPDrive.exceptions.resourceNotFoundException;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.driverOfferDAO;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class offerService {

    @Autowired
    private driverOfferDAO offerDAO;

    @Autowired
    private com.example.SEPDrive.repository.rideRequestDAO rideRequestDAO;

    @Autowired
    private com.example.SEPDrive.repository.userDAO userDAO;

    @Autowired
    private HttpInterpreter httpInterpreter;

    @Autowired
    private com.example.SEPDrive.repository.adressDAO adressDAO;

    @Autowired
    private SimpMessagingTemplate messaging;

    @Autowired
    private notificationService notificationService;

    @Autowired
    private driverOfferDAO driverOfferDAO;
    @Autowired
    private com.example.SEPDrive.repository.notificationDAO notificationDAO;



    public List<OffersDTO> getAllRideOffersForUser() {


        user customer = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        rideRequest ride = null;
        if (customer == null) {
            throw new resourceNotFoundException("User not found");
        }
        if (rideRequestDAO.findByCustomerId(customer.getId()) != null) {
            for (com.example.SEPDrive.model.rideRequest rideRequest : rideRequestDAO.findByCustomerId(customer.getId())) {
                if (rideRequest.getStatus().equals(RequestStatus.Active)) {
                     ride = rideRequest;
                }

            }
        }

        if (ride == null) {
            throw new resourceNotFoundException("Ride not found");
        }

        List<OffersDTO> offersDTOList = new ArrayList<>();

        List<DriverOffer> offers = offerDAO.findByRideRequestId(ride.getId()).stream().filter(o -> o.getStatus().equals(OfferStatus.PENDING)).toList();

        for (DriverOffer offer : offers) {

            Fahrer driver = (Fahrer) userDAO.findUserById(offer.getDriver().getId());
            double totalDistance = rideRequestDAO.findByDriver_Id(driver.getId()).stream()
                .filter(r -> r.getStatus() == RequestStatus.Completed)
                .mapToDouble(rideRequest::getDistance).sum();

            Double rating = 0.0;
            if(driver.getRating() != null){

                rating = driver.getRating();
            }
           OffersDTO offerDTO =  new OffersDTO(
                   offer.getId(),
                   offer.getStatus(),
                   new fahrerDTO(
                           driver.getId(),
                           driver.getUserName(),
                           driver.getEmail(),
                           driver.getFirstName(),
                           driver.getLastName(),
                           driver.getDateOfBirth(),
                           driver.getProfilePhoto(),
                           driver.getCarClass()
                   ),
                   ride.getId(),
                   driver.getTotalRides(),
                   totalDistance,
                   rating,
                   ride.getDistance(),
                   ride.getDuration(),
                   ride.getCost(),
                   ride.getCarClass(),
                   offer.getCreatedAt()


            );
           offersDTOList.add(offerDTO);

        }



        return offersDTOList;
    }
}
