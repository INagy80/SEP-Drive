package com.example.SEPDrive.controller;
import com.example.SEPDrive.model.carClass;


public record rideRequestDTO(double distance,double duration,double price, LatLng start, String startaddress, LatLng destination, String destinationaddress, carClass carClass){

    }

