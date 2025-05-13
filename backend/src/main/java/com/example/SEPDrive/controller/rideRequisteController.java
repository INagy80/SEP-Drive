package com.example.SEPDrive.controller;

import com.example.SEPDrive.model.rideRequest;
import com.example.SEPDrive.service.rideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController()
@RequestMapping("v1/rideRequest")
public class rideRequisteController {

    @Autowired
    private rideRequestService service;

    @GetMapping("getAllRideRequestsForUser")
    public List<rideRequest> getAllRideRequestforuser(){
        return service.getallRidesforuser() ;

    }



    @PostMapping("create")
    public rideRequest createRideRequest(@RequestBody  rideRequestDTO rideRequestdto){
        return service.create(rideRequestdto);
    }

    @GetMapping("getAll")
    public List<rideRequest> getAll(){
       return service.getAll();
    }
}
