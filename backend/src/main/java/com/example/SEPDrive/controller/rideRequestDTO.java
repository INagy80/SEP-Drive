package com.example.SEPDrive.controller;
import com.example.SEPDrive.model.carClass;

import java.util.List;


public record rideRequestDTO(double distance, double duration, double price, LatLng start, String startaddress, List<LatLng> zwischenstops, List<String> zwischenstopssaddress, LatLng destination, String destinationaddress, carClass carClass){

    }

