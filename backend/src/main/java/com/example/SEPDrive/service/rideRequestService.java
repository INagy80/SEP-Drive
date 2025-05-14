package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.LatLng;
import com.example.SEPDrive.controller.rideRequestDTO;
import com.example.SEPDrive.controller.rideResponseDTO;
import com.example.SEPDrive.exceptions.duplicatResourceException;
import com.example.SEPDrive.exceptions.resourceNotFoundException;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import com.graphhopper.util.PointList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import com.graphhopper.GraphHopper;
import com.graphhopper.config.Profile;
import com.graphhopper.GHRequest;
import com.graphhopper.GHResponse;
import com.graphhopper.ResponsePath;

import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class rideRequestService {

    @Autowired
    private rideRequestDAO rideRequestDAO;

    @Autowired
    private userDAO userDAO;


    @Autowired
    private HttpInterpreter httpInterpreter;
    @Autowired
    private com.example.SEPDrive.repository.adressDAO adressDAO;








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

        adress startadress = new adress(rideRequestdto.start().getLat(), rideRequestdto.start().getLng());

        adress destadress = new adress(rideRequestdto.destination().getLat(), rideRequestdto.destination().getLng());


        String[] parts = rideRequestdto.startaddress().split("\\s*,\\s*");
        startadress.setHouseNumberAndStreet(parts[0]+", "+parts[1]);
        startadress.setCountry(parts[parts.length - 1]);
        startadress.setZip(parts[parts.length - 2]);
        startadress.setState(parts[parts.length - 3]);
        startadress.setCity(parts[parts.length - 4]);

        String[] parts2 = rideRequestdto.destinationaddress().split("\\s*,\\s*");
        destadress.setHouseNumberAndStreet(parts[0]+", "+parts[1]);
        destadress.setCountry(parts2[parts2.length - 1]);
        destadress.setZip(parts2[parts2.length - 2]);
        destadress.setState(parts2[parts2.length - 3]);
        destadress.setCity(parts2[parts2.length - 4]);




        adressDAO.save(startadress);
        adressDAO.save(destadress);

        rideRequest rideRequest = new rideRequest(customer , rideRequestdto.carClass(), startadress, destadress);
        //rideRequest.setGpxRoute(generateCarRouteGpx(startadress.getLat(),startadress.getLng(),destadress.getLat(),startadress.getLng()).toString().getBytes(StandardCharsets.UTF_8));


        
        return rideRequestDAO.save(rideRequest);

    }

    public List<rideRequestDTO> findAll() {
        List<rideRequest> rideRequestList = rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());
        List<rideRequestDTO> rideRequestDTOList = new ArrayList<>();
        for(rideRequest rideRequest : rideRequestList){
            rideRequestDTO ride = new rideRequestDTO( new LatLng( rideRequest.getStartAddress().getLat(),
                    rideRequest.getStartAddress().getLng()),
                    rideRequest.getStartAddress().getHouseNumberAndStreet() +
                            rideRequest.getStartAddress().getCity() +
                            rideRequest.getStartAddress().getState() +
                            rideRequest.getStartAddress().getZip() +
                            rideRequest.getStartAddress().getCountry(),
                    new LatLng(rideRequest.getDestAddress().getLat() , rideRequest.getDestAddress().getLng()),
                    rideRequest.getDestAddress().getHouseNumberAndStreet() +
                            rideRequest.getDestAddress().getCity() +
                            rideRequest.getDestAddress().getState() +
                            rideRequest.getDestAddress().getZip() +
                            rideRequest.getDestAddress().getCountry(),
                    rideRequest.getCarClass()
            );
            rideRequestDTOList.add(ride);

        }
        return rideRequestDTOList;
    }

    public List<rideResponseDTO> getAll() {
        List<rideRequest> rideRequestList = rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());
        List<rideResponseDTO> rideResponseDTOS = new ArrayList<>();
        for(rideRequest request : rideRequestList){
            String name = " ";
            if(request.getDriver() == null){
                name = "No driver assigned";
            }
            else{
                name = request.getDriver().getUserName();
            }

            rideResponseDTO response = new rideResponseDTO(
                    name,
                    request.getCarClass(),
                    request.getCreatedAt(),
                    request.getUpdatedAt(),
                    request.getStartAddress().getHouseNumberAndStreet() +
                            request.getStartAddress().getCity() +
                            request.getStartAddress().getState() +
                            request.getStartAddress().getZip() +
                            request.getStartAddress().getCountry(),
                    request.getDestAddress().getHouseNumberAndStreet() +
                            request.getDestAddress().getCity() +
                            request.getDestAddress().getState() +
                            request.getDestAddress().getZip() +
                            request.getDestAddress().getCountry(),
                    request.getCustomerRating(),
                    request.getDrivererRating(),
                    request.getStatus()
            );

            rideResponseDTOS.add(response);

        }

        return rideResponseDTOS;
    }


//    public String generateCarRouteGpx(double startLat, double startLon,
//                                      double endLat, double endLon) {
//        String osmFile = "path/to/osm/file.osm.pbf";
//        String graphCacheDir = "graph-cache";
//        Profile prof =new Profile("car");
//        prof.setWeighting("custom");
//
//        this.hopper = new GraphHopper()
//                .setOSMFile(osmFile)
//                .setGraphHopperLocation(graphCacheDir)
//                .setProfiles(prof);
//        hopper.importOrLoad();
//
//        GHRequest req = new GHRequest(startLat, startLon, endLat, endLon)
//                .setProfile("car");
//        GHResponse resp = hopper.route(req);
//        if (resp.hasErrors()) {
//            throw new IllegalStateException("Routing failed: " + resp.getErrors());
//        }
//
//        // Get the list of track points
//        ResponsePath path = resp.getBest();
//        PointList points = path.getPoints();
//
//        // Build GPX manually
//        StringBuilder sb = new StringBuilder();
//        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
//        sb.append("<gpx version=\"1.1\" creator=\"GraphHopper\">\n");
//        sb.append("  <trk>\n");
//        sb.append("    <name>GraphHopper Car Route</name>\n");
//        sb.append("    <trkseg>\n");
//        for (int i = 0; i < points.size(); i++) {
//            sb.append(String.format(Locale.US,
//                    "      <trkpt lat=\"%.6f\" lon=\"%.6f\"/>\n",
//                    points.getLat(i), points.getLon(i)));
//        }
//        sb.append("    </trkseg>\n");
//        sb.append("  </trk>\n");
//        sb.append("</gpx>");
//
//
//
//
//        return sb.toString();
//    }
}

