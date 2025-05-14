package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.adress;
import com.example.SEPDrive.model.carClass;
import com.example.SEPDrive.model.rideRequest;
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




}
