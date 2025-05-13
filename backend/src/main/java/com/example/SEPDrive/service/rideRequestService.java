package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.rideRequestDTO;
import com.example.SEPDrive.exceptions.duplicatResourceException;
import com.example.SEPDrive.exceptions.resourceNotFoundException;
import com.example.SEPDrive.model.Kunde;
import com.example.SEPDrive.model.RequestStatus;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class rideRequestService {

    @Autowired
    private rideRequestDAO rideRequestDAO;

    @Autowired
    private userDAO userDAO;


    @Autowired
    private HttpInterpreter httpInterpreter;

    public List<rideRequest> getallRidesforuser() {
        return rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());

    }

    public rideRequest create(rideRequestDTO rideRequestdto) {

        Kunde customer = (Kunde) httpInterpreter.Interpreter();
        if(customer == null) {
            throw new resourceNotFoundException("User not found");
        }
        if(rideRequestDAO.findByCustomerId(customer.getId()) != null){
            for(rideRequest rideRequest : rideRequestDAO.findByCustomerId(customer.getId())){
                if(rideRequest.getStatus().equals(RequestStatus.Active)){
                    throw new duplicatResourceException("You already have an active request");
                }

            }
        }

        rideRequest rideRequest = new rideRequest(customer, rideRequestdto.carClass(),rideRequestdto.startAddress(),rideRequestdto.destAddress());

        
        return rideRequestDAO.save(rideRequest);

    }

    public List<rideRequest> getAll() {
        return rideRequestDAO.findAll();
    }
}
