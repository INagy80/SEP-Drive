package com.example.SEPDrive.controller;
import com.example.SEPDrive.model.carClass;

import com.example.SEPDrive.model.adress;

public record rideRequestDTO(carClass carClass, adress startAddress, adress destAddress){

    }

