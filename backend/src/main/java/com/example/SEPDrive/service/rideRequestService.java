package com.example.SEPDrive.service;

import com.example.SEPDrive.controller.*;
import com.example.SEPDrive.exceptions.duplicatResourceException;
import com.example.SEPDrive.exceptions.resourceNotFoundException;
import com.example.SEPDrive.model.*;
import com.example.SEPDrive.repository.driverOfferDAO;
import com.example.SEPDrive.repository.rideRequestDAO;
import com.example.SEPDrive.repository.userDAO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Currency;
import java.util.List;
import java.util.stream.Collectors;


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

    @Autowired
    private SimpMessagingTemplate messaging;

    @Autowired
    private notificationService notificationService;

    @Autowired
    private driverOfferDAO driverOfferDAO;
    @Autowired
    private com.example.SEPDrive.repository.notificationDAO notificationDAO;

    @Autowired
    private geldKontoService geldKontoService;


    public List<rideRequest> getallRidesforuser() {
        return rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());

    }

    @Transactional
    public rideRequest create(rideRequestDTO rideRequestdto) {

        user customer = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        if (customer == null) {
            throw new resourceNotFoundException("User not found");
        }
        if (rideRequestDAO.findByCustomerId(customer.getId()) != null) {
            for (rideRequest rideRequest : rideRequestDAO.findByCustomerId(customer.getId())) {
                if (rideRequest.getStatus().equals(RequestStatus.Active) || rideRequest.getStatus().equals(RequestStatus.Assigned)) {
                    throw new duplicatResourceException("You already have an active request");
                }

            }
            for (rideRequest rideRequest : rideRequestDAO.findByDriver_Id(customer.getId())) {
                if (rideRequest.getStatus().equals(RequestStatus.Active) || rideRequest.getStatus().equals(RequestStatus.Assigned)) {
                    throw new duplicatResourceException("You already have an active request");
                }

            }

        }

        adress startadress = new adress(rideRequestdto.start().getLat(), rideRequestdto.start().getLng());

        adress destadress = new adress(rideRequestdto.destination().getLat(), rideRequestdto.destination().getLng());

        List<adress> zwischenstops = new ArrayList<>();
        for (LatLng a : rideRequestdto.zwischenstops()) {
            adress temp = new adress(a.getLat(), a.getLng());
            zwischenstops.add(temp);


        }

        int i = 0;
        for (String s : rideRequestdto.zwischenstopssaddress()) {

            adress a = zwischenstops.get(i);
            String[] zwischenstopsparts = s.split("\\s*,\\s*");
            a.setHouseNumberAndStreet(zwischenstopsparts[0] + ", " + zwischenstopsparts[1]);
            a.setCountry(zwischenstopsparts[zwischenstopsparts.length - 1]);
            a.setZip(zwischenstopsparts[zwischenstopsparts.length - 2]);
            a.setState(zwischenstopsparts[zwischenstopsparts.length - 3]);
            a.setCity(zwischenstopsparts[zwischenstopsparts.length - 4]);
            i++;
        }


        String[] parts = rideRequestdto.startaddress().split("\\s*,\\s*");
        startadress.setHouseNumberAndStreet(parts[0] + ", " + parts[1]);
        startadress.setCountry(parts[parts.length - 1]);
        startadress.setZip(parts[parts.length - 2]);
        startadress.setState(parts[parts.length - 3]);
        startadress.setCity(parts[parts.length - 4]);

        String[] parts2 = rideRequestdto.destinationaddress().split("\\s*,\\s*");
        //the address failiar was in here instaed of calling the parts2[0] and parts2[1]. I have called parts[0] and parts[1]
        destadress.setHouseNumberAndStreet(parts2[0] + ", " + parts2[1]);
        destadress.setCountry(parts2[parts2.length - 1]);
        destadress.setZip(parts2[parts2.length - 2]);
        destadress.setState(parts2[parts2.length - 3]);
        destadress.setCity(parts2[parts2.length - 4]);


        adressDAO.save(startadress);
        adressDAO.save(destadress);

        rideRequest rideRequest = new rideRequest(customer, rideRequestdto.carClass(), startadress, destadress);
        rideRequest.setDistance(rideRequestdto.distance());
        rideRequest.setDuration(rideRequestdto.duration());
        rideRequest.setCost(rideRequestdto.price());
        rideRequest.getZwischenstops().addAll(zwischenstops);

        //rideRequest.setGpxRoute(generateCarRouteGpx(startadress.getLat(),startadress.getLng(),destadress.getLat(),startadress.getLng()).toString().getBytes(StandardCharsets.UTF_8));


        List<Fahrer> drivers = userDAO.findalldrivers();

        for (Fahrer driver : drivers) {
            notification note = new notification(
                    rideRequest.getCustomer(),
                    driver,
                    "Hello, "+driver.getFirstName()+" "+driver.getLastName()+ "\n"+".     there is a new ride request near you. check the Active ride requests if you are Interested",
                    "New Active Ride Request!",
                    rideRequest
            );
            notificationDAO.save(note);


            notificationDTO notificationDTO = new notificationDTO(
                    note.getId(),
                    new notificationpersonDTO(rideRequest.getCustomer().getId(), rideRequest.getCustomer().getUserName(),rideRequest.getCustomer().getEmail(),rideRequest.getCustomer().getFirstName(),rideRequest.getCustomer().getLastName(),rideRequest.getCustomer().getRating(),rideRequest.getCustomer().getTotalRides()),
                    new notificationpersonDTO(driver.getId(), driver.getUserName(),driver.getEmail(),driver.getFirstName(),driver.getLastName(),driver.getRating(),driver.getTotalRides()),
                    note.getStatus(),
                    note.getCreatedAt(),
                    note.getUpdatedAt(),
                    note.getMessage(),
                    note.getTitle(),
                    null,
                    0,
                    rideRequest.getId(),
                    0.0,
                    null

            );
            notificationService.sendNotification(driver.getUserName(), notificationDTO);

        }





        return rideRequestDAO.save(rideRequest);

    }

    public List<rideRequestDTO> findAll() {
        List<rideRequest> allrideRequests = new ArrayList<>();
        List<rideRequest> rideRequestList = rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());
        user user = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        if (user instanceof Fahrer) {
            List<rideRequest> rideRequestListasdriver = rideRequestDAO.findByDriver_Id(httpInterpreter.Interpreter().getId());
            allrideRequests.addAll(rideRequestListasdriver);
        }
        allrideRequests.addAll(rideRequestList);
        List<rideRequestDTO> rideRequestDTOList = new ArrayList<>();
        for (rideRequest rideRequest : allrideRequests) {
            List<LatLng> zwischenstopsLatLng = new ArrayList<>();
            List<String> zwischenstopssaddress = new ArrayList<>();
            for (adress a : rideRequest.getZwischenstops()) {
                zwischenstopsLatLng.add(new LatLng(a.getLat(), a.getLng()));
                zwischenstopssaddress.add(a.getHouseNumberAndStreet() + " " +
                        a.getCity() + " " +
                        a.getState() + " " +
                        a.getZip() + " " +
                        a.getCountry());
            }


            rideRequestDTO ride = new rideRequestDTO(
                    rideRequest.getDistance(),
                    rideRequest.getDuration(),
                    rideRequest.getCost(),
                    new LatLng(rideRequest.getStartAddress().getLat(),
                            rideRequest.getStartAddress().getLng()),
                    rideRequest.getStartAddress().getHouseNumberAndStreet() + " " +
                            rideRequest.getStartAddress().getCity() + " " +
                            rideRequest.getStartAddress().getState() + " " +
                            rideRequest.getStartAddress().getZip() + " " +
                            rideRequest.getStartAddress().getCountry(),

                    zwischenstopsLatLng,
                    zwischenstopssaddress,

                    new LatLng(rideRequest.getDestAddress().getLat(), rideRequest.getDestAddress().getLng()),
                    rideRequest.getDestAddress().getHouseNumberAndStreet() + " " +
                            rideRequest.getDestAddress().getCity() + " " +
                            rideRequest.getDestAddress().getState() + " " +
                            rideRequest.getDestAddress().getZip() + " " +
                            rideRequest.getDestAddress().getCountry(),
                    rideRequest.getCarClass()
            );
            rideRequestDTOList.add(ride);

        }
        return rideRequestDTOList;
    }

    public List<rideResponseDTO> getAll() {
        List<rideRequest> rideRequestList = rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId());
        List<rideRequest> allrideRequest = new ArrayList<>();
        user user = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        if (user instanceof Fahrer) {
            List<rideRequest> rideRequestListasdriver = rideRequestDAO.findByDriver_Id(httpInterpreter.Interpreter().getId());
            allrideRequest.addAll(rideRequestListasdriver);
        }
        allrideRequest.addAll(rideRequestList);
        List<rideResponseDTO> rideResponseDTOS = new ArrayList<>();
        for (rideRequest request : allrideRequest) {
            String driverUserName = " ";
            String driverfullname = " ";
            if (request.getDriver() != null) {

                driverUserName = request.getDriver().getUserName();
                driverfullname = request.getDriver().getFirstName() + " " + request.getDriver().getLastName();
            }

            List<LatLng> zwischenstopsLatLng = new ArrayList<>();
            List<String> zwischenstopssaddress = new ArrayList<>();
            for (adress a : request.getZwischenstops()) {
                zwischenstopsLatLng.add(new LatLng(a.getLat(), a.getLng()));
                zwischenstopssaddress.add(a.getHouseNumberAndStreet() + " " +
                        a.getCity() + " " +
                        a.getState() + " " +
                        a.getZip() + " " +
                        a.getCountry());
            }


            rideResponseDTO response = new rideResponseDTO(
                    driverUserName,
                    request.getCarClass(),
                    request.getCreatedAt(),
                    request.getUpdatedAt(),
                    request.getStartAddress().getHouseNumberAndStreet() +
                            request.getStartAddress().getCity() + " " +
                            request.getStartAddress().getState() + " " +
                            request.getStartAddress().getZip() + " " +
                            request.getStartAddress().getCountry(),
                    new LatLng(request.getStartAddress().getLat(), request.getStartAddress().getLng()),
                    request.getDestAddress().getHouseNumberAndStreet() + " " +
                            request.getDestAddress().getCity() + " " +
                            request.getDestAddress().getState() + " " +
                            request.getDestAddress().getZip() + " " +
                            request.getDestAddress().getCountry(),
                    new LatLng(request.getDestAddress().getLat(), request.getDestAddress().getLng()),
                    request.getCustomerRating(),
                    request.getDrivererRating(),
                    request.getStatus(),
                    request.getId(),
                    driverfullname,
                    request.getCustomer().getFirstName() + " " + request.getCustomer().getLastName(),
                    request.getCustomer().getUserName(),
                    request.getDistance(),
                    request.getDuration(),
                    request.getCost(),
                    zwischenstopsLatLng,
                    zwischenstopssaddress
            );

            rideResponseDTOS.add(response);

        }

        return rideResponseDTOS;
    }

    public void deletestatus() {
        rideRequest request = rideRequestDAO.findByCustomerId(httpInterpreter.Interpreter().getId()).stream().filter(r -> r.getStatus().equals(RequestStatus.Active)).toList().stream().findFirst().orElse(null);;


        if(request != null) {
            if(request.getDriver() != null ||request.getStatus().equals(RequestStatus.Assigned)) {
                throw new RuntimeException("you Can not delete this ride request because you are already in a ride");
            }
            request.setStatus(RequestStatus.Cancelled);
        }

        // reject all other pending offers
        var others = driverOfferDAO.findByRideRequestId(request.getId());
        for (var o : others) {
            if (o.getStatus() == OfferStatus.PENDING) {
                o.setStatus(OfferStatus.CANCELLED);
                driverOfferDAO.save(o);


                var note2 = new notification(
                        request.getCustomer(),
                        o.getDriver(),
                        "you offer to ride request with id: "+request.getId()+"  is Cancelled because Customer has deleted this ride request",
                        "Offer Cancelled!!",
                        request
                );
                notificationDAO.save(note2);


                notificationDTO notificationDTO = new notificationDTO(
                        note2.getId(),
                        new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(), request.getCustomer().getEmail(), request.getCustomer().getFirstName(), request.getCustomer().getLastName(), request.getCustomer().getRating(), request.getCustomer().getTotalRides()),
                        new notificationpersonDTO(o.getDriver().getId(), o.getDriver().getUserName(), o.getDriver().getEmail(), o.getDriver().getFirstName(), o.getDriver().getLastName(), o.getDriver().getRating(), o.getDriver().getTotalRides()),
                        note2.getStatus(),
                        note2.getCreatedAt(),
                        note2.getUpdatedAt(),
                        note2.getMessage(),
                        note2.getTitle(),
                        null,
                        o.getId(),
                        request.getId(),
                        0.0,
                        null

                );

                notificationService.sendNotification(o.getDriver().getUserName(), notificationDTO);
            }
        }



        List<Fahrer> drivers = userDAO.findalldrivers().stream().filter(d -> !others.contains(d)).collect(Collectors.toList());

        for (Fahrer driver : drivers) {
            notification note = new notification(
                    request.getCustomer(),
                    driver,
                    "deleted Ride Request!!",
                    "deleted Ride Request!!",
                    request
            );

            notificationDTO notificationDTO = new notificationDTO(
                    note.getId(),
                    new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(),request.getCustomer().getEmail(),request.getCustomer().getFirstName(),request.getCustomer().getLastName(),request.getCustomer().getRating(),request.getCustomer().getTotalRides()),
                    new notificationpersonDTO(driver.getId(), driver.getUserName(),driver.getEmail(),driver.getFirstName(),driver.getLastName(),driver.getRating(),driver.getTotalRides()),
                    note.getStatus(),
                    note.getCreatedAt(),
                    note.getUpdatedAt(),
                    note.getMessage(),
                    note.getTitle(),
                    null,
                    0,
                    request.getId(),
                    0.0,
                    null

            );
            notificationService.sendNotification(driver.getUserName(), notificationDTO);

        }


        rideRequestDAO.save(request);
    }


    public List<rideResponseDTO> getAllactiverideRequests() {
        List<rideRequest> rideRequestList = rideRequestDAO.findAll().stream().filter(request -> request.getStatus().equals(RequestStatus.Active)).toList();
        List<rideResponseDTO> rideResponseDTOS = new ArrayList<>();
        for (rideRequest request : rideRequestList) {
            String driverUserName = " ";
            String driverfullname = " ";
            if (request.getDriver() != null) {

                driverUserName = request.getDriver().getUserName();
                driverfullname = request.getDriver().getFirstName() + " " + request.getDriver().getLastName();
            }

            user user = userDAO.findByUserName(request.getCustomer().getUserName());



                Double rating = 0.0;
            if(user.getRating() != null){

              rating = user.getRating();
            }



            List<LatLng> zwischenstopsLatLng = new ArrayList<>();
            List<String> zwischenstopssaddress = new ArrayList<>();
            for (adress a : request.getZwischenstops()) {
                zwischenstopsLatLng.add(new LatLng(a.getLat(), a.getLng()));
                zwischenstopssaddress.add(a.getHouseNumberAndStreet() + " " +
                        a.getCity() + " " +
                        a.getState() + " " +
                        a.getZip() + " " +
                        a.getCountry());
            }


            rideResponseDTO response = new rideResponseDTO(
                    driverUserName,
                    request.getCarClass(),
                    request.getCreatedAt(),
                    request.getUpdatedAt(),
                    request.getStartAddress().getHouseNumberAndStreet() +
                            request.getStartAddress().getCity() + " " +
                            request.getStartAddress().getState() + " " +
                            request.getStartAddress().getZip() + " " +
                            request.getStartAddress().getCountry(),
                    new LatLng(request.getStartAddress().getLat(), request.getStartAddress().getLng()),
                    request.getDestAddress().getHouseNumberAndStreet() + " " +
                            request.getDestAddress().getCity() + " " +
                            request.getDestAddress().getState() + " " +
                            request.getDestAddress().getZip() + " " +
                            request.getDestAddress().getCountry(),
                    new LatLng(request.getDestAddress().getLat(), request.getDestAddress().getLng()),
                    rating,
                    request.getDrivererRating(),
                    request.getStatus(),
                    request.getId(),
                    driverfullname,
                    request.getCustomer().getFirstName() + " " + request.getCustomer().getLastName(),
                    request.getCustomer().getUserName(),
                    request.getDistance(),
                    request.getDuration(),
                    request.getCost(),
                    zwischenstopsLatLng,
                    zwischenstopssaddress
            );

            rideResponseDTOS.add(response);

        }

        return rideResponseDTOS;
    }





    public void updateRating(int rideRequestId, Double rating, String user) {


        rideRequest ride = rideRequestDAO.findbyid(rideRequestId);

        System.out.println(ride.getId());

        if (ride != null) {


            if (user.equals("Driver")) {

                ride.setDrivererRating(rating);
                rideRequestDAO.save(ride);
                System.out.println(rating);
                List<rideRequest> list = rideRequestDAO.findByDriver_Id(ride.getDriver().getId()).stream().filter(request -> request.getStatus().equals(RequestStatus.Completed)).toList();

                ride.getDriver().setTotalRides(list.size());
                Double totalRating = 0.0;
                int counter = 0;
                for (rideRequest r : list) {
                    if(r.getDrivererRating() > 0){
                        totalRating += r.getDrivererRating();
                        counter++;
                    }
                }
                ride.getDriver().setRating(totalRating/counter);
                ride.getDriver().setNumberOfRates(counter);

                userDAO.save(ride.getDriver());





            } else if (user.equals("Customer")) {

                ride.setCustomerRating(rating);
                rideRequestDAO.save(ride);
                System.out.println(rating);

                List<rideRequest> list = rideRequestDAO.findByCustomerId(ride.getCustomer().getId()).stream().filter(request -> request.getStatus().equals(RequestStatus.Completed)).toList();

                ride.getCustomer().setTotalRides(list.size());
                Double totalRating = 0.0;
                int counter = 0;
                for (rideRequest r : list) {
                    if(r.getCustomerRating() > 0){
                        totalRating += r.getCustomerRating();
                        counter++;
                    }
                }
                ride.getCustomer().setRating(totalRating/counter);
                ride.getCustomer().setNumberOfRates(counter);

                userDAO.save(ride.getCustomer());
            }

        }


    }





    // 1) Driver makes an offer:
    @Transactional
    public DriverOffer makeOffer(Integer requestId, String driverUsername) {
        rideRequest request = rideRequestDAO.findById(requestId)
                .orElseThrow(() -> new resourceNotFoundException("RideRequest not found"));

        Fahrer driver = (Fahrer) userDAO.findByUserName(driverUsername);
        // prevent duplicate pending offer
        driverOfferDAO.findByRideRequestIdAndDriverIdAndStatus(requestId, driver.getId(), OfferStatus.PENDING)
                .ifPresent(o -> { throw new RuntimeException("You already offered"); });


        List<DriverOffer> penndingoffers = driverOfferDAO.findByDriver(driver).stream().filter(driverOffer -> driverOffer.getStatus().equals(OfferStatus.PENDING)).toList();

        if(penndingoffers.size() > 0){
            throw new RuntimeException("You already offered");
        }

        DriverOffer offer = new DriverOffer(request, driver);
        driverOfferDAO.save(offer);

        // compute driver stats
        double totalDistance = rideRequestDAO.findByDriver_Id(driver.getId()).stream()
                .filter(r -> r.getStatus() == RequestStatus.Completed)
                .mapToDouble(rideRequest::getDistance).sum();

        // 3) persistent notification
        notification note = new notification(
                driver,
                request.getCustomer(),
                "Driver " + driver.getFirstName()+" "+ driver.getLastName() + " has offered on your ride",
                "New Ride Offer",
                request
        );
        notificationDAO.save(note);

        String driverUserName = " ";
        String driverfullname = " ";
        if (request.getDriver() != null) {

            driverUserName = request.getDriver().getUserName();
            driverfullname = request.getDriver().getFirstName() + " " + request.getDriver().getLastName();
        }

        user user = userDAO.findByUserName(request.getCustomer().getUserName());



        Double rating = 0.0;
        if(user.getRating() != null){

            rating = user.getRating();
        }



        List<LatLng> zwischenstopsLatLng = new ArrayList<>();
        List<String> zwischenstopssaddress = new ArrayList<>();
        for (adress a : request.getZwischenstops()) {
            zwischenstopsLatLng.add(new LatLng(a.getLat(), a.getLng()));
            zwischenstopssaddress.add(a.getHouseNumberAndStreet() + " " +
                    a.getCity() + " " +
                    a.getState() + " " +
                    a.getZip() + " " +
                    a.getCountry());
        }


        rideResponseDTO response = new rideResponseDTO(
                driverUserName,
                request.getCarClass(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                request.getStartAddress().getHouseNumberAndStreet() +
                        request.getStartAddress().getCity() + " " +
                        request.getStartAddress().getState() + " " +
                        request.getStartAddress().getZip() + " " +
                        request.getStartAddress().getCountry(),
                new LatLng(request.getStartAddress().getLat(), request.getStartAddress().getLng()),
                request.getDestAddress().getHouseNumberAndStreet() + " " +
                        request.getDestAddress().getCity() + " " +
                        request.getDestAddress().getState() + " " +
                        request.getDestAddress().getZip() + " " +
                        request.getDestAddress().getCountry(),
                new LatLng(request.getDestAddress().getLat(), request.getDestAddress().getLng()),
                rating,
                request.getDrivererRating(),
                request.getStatus(),
                request.getId(),
                driverfullname,
                request.getCustomer().getFirstName() + " " + request.getCustomer().getLastName(),
                request.getCustomer().getUserName(),
                request.getDistance(),
                request.getDuration(),
                request.getCost(),
                zwischenstopsLatLng,
                zwischenstopssaddress
        );


        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                new notificationpersonDTO(driver.getId(), driver.getUserName(),driver.getEmail(),driver.getFirstName(),driver.getLastName(),driver.getRating(),driver.getTotalRides()),
                new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(),request.getCustomer().getEmail(),request.getCustomer().getFirstName(),request.getCustomer().getLastName(),request.getCustomer().getRating(),request.getCustomer().getTotalRides()),
                note.getStatus(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getMessage(),
                note.getTitle(),
                response,
                offer.getId(),
                requestId,
                totalDistance,
                null

        );
        notificationService.sendNotification(request.getCustomer().getUserName(), notificationDTO);

        return offer;
    }



    // 2) Customer responds to an offer:
    @Transactional
    public void respondToOffer(Integer offerId, boolean accepted) {
        var offer = driverOfferDAO.findById(offerId)
                .orElseThrow(() -> new resourceNotFoundException("Offer not found"));
        var request = offer.getRideRequest();

        // update statuses
        offer.setStatus(accepted ? OfferStatus.ACCEPTED : OfferStatus.REJECTED);
        driverOfferDAO.save(offer);

        if (accepted) {
            request.setDriver(offer.getDriver());
            request.setStatus(RequestStatus.Assigned); // ensure your enum has this
            rideRequestDAO.save(request);

            // reject all other pending offers
            var others = driverOfferDAO.findByRideRequestId(request.getId());
            for (var o : others) {
                if (o.getStatus() == OfferStatus.PENDING) {
                    o.setStatus(OfferStatus.REJECTED);
                    driverOfferDAO.save(o);


                    var note2 = new notification(
                            request.getCustomer(),
                            o.getDriver(),
                            "Your offer was rejected. "+request.getCustomer().getFirstName()+" "+request.getCustomer().getLastName()+"  has choose another driver. you can now make new offer for other Customers",
                            "Offer Rejected!!",
                            request
                    );
                    notificationDAO.save(note2);


                    notificationDTO notificationDTO = new notificationDTO(
                            note2.getId(),
                            new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(),request.getCustomer().getEmail(),request.getCustomer().getFirstName(),request.getCustomer().getLastName(),request.getCustomer().getRating(),request.getCustomer().getTotalRides()),
                            new notificationpersonDTO(o.getDriver().getId(), o.getDriver().getUserName(),o.getDriver().getEmail(),o.getDriver().getFirstName(),o.getDriver().getLastName(),o.getDriver().getRating(),o.getDriver().getTotalRides()),
                            note2.getStatus(),
                            note2.getCreatedAt(),
                            note2.getUpdatedAt(),
                            note2.getMessage(),
                            note2.getTitle(),
                            null,
                            o.getId(),
                            request.getId(),
                            0.0,
                            null

                    );

                    notificationService.sendNotification(o.getDriver().getUserName(), notificationDTO);
                }
            }
        }

        // notification
        var note = new notification(
                request.getCustomer(),
                offer.getDriver(),
                accepted ? "Your offer for "+request.getCustomer().getFirstName()+" "+request.getCustomer().getLastName()+" on ride Request number: "+ request.getId()+"   was accepted" : "Your offer for "+request.getCustomer().getFirstName()+" "+request.getCustomer().getLastName()+" on ride Request number: "+ request.getId()+"   was rejected",
                accepted ? "Offer Accepted!!" : "Offer Rejected!!",
                request
        );
        notificationDAO.save(note);



        notificationDTO notificationDTO = new notificationDTO(
                note.getId(),
                new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(),request.getCustomer().getEmail(),request.getCustomer().getFirstName(),request.getCustomer().getLastName(),request.getCustomer().getRating(),request.getCustomer().getTotalRides()),
                new notificationpersonDTO(offer.getDriver().getId(), offer.getDriver().getUserName(),offer.getDriver().getEmail(),offer.getDriver().getFirstName(),offer.getDriver().getLastName(),offer.getDriver().getRating(),offer.getDriver().getTotalRides()),
                note.getStatus(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getMessage(),
                note.getTitle(),
                null,
                offerId,
                request.getId(),
                0.0,
                null


        );

        notificationService.sendNotification(offer.getDriver().getUserName(), notificationDTO);
    }




    @Transactional
    public void CancelMyOffer(Integer rideId) {

        user currentuer = userDAO.findUserById(httpInterpreter.Interpreter().getId());

        rideRequest request = rideRequestDAO.findById(rideId).orElseThrow(() -> new resourceNotFoundException("Ride request not found"));

        DriverOffer offer = driverOfferDAO.findByRideRequestId(rideId).stream().filter(o -> o.getStatus() == OfferStatus.PENDING).findFirst().orElse(null);

        if(offer == null) {
            throw new resourceNotFoundException("Offer not found");
        }

        offer.setStatus(OfferStatus.CANCELLED);
        driverOfferDAO.save(offer);


        var note2 = new notification(
                offer.getDriver(),
                request.getCustomer(),
                offer.getDriver().getFirstName()+" "+offer.getDriver().getLastName() +"  has Cancelled his offer to your ride request with id: " + request.getId()+" ",
                "Offer Canceled!!",
                request
        );
        //notificationDAO.save(note2);


        notificationDTO notificationDTO = new notificationDTO(
                note2.getId(),
                new notificationpersonDTO(offer.getDriver().getId(), offer.getDriver().getUserName(),offer.getDriver().getEmail(),offer.getDriver().getFirstName(),offer.getDriver().getLastName(),offer.getDriver().getRating(),offer.getDriver().getTotalRides()),
                new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(),request.getCustomer().getEmail(),request.getCustomer().getFirstName(),request.getCustomer().getLastName(),request.getCustomer().getRating(),request.getCustomer().getTotalRides()),
                note2.getStatus(),
                note2.getCreatedAt(),
                note2.getUpdatedAt(),
                note2.getMessage(),
                note2.getTitle(),
                null,
                offer.getId(),
                request.getId(),
                0.0,
                null

        );

        notificationService.sendNotification(notificationDTO.receiver().userName(), notificationDTO);

    }






    @Transactional
    public void updateSimulation(Integer id, SimulationUpdatePayload update,boolean hasEnded) {
        rideRequest request = rideRequestDAO.findbyid(id);
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());

        if (hasEnded) {
            if(currentUser.equals(request.getCustomer())) {
                geldKontoService.sendMony(request.getDriver().getGeldKonto(), request.getCost(), request);
                request.setStatus(RequestStatus.Completed);
                rideRequestDAO.save(request);
               var Offer = driverOfferDAO.findByRideRequestId(id).stream().filter(o -> o.getStatus() == OfferStatus.ACCEPTED).findFirst().orElse(null);
               if(Offer != null) {
                   Offer.setStatus(OfferStatus.COMPLETED);
                   driverOfferDAO.save(Offer);
               }


                var endNote = new notification(
                        null,
                        null,
                        "The ride has been completed. Thank you for your ride!",
                        "Ride Completed!!",
                        request
                );

                notificationDTO noteDTO = new notificationDTO(
                        endNote.getId(),
                        null,
                        null,
                        endNote.getStatus(),
                        endNote.getCreatedAt(),
                        endNote.getUpdatedAt(),
                        endNote.getMessage(),
                        endNote.getTitle(),
                        null,
                        0,
                        request.getId(),
                        0.0,
                        update


                );

                this.notificationService.sendNotification(request.getDriver().getUserName(), noteDTO);
                this.notificationService.sendNotification(request.getCustomer().getUserName(), noteDTO);

            }


        } else {


            var drivernot = new notification(
                    request.getCustomer(),
                    request.getDriver(),
                    "the customer has just updated the simulation state",
                    "Simulation Update!!",
                    request
            );
            notificationDTO drivernotDTO = new notificationDTO(
                    drivernot.getId(),
                    new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(), request.getCustomer().getEmail(), request.getCustomer().getFirstName(), request.getCustomer().getLastName(), request.getCustomer().getRating(), request.getCustomer().getTotalRides()),
                    new notificationpersonDTO(request.getDriver().getId(), request.getDriver().getUserName(), request.getDriver().getEmail(), request.getDriver().getFirstName(), request.getDriver().getLastName(), request.getDriver().getRating(), request.getDriver().getTotalRides()),
                    drivernot.getStatus(),
                    drivernot.getCreatedAt(),
                    drivernot.getUpdatedAt(),
                    drivernot.getMessage(),
                    drivernot.getTitle(),
                    null,
                    0,
                    request.getId(),
                    0.0,
                    update


            );


            var customernot = new notification(
                    request.getDriver(),
                    request.getCustomer(),
                    "the driver has just updated the simulation state",
                    "Simulation Update!!",
                    request
            );
            notificationDTO customernotDTO = new notificationDTO(
                    customernot.getId(),
                    new notificationpersonDTO(request.getDriver().getId(), request.getDriver().getUserName(), request.getDriver().getEmail(), request.getDriver().getFirstName(), request.getDriver().getLastName(), request.getDriver().getRating(), request.getDriver().getTotalRides()),
                    new notificationpersonDTO(request.getCustomer().getId(), request.getCustomer().getUserName(), request.getCustomer().getEmail(), request.getCustomer().getFirstName(), request.getCustomer().getLastName(), request.getCustomer().getRating(), request.getCustomer().getTotalRides()),
                    customernot.getStatus(),
                    customernot.getCreatedAt(),
                    customernot.getUpdatedAt(),
                    customernot.getMessage(),
                    customernot.getTitle(),
                    null,
                    0,
                    request.getId(),
                    0.0,
                    update


            );

            this.notificationService.sendNotification(request.getDriver().getUserName(), drivernotDTO);
            this.notificationService.sendNotification(request.getCustomer().getUserName(), customernotDTO);
        }

    }


    public void refreshSimulation(Integer id) {
        rideRequest request = rideRequestDAO.findbyid(id);
        user currentUser = userDAO.findUserById(httpInterpreter.Interpreter().getId());
        String username = request.getDriver().getUserName();
        if (currentUser.equals(request.getDriver())) {
            username = request.getCustomer().getUserName();
        }

        user reciever =  userDAO.findByUserName(username);

        var note = new notification(
                null,
                reciever,
                "refresh simulation",
                "Refresh!!",
                request
        );

        this.notificationService.sendNotification(username, new notificationDTO(
                note.getId(),
                null,
                new notificationpersonDTO(reciever.getId(), reciever.getUserName(), reciever.getEmail(), reciever.getFirstName(), reciever.getLastName(), reciever.getRating(), reciever.getTotalRides()),
                note.getStatus(),
                note.getCreatedAt(),
                note.getUpdatedAt(),
                note.getMessage(),
                note.getTitle(),
                null,
                0,
                request.getId(),
                0.0,
                null
        ));

    }



    @Transactional
    public void liveEdit(rideEditDto rideEditDto) {
        user customer = httpInterpreter.Interpreter();

        rideRequest aktiveRide = rideRequestDAO.findByCustomerId(customer.getId()).stream().filter(r -> r.getStatus().equals(RequestStatus.Assigned)).findFirst().orElse(null);

        if (aktiveRide == null) {
            throw new RuntimeException("Ride not found");
        }





//        List<adress> zwischenstops = new ArrayList<>();
//        for (LatLng a : rideEditDto.zwischenstops()) {
//            adress temp = new adress(a.getLat(), a.getLng());
//            zwischenstops.add(temp);
//
//        }
//
//        int i = 0;
//        for (String s : rideEditDto.zwischenstopssaddress()) {
//
//            adress a = zwischenstops.get(i);
//            String[] zwischenstopsparts = s.split("\\s*,\\s*");
//            a.setHouseNumberAndStreet(zwischenstopsparts[0] + ", " + zwischenstopsparts[1]);
//            a.setCountry(zwischenstopsparts[zwischenstopsparts.length - 1]);
//            a.setZip(zwischenstopsparts[zwischenstopsparts.length - 2]);
//            a.setState(zwischenstopsparts[zwischenstopsparts.length - 3]);
//            a.setCity(zwischenstopsparts[zwischenstopsparts.length - 4]);
//            i++;
//        }

        List<LatLng> dtoStops     = rideEditDto.zwischenstops();
        List<String> dtoAddresses = rideEditDto.zwischenstopssaddress();

// only loop up to the smaller of the two sizes
        int count = Math.min(dtoStops.size(), dtoAddresses.size());

        List<adress> zwischenstops = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            LatLng ll = dtoStops.get(i);
            String  s  = dtoAddresses.get(i);

            adress a = new adress(ll.getLat(), ll.getLng());

            String[] parts = s.split("\\s*,\\s*");
            if (parts.length >= 5) {
                a.setHouseNumberAndStreet(parts[0] + ", " + parts[1]);
                a.setCity(parts[parts.length - 4]);
                a.setState(parts[parts.length - 3]);
                a.setZip(parts[parts.length - 2]);
                a.setCountry(parts[parts.length - 1]);
            } else {
                // handle or log malformed addresses
            }

            zwischenstops.add(a);
        }



        adress destadress = new adress(rideEditDto.destination().getLat(), rideEditDto.destination().getLng());

        String[] parts2 = rideEditDto.destinationaddress().split("\\s*,\\s*");
        destadress.setHouseNumberAndStreet(parts2[0] + ", " + parts2[1]);
        destadress.setCountry(parts2[parts2.length - 1]);
        destadress.setZip(parts2[parts2.length - 2]);
        destadress.setState(parts2[parts2.length - 3]);
        destadress.setCity(parts2[parts2.length - 4]);


        adressDAO.save(destadress);

        List<adress> currentStops = aktiveRide.getZwischenstops();
        currentStops.clear();
        currentStops.addAll(zwischenstops);

        aktiveRide.setDestAddress(destadress);
        aktiveRide.setDuration(rideEditDto.duration());
        aktiveRide.setCost(rideEditDto.cost());
        aktiveRide.setDistance(rideEditDto.distance());

        rideRequestDAO.save(aktiveRide);

        user driver = aktiveRide.getDriver();

        notification drivernote = new notification(
                customer,
                driver,
                "Hello, "+customer.getFirstName()+" "+customer.getLastName()+ "\n"+".     have edited the live Simulation.",
                "Simulation Edited!!",
                aktiveRide
        );
        notificationDAO.save(drivernote);

        notificationDTO notificationDTO = new notificationDTO(
                drivernote.getId(),
                new notificationpersonDTO(customer.getId(), customer.getUserName(),customer.getEmail(),customer.getFirstName(),customer.getLastName(),customer.getRating(),customer.getTotalRides()),
                new notificationpersonDTO(driver.getId(), driver.getUserName(),driver.getEmail(),driver.getFirstName(),driver.getLastName(),driver.getRating(),driver.getTotalRides()),
                drivernote.getStatus(),
                drivernote.getCreatedAt(),
                drivernote.getUpdatedAt(),
                drivernote.getMessage(),
                drivernote.getTitle(),
                null,
                0,
                aktiveRide.getId(),
                0.0,
                null

        );
        notificationService.sendNotification(driver.getUserName(), notificationDTO);


        notification customernote = new notification(
                customer,
                driver,
                "your edit has been successfully Saved you can now complete your ride",
                "Simulation Edited is Implemented!!",
                aktiveRide
        );
        notificationDAO.save(customernote);

        notificationDTO notificationDTO2 = new notificationDTO(
                customernote.getId(),
                new notificationpersonDTO(driver.getId(), driver.getUserName(),driver.getEmail(),driver.getFirstName(),driver.getLastName(),driver.getRating(),driver.getTotalRides()),
                new notificationpersonDTO(customer.getId(), customer.getUserName(),customer.getEmail(),customer.getFirstName(),customer.getLastName(),customer.getRating(),customer.getTotalRides()),
                customernote.getStatus(),
                customernote.getCreatedAt(),
                customernote.getUpdatedAt(),
                customernote.getMessage(),
                customernote.getTitle(),
                null,
                0,
                aktiveRide.getId(),
                0.0,
                null

        );
        notificationService.sendNotification(customer.getUserName(), notificationDTO2);

    }


    @Transactional
    public void markAsPassed(Double lat, Double lng) {
        user current = httpInterpreter.Interpreter();
        rideRequest aktiveRide = rideRequestDAO.findByCustomerId(current.getId()).stream().filter(r -> r.getStatus().equals(RequestStatus.Assigned)).findFirst().orElse(null);

        if (aktiveRide == null) {
            throw new RuntimeException("No ride found for this ride");
        }

        List<adress> Stops = aktiveRide.getZwischenstops();



        for (adress stop : Stops) {

            Double stopLat3 = round3(stop.getLat().doubleValue());
            Double stopLng3 = round3(stop.getLng().doubleValue());
            Double targetLat3 = round3(lat);
            Double targetLng3 = round3(lng);

            if (stopLat3 == targetLat3 && stopLng3 == targetLng3) {
                stop.setIspassed(true);
                adressDAO.save(stop);
            }
        }

    }

    private Double round3(double value) {
        return Math.round(value * 1_000d) / 1_000d;
    }
}


