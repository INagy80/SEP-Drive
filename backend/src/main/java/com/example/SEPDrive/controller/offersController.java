package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.offerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController()
@RequestMapping("v1/rideOffers")
public class offersController {

    @Autowired
    private offerService service;


    @GetMapping("getAllRideOffersForUser")
    public List<OffersDTO> getAllRideOffersForUser() {
        return service.getAllRideOffersForUser();
    }


}
