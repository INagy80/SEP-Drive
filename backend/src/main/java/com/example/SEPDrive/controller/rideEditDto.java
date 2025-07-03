package com.example.SEPDrive.controller;

import java.util.List;

public record rideEditDto(
        LatLng          destination,
        String          destinationaddress,
        List<LatLng>    zwischenstops,
        List<String>    zwischenstopssaddress,
        Double          cost,
        Double          duration,
        Double          distance
) { }
