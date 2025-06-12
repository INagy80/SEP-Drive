package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.DriverOffer;
import com.example.SEPDrive.model.adress;
import com.example.SEPDrive.model.carClass;
import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.service.HttpInterpreter;
import com.example.SEPDrive.service.rideRequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController()
@RequestMapping("v1/rideRequest")
public class rideRequisteController {

    @Autowired
    private rideRequestService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HttpInterpreter httpInterpreter;


    public record latlng() {

    }


    @GetMapping("getAllRideRequestsForUser")
    public List<rideRequest> getAllRideRequestforuser() {
        return service.getallRidesforuser();

    }


    @PostMapping( "create")
    public rideRequest createRideRequest(@RequestBody rideRequestDTO rideRequestDTO)  {


        return service.create(rideRequestDTO);
    }

    @GetMapping("findAll")
    public List<rideRequestDTO> findAll() {
        return service.findAll();
    }

    @GetMapping("getAll")
    public List<rideResponseDTO> getAll() {
        return service.getAll();
    }


    @PutMapping("/deletestatus")
    public void deletestatus(){
        service.deletestatus();
    }

    @GetMapping("getAllactiverideRequests")
    public List<rideResponseDTO> getAllactiverideRequests() {

        return service.getAllactiverideRequests();
    }

    @PutMapping("/updateRating/{user}/{rideRequestId}/{rating}")
    public void updateDriverRating(@PathVariable int rideRequestId, @PathVariable Double rating, @PathVariable String user) {

        service.updateRating(rideRequestId,rating, user);

    }


    @PutMapping("makeOffer/{id}")
    public DriverOffer makeoffer(@PathVariable int id) {

       return service.makeOffer(id, httpInterpreter.Interpreter().getUserName());

    }



    @PutMapping("OfferResponse/{id}/{isAccepted}")
    public void offerResponse(@PathVariable int id, @PathVariable boolean isAccepted) {

         service.respondToOffer(id, isAccepted);

    }

}
