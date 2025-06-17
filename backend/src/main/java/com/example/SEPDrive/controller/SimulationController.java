package com.example.SEPDrive.controller;

import com.example.SEPDrive.service.HttpInterpreter;
import com.example.SEPDrive.service.rideRequestService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("v1/simulations")
public class SimulationController {

    @Autowired
    private rideRequestService service;


    @Autowired
    private HttpInterpreter httpInterpreter;

    @PutMapping("simulation/{id}/{hasEnded}")
    public void handleSimulationUpdate(
            @PathVariable Integer id,
            @RequestBody SimulationUpdatePayload update,
            @PathVariable Boolean hasEnded) {
        this.service.updateSimulation(id,update,hasEnded);
    }

}
